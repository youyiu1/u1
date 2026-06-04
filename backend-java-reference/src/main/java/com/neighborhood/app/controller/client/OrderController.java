package com.neighborhood.app.controller.client;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.common.ResultUtils;
import com.neighborhood.app.entity.service.Order;
import com.neighborhood.app.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /** 获取用户的订单列表。 */
    @GetMapping("/list")
    public Result<List<Order>> list(@RequestParam String userId) {
        return Result.ok(orderService.listByUserId(userId));
    }

    /** 获取用户已完成的订单列表。 */
    @GetMapping("/list/completed")
    public Result<List<Order>> completedList(@RequestParam String userId) {
        return Result.ok(orderService.listCompletedByUserId(userId));
    }

    /** 获取用户进行中的订单列表。 */
    @GetMapping("/list/in_progress")
    public Result<List<Order>> inProgressList(@RequestParam String userId) {
        return Result.ok(orderService.listInProgressByUserId(userId));
    }

    /** 获取订单详情。 */
    @GetMapping("/{id}")
    public Result<Order> get(@PathVariable Long id) {
        return Result.ok(orderService.getById(id));
    }

    /** 商家确认订单。 */
    @PostMapping("/{id}/confirm")
    public Result<Boolean> confirm(@PathVariable Long id) {
        return ResultUtils.bool(orderService.confirmOrder(id));
    }

    /** 用户确认服务完成。 */
    @PostMapping("/{id}/complete")
    public Result<Boolean> complete(@PathVariable Long id) {
        return ResultUtils.bool(orderService.completeOrder(id));
    }

    /** 取消订单。 */
    @PostMapping("/{id}/cancel")
    public Result<Boolean> cancel(@PathVariable Long id) {
        return ResultUtils.bool(orderService.cancelOrder(id));
    }
}
