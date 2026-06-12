package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.neighborhood.app.entity.service.Booking;
import com.neighborhood.app.entity.service.Notification;
import com.neighborhood.app.mapper.service.BookingMapper;
import com.neighborhood.app.mapper.service.NotificationMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.NotificationWriteService;
import com.neighborhood.app.service.RealtimePushService;
import com.neighborhood.app.utils.TransactionCommitUtil;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 通知写入服务实现。 */
@Service
@RequiredArgsConstructor
public class NotificationWriteServiceImpl implements NotificationWriteService {

    private final NotificationMapper notificationMapper;
    private final BookingMapper bookingMapper;
    private final CacheService cacheService;
    private final RealtimePushService realtimePushService;

    @Override
    @Transactional
    public void saveNotification(String userId, String title, String content, String serviceName) {
        persistNotification(userId, title, content, serviceName, false, null, null, null);
    }

    @Override
    @Transactional
    public void saveNotificationWithBooking(String userId, String title, String content, String serviceName, Long bookingId) {
        persistNotification(userId, title, content, serviceName, false, bookingId, null, null);
    }

    @Override
    @Transactional
    public void saveNotificationWithMarketItem(
            String userId,
            String title,
            String content,
            String serviceName,
            String relatedUserId,
            Long marketItemId
    ) {
        persistNotification(userId, title, content, serviceName, false, null, relatedUserId, marketItemId);
    }

    @Override
    @Transactional
    public void saveProcessedNotification(String userId, String title, String content, String serviceName) {
        persistNotification(userId, title, content, serviceName, true, null, null, null);
    }

    private void persistNotification(
            String userId,
            String title,
            String content,
            String serviceName,
            boolean processed,
            Long bookingId,
            String relatedUserId,
            Long marketItemId
    ) {
        Notification notification = createNotification(
                userId,
                title,
                content,
                serviceName,
                processed,
                bookingId,
                relatedUserId,
                marketItemId
        );
        notificationMapper.insert(notification);
        if (bookingId != null && !processed) {
            updateBookingNotificationId(bookingId, notification.getId());
        }
        cacheService.evictNotificationList(userId);
        TransactionCommitUtil.runAfterCommitOrNow(() -> realtimePushService.pushNotification(notification));
    }

    private Notification createNotification(
            String userId,
            String title,
            String content,
            String serviceName,
            boolean processed,
            Long bookingId,
            String relatedUserId,
            Long marketItemId
    ) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setServiceName(serviceName);
        notification.setTime(LocalDateTime.now());
        notification.setIsRead(false);
        notification.setIsProcessed(processed);
        notification.setRelatedBookingId(bookingId);
        notification.setRelatedUserId(relatedUserId);
        notification.setRelatedMarketItemId(marketItemId);
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
}
