package com.neighborhood.app.service;

/** 通知写入服务接口。 */
public interface NotificationWriteService {
    void saveNotification(String userId, String title, String content, String serviceName);

    void saveNotificationWithBooking(String userId, String title, String content, String serviceName, Long bookingId);

    void saveNotificationWithMarketItem(
            String userId,
            String title,
            String content,
            String serviceName,
            String relatedUserId,
            Long marketItemId
    );

    void saveProcessedNotification(String userId, String title, String content, String serviceName);
}
