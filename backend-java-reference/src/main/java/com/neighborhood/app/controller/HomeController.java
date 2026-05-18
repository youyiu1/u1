/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.service.NewsService;
import com.neighborhood.app.service.MarketService;
import com.neighborhood.app.service.ServiceModuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/home")
public class HomeController {

    @Autowired
    private NewsService newsService;

    @Autowired
    private MarketService marketService;

    @Autowired
    private ServiceModuleService serviceModuleService;

    @GetMapping("/index")
    public Result<Map<String, Object>> index() {
        Map<String, Object> data = new HashMap<>();
        data.put("hotNews", newsService.listDesc().stream().limit(2).toList());
        data.put("hotMarket", marketService.list().stream().limit(4).toList());
        data.put("hotServices", serviceModuleService.list().stream().limit(4).toList());
        return Result.ok(data);
    }
}