package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.market.MarketItem;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.mapper.market.MarketMapper;
import com.neighborhood.app.mapper.user.UserMapper;
import com.neighborhood.app.service.AppMetricsService;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.MarketService;
import com.neighborhood.app.utils.CacheLookupUtil;
import com.neighborhood.app.utils.EntityDefaultsUtil;
import com.neighborhood.app.utils.StringValueUtil;
import com.neighborhood.app.utils.UserLookupUtil;
import com.neighborhood.app.vo.market.MarketItemVO;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** 文件作用：闲置商品服务实现。 */
@Service
@RequiredArgsConstructor
public class MarketServiceImpl extends ServiceImpl<MarketMapper, MarketItem> implements MarketService {

    private static final String ACTIVE_STATUS = "active";
    private static final String PENDING_STATUS = "pending";
    private static final String REJECTED_STATUS = "rejected";
    private static final String SOLD_STATUS = "sold";

    private final CacheService cacheService;
    private final UserMapper userMapper;
    private final AppMetricsService appMetricsService;

    @Override
    public List<MarketItem> list() {
        return CacheLookupUtil.getOrLoadWithMetrics(
                cacheService::getCachedMarketList,
                () -> lambdaQuery()
                        .eq(MarketItem::getStatus, ACTIVE_STATUS)
                        .orderByDesc(MarketItem::getId)
                        .list(),
                cacheService::cacheMarketList,
                appMetricsService,
                "market",
                "list"
        );
    }

    @Override
    public MarketItem getById(Long id) {
        return CacheLookupUtil.getOrLoadWithMetrics(
                () -> cacheService.getCachedMarketItem(id),
                () -> super.getById(id),
                result -> cacheService.cacheMarketItem(id, result),
                appMetricsService,
                "market",
                "detail"
        );
    }

    @Override
    public MarketItemVO getMarketItemVOById(Long id) {
        return getMarketItemVOById(id, null);
    }

    @Override
    public MarketItemVO getMarketItemVOById(Long id, String viewerUserId) {
        MarketItem item = getById(id);
        String status = item == null ? null : StringValueUtil.emptyTo(item.getStatus(), ACTIVE_STATUS);
        if (item == null || !canViewDetail(item, status, viewerUserId)) {
            return null;
        }
        User seller = UserLookupUtil.getById(cacheService, userMapper, item.getSellerId());
        return toMarketItemVO(item, seller);
    }

    @Override
    public List<MarketItemVO> listVO() {
        List<MarketItem> items = list();
        if (items.isEmpty()) {
            return List.of();
        }
        Map<String, User> userMap = UserLookupUtil.mapByExtractor(cacheService, userMapper, items, MarketItem::getSellerId);
        return items.stream()
                .map(item -> toMarketItemVO(item, userMap.get(item.getSellerId())))
                .collect(Collectors.toList());
    }

    @Override
    public boolean save(MarketItem item) {
        EntityDefaultsUtil.initPendingMarketItem(item);
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
            evictMarketCaches(item.getId(), true);
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
                .map(item -> toMarketItemVO(item, seller))
                .collect(Collectors.toList());
    }

    private MarketItemVO toMarketItemVO(MarketItem item, User seller) {
        return MarketItemVO.fromMarketItem(item, seller);
    }

    private boolean canViewDetail(MarketItem item, String status, String viewerUserId) {
        if (ACTIVE_STATUS.equals(status) || SOLD_STATUS.equals(status)) {
            return true;
        }
        return isOwnerViewingSelfItem(item, status, viewerUserId);
    }

    private boolean isOwnerViewingSelfItem(MarketItem item, String status, String viewerUserId) {
        if (viewerUserId == null || viewerUserId.isBlank() || item.getSellerId() == null) {
            return false;
        }
        if (!viewerUserId.equals(item.getSellerId())) {
            return false;
        }
        return PENDING_STATUS.equals(status) || REJECTED_STATUS.equals(status);
    }

    private void evictMarketCaches(Long itemId, boolean includeHome) {
        cacheService.evictMarketList();
        if (itemId != null) {
            cacheService.evictMarketItem(itemId);
        }
        if (includeHome) {
            cacheService.evictHomeIndex();
        }
    }
}
