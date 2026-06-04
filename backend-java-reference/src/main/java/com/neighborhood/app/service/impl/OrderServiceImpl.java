/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.extension.conditions.query.LambdaQueryChainWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.service.Order;
import com.neighborhood.app.mapper.service.OrderMapper;
import com.neighborhood.app.service.OrderService;
import com.neighborhood.app.utils.OrderBuildUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> implements OrderService {

    private static final String STATUS_CONFIRMED = "confirmed";
    private static final String STATUS_COMPLETED = "completed";
    private static final String STATUS_IN_PROGRESS = "in_progress";
    private static final String STATUS_CANCELLED = "cancelled";

    @Override
    public List<Order> listByUserId(String userId) {
        return userOrders(userId, null);
    }

    @Override
    public List<Order> listCompletedByUserId(String userId) {
        return userOrders(userId, STATUS_COMPLETED);
    }

    @Override
    public List<Order> listInProgressByUserId(String userId) {
        return userOrders(userId, STATUS_IN_PROGRESS);
    }

    @Override
    public boolean createFromBooking(Long bookingId, String buyerId, String sellerId, Long serviceId, String serviceTitle, String price, String bookingDate, String bookingTime, Integer duration) {
        Order order = OrderBuildUtil.buildConfirmedOrder(
                bookingId,
                buyerId,
                sellerId,
                serviceId,
                serviceTitle,
                new BigDecimal(price),
                LocalDateTime.parse(bookingDate),
                bookingTime,
                duration
        );
        return save(order);
    }

    @Override
    public boolean confirmOrder(Long orderId) {
        return updateOrderStatus(orderId, STATUS_CONFIRMED, STATUS_IN_PROGRESS, false);
    }

    @Override
    public boolean completeOrder(Long orderId) {
        return updateOrderStatus(orderId, STATUS_IN_PROGRESS, STATUS_COMPLETED, true);
    }

    @Override
    public boolean cancelOrder(Long orderId) {
        return lambdaUpdate()
                .eq(Order::getId, orderId)
                .ne(Order::getStatus, STATUS_COMPLETED)
                .ne(Order::getStatus, STATUS_CANCELLED)
                .set(Order::getStatus, STATUS_CANCELLED)
                .set(Order::getUpdateTime, LocalDateTime.now())
                .update();
    }

    private LambdaQueryChainWrapper<Order> userOrderQuery(String userId) {
        return lambdaQuery()
                .and(wrapper -> wrapper
                        .eq(Order::getBuyerId, userId)
                        .or()
                        .eq(Order::getSellerId, userId));
    }

    private List<Order> userOrders(String userId, String status) {
        LambdaQueryChainWrapper<Order> query = userOrderQuery(userId);
        if (status != null) {
            query.eq(Order::getStatus, status);
        }
        return query.orderByDesc(Order::getCreateTime).list();
    }

    private boolean updateOrderStatus(Long orderId, String currentStatus, String nextStatus, boolean completed) {
        var update = lambdaUpdate()
                .eq(Order::getId, orderId)
                .eq(Order::getStatus, currentStatus)
                .set(Order::getStatus, nextStatus)
                .set(Order::getUpdateTime, LocalDateTime.now());
        if (completed) {
            update.set(Order::getCompletedTime, LocalDateTime.now());
        }
        return update.update();
    }
}
