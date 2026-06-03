package com.neighborhood.app.service.impl;

import com.neighborhood.app.service.NotificationDispatchService;
import com.neighborhood.app.service.NotificationWriteService;
import com.neighborhood.app.service.AsyncMessageDispatcher;

import com.neighborhood.app.messaging.NotificationMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationDispatchServiceImpl implements NotificationDispatchService {

    private final AsyncMessageDispatcher asyncMessageDispatcher;
    private final NotificationWriteService notificationWriteService;

    @Value("${app.messaging.rabbit.notification-exchange}")
    private String notificationExchange;

    @Value("${app.messaging.rabbit.notification-routing-key}")
    private String notificationRoutingKey;

    public void dispatchNotification(String userId, String title, String content, String serviceName) {
        NotificationMessage message = new NotificationMessage(userId, title, content, serviceName, null);
        asyncMessageDispatcher.dispatch(
                "notification",
                notificationExchange,
                notificationRoutingKey,
                message,
                () -> notificationWriteService.saveNotification(userId, title, content, serviceName)
        );
    }

    public void dispatchNotificationWithBooking(String userId, String title, String content, String serviceName, Long bookingId) {
        NotificationMessage message = new NotificationMessage(userId, title, content, serviceName, bookingId);
        asyncMessageDispatcher.dispatch(
                "notification",
                notificationExchange,
                notificationRoutingKey,
                message,
                () -> notificationWriteService.saveNotificationWithBooking(userId, title, content, serviceName, bookingId)
        );
    }
}
