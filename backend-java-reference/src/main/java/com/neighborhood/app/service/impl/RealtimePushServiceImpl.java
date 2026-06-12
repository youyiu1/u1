package com.neighborhood.app.service.impl;

import com.neighborhood.app.entity.message.Message;
import com.neighborhood.app.entity.service.Notification;
import com.neighborhood.app.realtime.RealtimeEvent;
import com.neighborhood.app.service.RealtimePushService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/** WebSocket 实时推送服务实现。 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RealtimePushServiceImpl implements RealtimePushService {

    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void pushMessage(Message message) {
        if (message == null) {
            return;
        }
        sendToUser(message.getReceiverId(), "/queue/messages", RealtimeEvent.of("message.new", message));
        sendToUser(message.getSenderId(), "/queue/messages", RealtimeEvent.of("message.sent", message));
    }

    @Override
    public void pushNotification(Notification notification) {
        if (notification == null) {
            return;
        }
        sendToUser(notification.getUserId(), "/queue/notifications", RealtimeEvent.of("notification.new", notification));
    }

    private void sendToUser(String userId, String destination, Object payload) {
        if (userId == null || userId.isBlank()) {
            return;
        }
        try {
            messagingTemplate.convertAndSendToUser(userId, destination, payload);
        } catch (Exception exception) {
            log.warn("realtime push failed, userId={}, destination={}", userId, destination, exception);
        }
    }
}
