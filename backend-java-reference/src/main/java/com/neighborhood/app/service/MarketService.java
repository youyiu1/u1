/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.MarketItem;
import com.neighborhood.app.mapper.MarketMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketService extends ServiceImpl<MarketMapper, MarketItem> {

    private final CacheService cacheService;

    @Override
    public List<MarketItem> list() {
        // 先查缓存
        List<MarketItem> cached = cacheService.getCachedMarketList();
        if (cached != null) {
            return cached;
        }
        // 缓存未命中，查数据库
        List<MarketItem> list = super.list();
        cacheService.cacheMarketList(list);
        return list;
    }

    public MarketItem getById(Long id) {
        // 先查缓存
        MarketItem cached = (MarketItem) cacheService.getCachedMarketItem(id);
        if (cached != null) {
            return cached;
        }
        // 缓存未命中，查数据库
        MarketItem item = super.getById(id);
        if (item != null) {
            cacheService.cacheMarketItem(id, item);
        }
        return item;
    }

    @Override
    public boolean save(MarketItem item) {
        boolean result = super.save(item);
        if (result) {
            cacheService.evictMarketItem(item.getId());
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
}