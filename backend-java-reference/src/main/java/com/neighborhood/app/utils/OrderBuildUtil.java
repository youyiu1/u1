/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.utils;

import com.neighborhood.app.entity.service.Order;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/** 文件作用：订单构建工具。 */
public final class OrderBuildUtil {

    private OrderBuildUtil() {
    }

    public static Order buildConfirmedOrder(
            Long bookingId,
            String buyerId,
            String sellerId,
            Long serviceId,
            String serviceTitle,
            BigDecimal price,
            LocalDateTime bookingDate,
            String bookingTime,
            Integer duration
    ) {
        LocalDateTime now = LocalDateTime.now();

        Order order = new Order();
        order.setBookingId(bookingId);
        order.setBuyerId(buyerId);
        order.setSellerId(sellerId);
        order.setServiceId(serviceId);
        order.setServiceTitle(serviceTitle);
        order.setPrice(price);
        order.setBookingDate(bookingDate);
        order.setBookingTime(bookingTime);
        order.setDuration(duration);
        order.setStatus("confirmed");
        order.setCreateTime(now);
        order.setUpdateTime(now);
        return order;
    }
}
