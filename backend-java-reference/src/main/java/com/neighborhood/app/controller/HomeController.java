/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.NewsService;
import com.neighborhood.app.service.MarketService;
import com.neighborhood.app.service.ServiceModuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeController {

    private final NewsService newsService;
    private final MarketService marketService;
    private final ServiceModuleService serviceModuleService;
    private final CacheService cacheService;

    @GetMapping("/index")
    public Result<Map<String, Object>> index() {
        // 先查缓存
        @SuppressWarnings("unchecked")
        Map<String, Object> cached = (Map<String, Object>) cacheService.getCachedHomeIndex();
        if (cached != null) {
            return Result.ok(cached);
        }

        // 缓存未命中，查询数据
        Map<String, Object> data = new HashMap<>();
        data.put("hotNews", newsService.list().stream().limit(2).toList());
        data.put("hotMarket", marketService.list().stream().limit(4).toList());
        data.put("hotServices", serviceModuleService.list().stream().limit(4).toList());

        // 存入缓存
        cacheService.cacheHomeIndex(data);

        return Result.ok(data);
    }
}