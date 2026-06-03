/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.market.MarketItem;
import com.neighborhood.app.vo.market.MarketItemVO;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.mapper.market.MarketMapper;
import com.neighborhood.app.mapper.user.UserMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.MarketService;
import com.neighborhood.app.utils.CacheLookupUtil;
import com.neighborhood.app.utils.StringValueUtil;
import com.neighborhood.app.utils.UserLookupUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarketServiceImpl extends ServiceImpl<MarketMapper, MarketItem> implements MarketService {

    private final CacheService cacheService;
    private final UserMapper userMapper;

    @Override
    public List<MarketItem> list() {
        return CacheLookupUtil.getOrLoad(
                cacheService::getCachedMarketList,
                () -> lambdaQuery()
                        .eq(MarketItem::getStatus, "active")
                        .orderByDesc(MarketItem::getId)
                        .list(),
                cacheService::cacheMarketList
        );
    }

    @Override
    public MarketItem getById(Long id) {
        return CacheLookupUtil.getOrLoad(
                () -> cacheService.getCachedMarketItem(id),
                () -> super.getById(id),
                item -> cacheService.cacheMarketItem(id, item)
        );
    }

    @Override
    public MarketItemVO getMarketItemVOById(Long id) {
        MarketItem item = getById(id);
        if (item == null || !"active".equals(StringValueUtil.emptyTo(item.getStatus(), "active"))) {
            return null;
        }
        User seller = UserLookupUtil.getById(cacheService, userMapper, item.getSellerId());
        return MarketItemVO.fromMarketItem(item, seller);
    }

    @Override
    public List<MarketItemVO> listVO() {
        List<MarketItem> items = list();
        if (items.isEmpty()) {
            return List.of();
        }
        // 批量获取卖家信息
        Map<String, User> userMap = UserLookupUtil.mapByExtractor(cacheService, userMapper, items, MarketItem::getSellerId);
        return items.stream()
                .map(item -> MarketItemVO.fromMarketItem(item, userMap.get(item.getSellerId())))
                .collect(Collectors.toList());
    }

    @Override
    public boolean save(MarketItem item) {
        item.setStatus("pending");
        item.setRejectReason("");
        item.setVerified(item.getVerified() != null && item.getVerified());
        item.setFreeShipping(item.getFreeShipping() != null && item.getFreeShipping());
        boolean result = super.save(item);
        if (result) {
            evictMarketCaches(null, true);
        }
        return result;
    }

    @Override
    public boolean updateById(MarketItem item) {
        boolean result = super.updateById(item);
        if (result) {
            evictMarketCaches(item.getId(), false);
        }
        return result;
    }

    @Override
    public List<MarketItemVO> listByUserId(String userId) {
        List<MarketItem> items = lambdaQuery()
                .eq(MarketItem::getSellerId, userId)
                .orderByDesc(MarketItem::getId)
                .list();
        if (items.isEmpty()) {
            return List.of();
        }
        User seller = UserLookupUtil.getById(cacheService, userMapper, userId);
        return items.stream()
                .map(item -> MarketItemVO.fromMarketItem(item, seller))
                .collect(Collectors.toList());
    }

    private void evictMarketCaches(Long itemId, boolean includeHome) {
        if (itemId == null) {
            cacheService.evictMarketList();
        } else {
            cacheService.evictMarketItem(itemId);
        }
        if (includeHome) {
            cacheService.evictHomeIndex();
        }
    }
}
