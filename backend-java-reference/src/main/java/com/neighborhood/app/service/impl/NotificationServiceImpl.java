/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.Booking;
import com.neighborhood.app.entity.Notification;
import com.neighborhood.app.entity.Order;
import com.neighborhood.app.entity.ServiceEntity;
import com.neighborhood.app.mapper.BookingMapper;
import com.neighborhood.app.mapper.NotificationMapper;
import com.neighborhood.app.service.NotificationService;
import com.neighborhood.app.service.OrderService;
import com.neighborhood.app.service.ServiceModuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl extends ServiceImpl<NotificationMapper, Notification> implements NotificationService {

    private static final int RETENTION_DAYS = 7;
    private static final int DEFAULT_DURATION = 1;

    private final BookingMapper bookingMapper;
    private final OrderService orderService;
    private final ServiceModuleService serviceModuleService;

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
        save(createNotification(userId, title, content, serviceName, false, null));
    }

    @Override
    public void saveNotificationWithBooking(String userId, String title, String content, String serviceName, Long bookingId) {
        Notification notification = createNotification(userId, title, content, serviceName, false, bookingId);
        save(notification);
        if (bookingId != null) {
            updateBookingNotificationId(bookingId, notification.getId());
        }
    }

    @Override
    public boolean processNotification(Long notificationId, boolean accept, String buyerId, String sellerId, Long serviceId, String serviceTitle, String price, String bookingDate, String bookingTime, Integer duration) {
        Notification notification = getById(notificationId);
        if (notification == null || notification.getIsProcessed()) {
            return false;
        }

        Booking booking = findBooking(notification);
        ProcessContext context = resolveProcessContext(notification, booking, buyerId, sellerId, serviceId, serviceTitle, price, bookingDate, bookingTime, duration);
        if (!context.isValid()) {
            return false;
        }

        if (accept) {
            Order order = createConfirmedOrder(notification, context);
            orderService.save(order);
            markProcessed(notificationId, order.getId());
            updateBookingStatus(notification.getRelatedBookingId(), "confirmed");
            save(createNotification(
                    context.buyerId,
                    "预约已确认",
                    "您的服务预约「" + context.serviceTitle + "」已通过服务商确认，请按时到达。预约时间：" + context.bookingDate + " " + context.bookingTime,
                    context.serviceTitle,
                    true,
                    null
            ));
        } else {
            markProcessed(notificationId, null);
            save(createNotification(
                    context.buyerId,
                    "预约被拒绝",
                    "您的服务预约「" + context.serviceTitle + "」已被服务商拒绝，请尝试预约其他时间或服务。",
                    context.serviceTitle,
                    true,
                    null
            ));
            updateBookingStatus(notification.getRelatedBookingId(), "cancelled");
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

    private Notification createNotification(String userId, String title, String content, String serviceName, boolean processed, Long bookingId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setServiceName(serviceName);
        notification.setTime(LocalDateTime.now());
        notification.setIsRead(false);
        notification.setIsProcessed(processed);
        notification.setRelatedBookingId(bookingId);
        return notification;
    }

    private Booking findBooking(Notification notification) {
        Long bookingId = notification.getRelatedBookingId();
        return bookingId == null ? null : bookingMapper.selectById(bookingId);
    }

    private ProcessContext resolveProcessContext(
            Notification notification,
            Booking booking,
            String buyerId,
            String sellerId,
            Long serviceId,
            String serviceTitle,
            String price,
            String bookingDate,
            String bookingTime,
            Integer duration) {
        Long actualServiceId = booking != null && booking.getServiceId() != null ? booking.getServiceId() : serviceId;
        ServiceEntity service = actualServiceId == null ? null : serviceModuleService.getById(actualServiceId);

        String actualBuyerId = booking != null ? booking.getBuyerId() : buyerId;
        String actualSellerId = booking != null ? booking.getSellerId() : sellerId;
        String actualServiceTitle = service != null ? service.getTitle() : firstNonBlank(serviceTitle, notification.getServiceName());
        BigDecimal actualPrice = service != null && service.getPrice() != null ? service.getPrice() : parsePrice(price);
        String actualBookingDate = booking != null && booking.getBookingDate() != null ? booking.getBookingDate().toLocalDate().toString() : bookingDate;
        String actualBookingTime = booking != null ? booking.getBookingTime() : bookingTime;
        int actualDuration = booking != null && booking.getDuration() != null ? booking.getDuration() : normalizeDuration(duration);

        return new ProcessContext(
                actualBuyerId,
                actualSellerId,
                actualServiceId,
                actualServiceTitle,
                actualPrice,
                actualBookingDate,
                actualBookingTime,
                actualDuration
        );
    }

    private Order createConfirmedOrder(Notification notification, ProcessContext context) {
        Order order = new Order();
        order.setBookingId(notification.getRelatedBookingId());
        order.setBuyerId(context.buyerId);
        order.setSellerId(context.sellerId);
        order.setServiceId(context.serviceId);
        order.setServiceTitle(context.serviceTitle);
        order.setPrice(context.price);
        order.setBookingDate(LocalDateTime.of(
                LocalDate.parse(context.bookingDate, DateTimeFormatter.ISO_LOCAL_DATE),
                LocalTime.parse(context.bookingTime, DateTimeFormatter.ISO_LOCAL_TIME)
        ));
        order.setBookingTime(context.bookingTime);
        order.setDuration(context.duration);
        order.setStatus("confirmed");
        order.setCreateTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());
        return order;
    }

    private void markProcessed(Long notificationId, Long orderId) {
        var update = lambdaUpdate()
                .eq(Notification::getId, notificationId)
                .set(Notification::getIsProcessed, true);
        if (orderId != null) {
            update.set(Notification::getOrderId, orderId);
        }
        update.update();
    }

    private void updateBookingNotificationId(Long bookingId, Long notificationId) {
        com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<Booking> wrapper =
                new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<>();
        wrapper.eq(Booking::getId, bookingId).set(Booking::getNotificationId, notificationId);
        bookingMapper.update(null, wrapper);
    }

    private void updateBookingStatus(Long bookingId, String status) {
        if (bookingId == null) {
            return;
        }
        com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<Booking> wrapper =
                new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<>();
        wrapper.eq(Booking::getId, bookingId)
                .set(Booking::getStatus, status)
                .set(Booking::getUpdateTime, LocalDateTime.now());
        bookingMapper.update(null, wrapper);
    }

    private String firstNonBlank(String preferred, String fallback) {
        return preferred == null || preferred.isEmpty() ? fallback : preferred;
    }

    private BigDecimal parsePrice(String price) {
        return price == null || price.isEmpty() ? BigDecimal.ZERO : new BigDecimal(price);
    }

    private int normalizeDuration(Integer duration) {
        return duration == null || duration == 0 ? DEFAULT_DURATION : duration;
    }

    private record ProcessContext(
            String buyerId,
            String sellerId,
            Long serviceId,
            String serviceTitle,
            BigDecimal price,
            String bookingDate,
            String bookingTime,
            int duration) {
        private boolean isValid() {
            return buyerId != null && sellerId != null && serviceId != null && bookingDate != null && bookingTime != null;
        }
    }
}
