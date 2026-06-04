package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.neighborhood.app.entity.service.Booking;
import com.neighborhood.app.entity.service.Notification;
import com.neighborhood.app.mapper.service.BookingMapper;
import com.neighborhood.app.mapper.service.NotificationMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.NotificationWriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationWriteServiceImpl implements NotificationWriteService {

    private final NotificationMapper notificationMapper;
    private final BookingMapper bookingMapper;
    private final CacheService cacheService;

    @Override
    @Transactional
    public void saveNotification(String userId, String title, String content, String serviceName) {
        notificationMapper.insert(createNotification(userId, title, content, serviceName, false, null));
        evictNotificationList(userId);
    }

    @Override
    @Transactional
    public void saveNotificationWithBooking(String userId, String title, String content, String serviceName, Long bookingId) {
        Notification notification = createNotification(userId, title, content, serviceName, false, bookingId);
        notificationMapper.insert(notification);
        updateBookingNotificationId(bookingId, notification.getId());
        evictNotificationList(userId);
    }

    @Override
    @Transactional
    public void saveProcessedNotification(String userId, String title, String content, String serviceName) {
        notificationMapper.insert(createNotification(userId, title, content, serviceName, true, null));
        evictNotificationList(userId);
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

    private void updateBookingNotificationId(Long bookingId, Long notificationId) {
        if (bookingId == null) {
            return;
        }
        bookingMapper.update(null, new LambdaUpdateWrapper<Booking>()
                .eq(Booking::getId, bookingId)
                .set(Booking::getNotificationId, notificationId));
    }

    private void evictNotificationList(String userId) {
        cacheService.evictNotificationList(userId);
    }
}
