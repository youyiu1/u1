/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.entity.MarketItem;
import com.neighborhood.app.entity.MarketItemVO;
import com.neighborhood.app.service.MarketService;
import com.neighborhood.app.common.Result;
import com.neighborhood.app.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/market")
public class MarketController {

    @Autowired
    private MarketService marketService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

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
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Result.fail("未登录");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return Result.fail("Token无效");
        }
        String userId = jwtUtil.getUserIdFromToken(token);
        Object redisToken = redisTemplate.opsForValue().get("token:" + userId);
        if (redisToken == null || !token.equals(redisToken.toString())) {
            return Result.fail("Token已过期");
        }
        item.setSellerId(userId);
        return Result.ok(marketService.save(item));
    }
}