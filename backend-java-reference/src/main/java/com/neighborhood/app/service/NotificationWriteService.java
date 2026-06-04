package com.neighborhood.app.service;

public interface NotificationWriteService {
    /** 保存普通通知。 */
    void saveNotification(String userId, String title, String content, String serviceName);

    /** 保存并关联预约通知。 */
    void saveNotificationWithBooking(String userId, String title, String content, String serviceName, Long bookingId);

    /** 保存已处理结果通知。 */
    void saveProcessedNotification(String userId, String title, String content, String serviceName);
}
