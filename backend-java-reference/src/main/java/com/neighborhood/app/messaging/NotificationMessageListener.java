package com.neighborhood.app.messaging;

import com.neighborhood.app.service.NotificationWriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** 通知消息监听器。 */
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.messaging.rabbit", name = "enabled", havingValue = "true")
public class NotificationMessageListener {

    private final NotificationWriteService notificationWriteService;

    @RabbitListener(queues = "${app.messaging.rabbit.notification-queue}")
    public void consume(NotificationMessage message) {
        if (message.getMarketItemId() != null) {
            notificationWriteService.saveNotificationWithMarketItem(
                    message.getUserId(),
                    message.getTitle(),
                    message.getContent(),
                    message.getServiceName(),
                    message.getRelatedUserId(),
                    message.getMarketItemId()
            );
            return;
        }
        if (message.getBookingId() == null) {
            notificationWriteService.saveNotification(
                    message.getUserId(),
                    message.getTitle(),
                    message.getContent(),
                    message.getServiceName()
            );
            return;
        }
        notificationWriteService.saveNotificationWithBooking(
                message.getUserId(),
                message.getTitle(),
                message.getContent(),
                message.getServiceName(),
                message.getBookingId()
        );
    }
}
