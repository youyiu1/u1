/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.common.SpringContext;
import com.neighborhood.app.entity.Booking;
import com.neighborhood.app.entity.Notification;
import com.neighborhood.app.entity.Order;
import com.neighborhood.app.mapper.NotificationMapper;
import com.neighborhood.app.mapper.BookingMapper;
import com.neighborhood.app.service.NotificationService;
import com.neighborhood.app.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl extends ServiceImpl<NotificationMapper, Notification> implements NotificationService {

    private static final int RETENTION_DAYS = 7;

    @Override
    public List<Notification> listByUserId(String userId) {
        return lambdaQuery()
                .eq(Notification::getUserId, userId)
                .orderByDesc(Notification::getTime)
                .list();
    }

    @Override
    public boolean markRead(Long id) {
        return lambdaUpdate()
                .eq(Notification::getId, id)
                .set(Notification::getIsRead, true)
                .update();
    }

    @Override
    public boolean markAllRead(String userId) {
        return lambdaUpdate()
                .eq(Notification::getUserId, userId)
                .set(Notification::getIsRead, true)
                .update();
    }

    @Override
    public void saveNotification(String userId, String title, String content, String serviceName) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setServiceName(serviceName);
        notification.setTime(LocalDateTime.now());
        notification.setIsRead(false);
        notification.setIsProcessed(false);
        save(notification);
    }

    @Override
    public void saveNotificationWithBooking(String userId, String title, String content, String serviceName, Long bookingId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setServiceName(serviceName);
        notification.setTime(LocalDateTime.now());
        notification.setIsRead(false);
        notification.setIsProcessed(false);
        notification.setRelatedBookingId(bookingId);
        save(notification);
        // 更新 booking 关联的通知ID
        if (bookingId != null) {
            BookingMapper bookingMapper = SpringContext.getBean(BookingMapper.class);
            bookingMapper.lambdaUpdate()
                .eq(Booking::getId, bookingId)
                .set(Booking::getNotificationId, notification.getId())
                .update();
        }
    }

    @Override
    public boolean processNotification(Long notificationId, boolean accept, String buyerId, String sellerId, Long serviceId, String serviceTitle, String price, String bookingDate, String bookingTime, Integer duration) {
        Notification notification = getById(notificationId);
        if (notification == null || notification.getIsProcessed()) {
            return false;
        }
        // 如果buyerId为空，从通知中获取（通知的userId就是买家）
        String actualBuyerId = (buyerId == null || buyerId.isEmpty()) ? notification.getUserId() : buyerId;
        // 如果serviceTitle为空，从通知的serviceName获取
        String actualServiceTitle = (serviceTitle == null || serviceTitle.isEmpty()) ? notification.getServiceName() : serviceTitle;
        // 如果price为空，设置为占位符
        BigDecimal actualPrice = (price == null || price.isEmpty()) ? BigDecimal.ZERO : new BigDecimal(price);
        // 如果duration为空，设置为1
        int actualDuration = (duration == null || duration == 0) ? 1 : duration;

        if (accept) {
            // 创建订单
            OrderService orderService = SpringContext.getBean(OrderService.class);
            Order order = new Order();
            order.setBookingId(notification.getRelatedBookingId());
            order.setBuyerId(actualBuyerId);
            order.setSellerId(sellerId);
            order.setServiceId(serviceId);
            order.setServiceTitle(actualServiceTitle);
            order.setPrice(actualPrice);
            order.setBookingDate(LocalDateTime.of(
                LocalDate.parse(bookingDate, DateTimeFormatter.ISO_LOCAL_DATE),
                LocalTime.parse(bookingTime, DateTimeFormatter.ISO_LOCAL_TIME)
            ));
            order.setBookingTime(bookingTime);
            order.setDuration(actualDuration);
            order.setStatus("confirmed");
            order.setCreateTime(LocalDateTime.now());
            order.setUpdateTime(LocalDateTime.now());
            orderService.save(order);
            // 更新通知
            lambdaUpdate()
                .eq(Notification::getId, notificationId)
                .set(Notification::getIsProcessed, true)
                .set(Notification::getOrderId, order.getId())
                .update();
            // 更新 booking 状态
            if (notification.getRelatedBookingId() != null) {
                BookingMapper bookingMapper = SpringContext.getBean(BookingMapper.class);
                bookingMapper.lambdaUpdate()
                    .eq(Booking::getId, notification.getRelatedBookingId())
                    .set(Booking::getStatus, "confirmed")
                    .update();
            }
            // 发送确认通知给买家
            Notification confirmNotification = new Notification();
            confirmNotification.setUserId(actualBuyerId);
            confirmNotification.setTitle("预约已确认");
            confirmNotification.setContent("您的服务预约「" + actualServiceTitle + "」已通过服务商确认，请按时到达。预约时间：" + bookingDate + " " + bookingTime);
            confirmNotification.setServiceName(actualServiceTitle);
            confirmNotification.setTime(LocalDateTime.now());
            confirmNotification.setIsRead(false);
            confirmNotification.setIsProcessed(true);
            save(confirmNotification);
        } else {
            // 拒绝：发送通知给买家
            lambdaUpdate()
                .eq(Notification::getId, notificationId)
                .set(Notification::getIsProcessed, true)
                .update();
            Notification rejectNotification = new Notification();
            rejectNotification.setUserId(actualBuyerId);
            rejectNotification.setTitle("预约被拒绝");
            rejectNotification.setContent("您的服务预约「" + actualServiceTitle + "」已被服务商拒绝，请尝试预约其他时间或服务。");
            rejectNotification.setServiceName(actualServiceTitle);
            rejectNotification.setTime(LocalDateTime.now());
            rejectNotification.setIsRead(false);
            rejectNotification.setIsProcessed(true);
            save(rejectNotification);
            // 更新 booking 状态
            if (notification.getRelatedBookingId() != null) {
                BookingMapper bookingMapper = SpringContext.getBean(BookingMapper.class);
                bookingMapper.lambdaUpdate()
                    .eq(Booking::getId, notification.getRelatedBookingId())
                    .set(Booking::getStatus, "cancelled")
                    .update();
            }
        }
        return true;
    }

    /**
     * 每天凌晨2点清理7天前的通知
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanExpiredNotifications() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(RETENTION_DAYS);
        lambdaUpdate()
                .lt(Notification::getTime, threshold)
                .remove();
    }
}