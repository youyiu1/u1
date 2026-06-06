package com.neighborhood.app.service;

/** 通知分发服务接口。 */
public interface NotificationDispatchService {
    void dispatchNotification(String userId, String title, String content, String serviceName);

    void dispatchNotificationWithBooking(String userId, String title, String content, String serviceName, Long bookingId);

    void dispatchNotificationWithMarketItem(
            String userId,
            String title,
            String content,
            String serviceName,
            String relatedUserId,
            Long marketItemId
    );
}
