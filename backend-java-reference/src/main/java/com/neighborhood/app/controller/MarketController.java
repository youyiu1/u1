/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.entity.MarketItem;
import com.neighborhood.app.service.MarketService;
import com.neighborhood.app.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/market")
public class MarketController {

    @Autowired
    private MarketService marketService;

    @GetMapping("/list")
    public Result<List<MarketItem>> list() {
        return Result.ok(marketService.list());
    }

    @GetMapping("/{id}")
    public Result<MarketItem> getById(@PathVariable Long id) {
        return Result.ok(marketService.getById(id));
    }

    @PostMapping("/create")
    public Result<Boolean> create(@RequestBody MarketItem item) {
        return Result.ok(marketService.save(item));
    }
}