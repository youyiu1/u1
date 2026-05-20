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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/market")
public class MarketController {

    @Autowired
    private MarketService marketService;

    @GetMapping("/list")
    public Result<List<MarketItemVO>> list() {
        return Result.ok(marketService.listVO());
    }

    @GetMapping("/{id}")
    public Result<MarketItemVO> getById(@PathVariable Long id) {
        return Result.ok(marketService.getMarketItemVOById(id));
    }

    @PostMapping("/create")
    public Result<Boolean> create(@RequestBody MarketItem item, HttpServletRequest request) {
        // 从request属性获取登录用户ID（AuthInterceptor设置）
        String userId = (String) request.getAttribute("userId");
        if (userId != null) {
            item.setSellerId(userId);
        }
        return Result.ok(marketService.save(item));
    }
}