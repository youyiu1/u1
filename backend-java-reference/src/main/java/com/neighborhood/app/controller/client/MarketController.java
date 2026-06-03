/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller.client;

import com.neighborhood.app.entity.market.MarketItem;
import com.neighborhood.app.vo.market.MarketItemVO;
import com.neighborhood.app.service.MarketService;
import com.neighborhood.app.common.Result;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class MarketController {

    private final MarketService marketService;

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
