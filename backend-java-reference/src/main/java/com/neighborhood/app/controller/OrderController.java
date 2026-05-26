/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.entity.Order;
import com.neighborhood.app.service.OrderService;
import com.neighborhood.app.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * 获取用户的订单列表
     */
    @GetMapping("/list")
    public Result<List<Order>> list(@RequestParam String userId) {
        return Result.ok(orderService.listByUserId(userId));
    }

    /**
     * 获取用户已完成的订单列表
     */
    @GetMapping("/list/completed")
    public Result<List<Order>> completedList(@RequestParam String userId) {
        return Result.ok(orderService.listCompletedByUserId(userId));
    }

    /**
     * 获取订单详情
     */
    @GetMapping("/{id}")
    public Result<Order> get(@PathVariable Long id) {
        return Result.ok(orderService.getById(id));
    }

    /**
     * 确认订单
     */
    @PostMapping("/{id}/confirm")
    public Result<Boolean> confirm(@PathVariable Long id) {
        return Result.ok(orderService.confirmOrder(id));
    }

    /**
     * 取消订单
     */
    @PostMapping("/{id}/cancel")
    public Result<Boolean> cancel(@PathVariable Long id) {
        return Result.ok(orderService.cancelOrder(id));
    }
}