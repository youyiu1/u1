package com.neighborhood.app.service.impl;

import com.neighborhood.app.messaging.NotificationMessage;
import com.neighborhood.app.service.AsyncMessageDispatcher;
import com.neighborhood.app.service.NotificationDispatchService;
import com.neighborhood.app.service.NotificationWriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/** 通知分发服务实现。 */
@Service
@RequiredArgsConstructor
public class NotificationDispatchServiceImpl implements NotificationDispatchService {

    private static final String CHANNEL = "notification";

    private final AsyncMessageDispatcher asyncMessageDispatcher;
    private final NotificationWriteService notificationWriteService;

    @Value("${app.messaging.rabbit.notification-exchange}")
    private String notificationExchange;

    @Value("${app.messaging.rabbit.notification-routing-key}")
    private String notificationRoutingKey;

    @Override
    public void dispatchNotification(String userId, String title, String content, String serviceName) {
        dispatch(
                userId,
                title,
                content,
                serviceName,
                null,
                null,
                null,
                () -> notificationWriteService.saveNotification(userId, title, content, serviceName)
        );
    }

    @Override
    public void dispatchNotificationWithBooking(String userId, String title, String content, String serviceName, Long bookingId) {
        dispatch(
                userId,
                title,
                content,
                serviceName,
                bookingId,
                null,
                null,
                () -> notificationWriteService.saveNotificationWithBooking(userId, title, content, serviceName, bookingId)
        );
    }

    @Override
    public void dispatchNotificationWithMarketItem(
            String userId,
            String title,
            String content,
            String serviceName,
            String relatedUserId,
            Long marketItemId
    ) {
        dispatch(
                userId,
                title,
                content,
                serviceName,
                null,
                relatedUserId,
                marketItemId,
                () -> notificationWriteService.saveNotificationWithMarketItem(
                        userId,
                        title,
                        content,
                        serviceName,
                        relatedUserId,
                        marketItemId
                )
        );
    }

    private void dispatch(
            String userId,
            String title,
            String content,
            String serviceName,
            Long bookingId,
            String relatedUserId,
            Long marketItemId,
            Runnable fallback
    ) {
        NotificationMessage message = new NotificationMessage(
                userId,
                title,
                content,
                serviceName,
                bookingId,
                relatedUserId,
                marketItemId
        );
        asyncMessageDispatcher.dispatch(CHANNEL, notificationExchange, notificationRoutingKey, message, fallback);
    }
}
