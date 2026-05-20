/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.MarketItem;
import com.neighborhood.app.mapper.MarketMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.MarketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketServiceImpl extends ServiceImpl<MarketMapper, MarketItem> implements MarketService {

    private final CacheService cacheService;

    @Override
    public List<MarketItem> list() {
        List<MarketItem> cached = cacheService.getCachedMarketList();
        if (cached != null) {
            return cached;
        }
        List<MarketItem> list = super.list();
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