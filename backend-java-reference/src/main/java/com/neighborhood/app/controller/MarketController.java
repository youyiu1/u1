/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.entity.MarketItem;
import com.neighborhood.app.entity.MarketItemVO;
import com.neighborhood.app.service.MarketService;
import com.neighborhood.app.common.Result;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/market")
public class MarketController {

    @Autowired
    private MarketService marketService;

    @GetMapping("/list")
    public Result<List<MarketItemVO>> list() {
        return Result.ok(marketService.listVO());
    }

    /**
     * 获取用户商品列表
     */
    @GetMapping("/user/{userId}")
    public Result<List<MarketItemVO>> listByUserId(@PathVariable String userId) {
        return Result.ok(marketService.listByUserId(userId));
    }

    @GetMapping("/{id}")
    public Result<MarketItemVO> getById(@PathVariable Long id) {
        return Result.ok(marketService.getMarketItemVOById(id));
    }

    @PostMapping("/create")
    public Result<Boolean> create(@RequestBody MarketItem item, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        item.setSellerId(userId);
        return Result.ok(marketService.save(item));
    }
}