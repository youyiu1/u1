/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.service.Order;
import java.util.List;

public interface OrderService extends IService<Order> {
    List<Order> listByUserId(String userId);
    List<Order> listCompletedByUserId(String userId);
    List<Order> listInProgressByUserId(String userId);
    boolean createFromBooking(Long bookingId, String buyerId, String sellerId, Long serviceId, String serviceTitle, String price, String bookingDate, String bookingTime, Integer duration);
    boolean confirmOrder(Long orderId);
    boolean completeOrder(Long orderId);
    boolean cancelOrder(Long orderId);
}
