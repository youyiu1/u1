/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.MarketItem;
import com.neighborhood.app.vo.MarketItemVO;
import com.neighborhood.app.entity.User;
import com.neighborhood.app.mapper.MarketMapper;
import com.neighborhood.app.mapper.UserMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.MarketService;
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
        List<MarketItem> cached = cacheService.getCachedMarketList();
        if (cached != null) {
            return cached;
        }
        List<MarketItem> list = lambdaQuery()
                .eq(MarketItem::getStatus, "active")
                .orderByDesc(MarketItem::getId)
                .list();
        cacheService.cacheMarketList(list);
        return list;
    }

    @Override
    public MarketItem getById(Long id) {
        MarketItem cached = cacheService.getCachedMarketItem(id);
        if (cached != null) {
            return cached;
        }
        MarketItem item = super.getById(id);
        if (item != null) {
            cacheService.cacheMarketItem(id, item);
        }
        return item;
    }

    @Override
    public MarketItemVO getMarketItemVOById(Long id) {
        MarketItem item = getById(id);
        if (item == null || !"active".equals(emptyTo(item.getStatus(), "active"))) {
            return null;
        }
        User seller = userMapper.selectById(item.getSellerId());
        return MarketItemVO.fromMarketItem(item, seller);
    }

    @Override
    public List<MarketItemVO> listVO() {
        List<MarketItem> items = list();
        if (items.isEmpty()) {
            return List.of();
        }
        // 批量获取卖家信息
        List<String> sellerIds = items.stream()
                .map(MarketItem::getSellerId)
                .distinct()
                .collect(Collectors.toList());
        Map<String, User> userMap = userMapper.selectBatchIds(sellerIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
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
            cacheService.evictMarketList();
            cacheService.evictHomeIndex();
        }
        return result;
    }

    @Override
    public boolean updateById(MarketItem item) {
        boolean result = super.updateById(item);
        if (result) {
            cacheService.evictMarketItem(item.getId());
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
        User seller = userMapper.selectById(userId);
        return items.stream()
                .map(item -> MarketItemVO.fromMarketItem(item, seller))
                .collect(Collectors.toList());
    }

    private String emptyTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
