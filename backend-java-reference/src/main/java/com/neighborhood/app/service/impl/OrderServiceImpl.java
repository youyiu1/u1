/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.baomidou.mybatisplus.extension.conditions.query.LambdaQueryChainWrapper;
import com.neighborhood.app.entity.Order;
import com.neighborhood.app.mapper.OrderMapper;
import com.neighborhood.app.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> implements OrderService {

    @Override
    public List<Order> listByUserId(String userId) {
        return userOrderQuery(userId)
                .orderByDesc(Order::getCreateTime)
                .list();
    }

    @Override
    public List<Order> listCompletedByUserId(String userId) {
        return userOrderQuery(userId)
                .eq(Order::getStatus, "completed")
                .orderByDesc(Order::getCreateTime)
                .list();
    }

    @Override
    public List<Order> listInProgressByUserId(String userId) {
        return userOrderQuery(userId)
                .eq(Order::getStatus, "in_progress")
                .orderByDesc(Order::getCreateTime)
                .list();
    }

    @Override
    public Order getById(Long id) {
        return lambdaQuery()
                .eq(Order::getId, id)
                .one();
    }

    @Override
    public boolean createFromBooking(Long bookingId, String buyerId, String sellerId, Long serviceId, String serviceTitle, String price, String bookingDate, String bookingTime, Integer duration) {
        Order order = new Order();
        order.setBookingId(bookingId);
        order.setBuyerId(buyerId);
        order.setSellerId(sellerId);
        order.setServiceId(serviceId);
        order.setServiceTitle(serviceTitle);
        order.setPrice(new BigDecimal(price));
        order.setBookingDate(LocalDateTime.parse(bookingDate));
        order.setBookingTime(bookingTime);
        order.setDuration(duration);
        order.setStatus("confirmed");
        order.setCreateTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());
        return save(order);
    }

    @Override
    public boolean confirmOrder(Long orderId) {
        return lambdaUpdate()
                .eq(Order::getId, orderId)
                .set(Order::getStatus, "in_progress")
                .update();
    }

    @Override
    public boolean completeOrder(Long orderId) {
        return lambdaUpdate()
                .eq(Order::getId, orderId)
                .set(Order::getStatus, "completed")
                .set(Order::getCompletedTime, LocalDateTime.now())
                .update();
    }

    @Override
    public boolean cancelOrder(Long orderId) {
        return lambdaUpdate()
                .eq(Order::getId, orderId)
                .set(Order::getStatus, "cancelled")
                .update();
    }

    private LambdaQueryChainWrapper<Order> userOrderQuery(String userId) {
        return lambdaQuery()
                .and(wrapper -> wrapper
                        .eq(Order::getBuyerId, userId)
                        .or()
                        .eq(Order::getSellerId, userId));
    }
}
