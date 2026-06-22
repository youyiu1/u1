package com.neighborhood.app.controller.client;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.common.ResultUtils;
import com.neighborhood.app.entity.service.Order;
import com.neighborhood.app.service.OrderService;
import com.neighborhood.app.utils.RequestUserUtil;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.function.BiPredicate;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 用户端订单接口。 */
@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class OrderController {

    private static final String STATUS_CONFIRMED = "confirmed";
    private static final String STATUS_IN_PROGRESS = "in_progress";
    private static final String STATUS_COMPLETED = "completed";
    private static final String STATUS_CANCELLED = "cancelled";

    private final OrderService orderService;

    @GetMapping("/list")
    public Result<List<Order>> list(HttpServletRequest request) {
        return Result.ok(orderService.listByUserId(RequestUserUtil.currentUserId(request)));
    }

    @GetMapping("/list/completed")
    public Result<List<Order>> completedList(HttpServletRequest request) {
        return Result.ok(orderService.listCompletedByUserId(RequestUserUtil.currentUserId(request)));
    }

    @GetMapping("/list/in_progress")
    public Result<List<Order>> inProgressList(HttpServletRequest request) {
        return Result.ok(orderService.listInProgressByUserId(RequestUserUtil.currentUserId(request)));
    }

    @GetMapping("/{id}")
    public Result<Order> get(@PathVariable Long id, HttpServletRequest request) {
        Order order = orderService.getById(id);
        if (order == null) {
            return Result.fail("订单不存在");
        }
        if (!ownsOrder(order, RequestUserUtil.currentUserId(request))) {
            return Result.fail("无权访问该订单");
        }
        return Result.ok(order);
    }

    @PostMapping("/{id}/confirm")
    public Result<Boolean> confirm(@PathVariable Long id, HttpServletRequest request) {
        return updateOrder(
                id,
                request,
                this::canConfirm,
                () -> orderService.confirmOrder(id),
                "仅服务提供方可确认待确认订单"
        );
    }

    @PostMapping("/{id}/complete")
    public Result<Boolean> complete(@PathVariable Long id, HttpServletRequest request) {
        return updateOrder(
                id,
                request,
                this::canComplete,
                () -> orderService.completeOrder(id),
                "仅下单用户可完成进行中的订单"
        );
    }

    @PostMapping("/{id}/cancel")
    public Result<Boolean> cancel(@PathVariable Long id, HttpServletRequest request) {
        return updateOrder(
                id,
                request,
                this::canCancel,
                () -> orderService.cancelOrder(id),
                "当前订单状态不允许取消"
        );
    }

    private Result<Boolean> updateOrder(
            Long id,
            HttpServletRequest request,
            BiPredicate<Order, String> validator,
            Supplier<Boolean> action,
            String invalidMessage
    ) {
        Order order = orderService.getById(id);
        if (order == null) {
            return Result.fail("订单不存在");
        }
        String userId = RequestUserUtil.currentUserId(request);
        if (!ownsOrder(order, userId)) {
            return Result.fail("无权操作该订单");
        }
        if (!validator.test(order, userId)) {
            return Result.fail(invalidMessage);
        }
        return ResultUtils.bool(action.get());
    }

    private boolean ownsOrder(Order order, String userId) {
        return userId != null && (userId.equals(order.getBuyerId()) || userId.equals(order.getSellerId()));
    }

    private boolean canConfirm(Order order, String userId) {
        return userId.equals(order.getSellerId()) && STATUS_CONFIRMED.equals(order.getStatus());
    }

    private boolean canComplete(Order order, String userId) {
        return userId.equals(order.getBuyerId()) && STATUS_IN_PROGRESS.equals(order.getStatus());
    }

    private boolean canCancel(Order order, String userId) {
        return userId != null
                && !STATUS_COMPLETED.equals(order.getStatus())
                && !STATUS_CANCELLED.equals(order.getStatus());
    }
}
