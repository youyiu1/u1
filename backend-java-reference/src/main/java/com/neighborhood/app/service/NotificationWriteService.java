package com.neighborhood.app.service;

public interface NotificationWriteService {
    void saveNotification(String userId, String title, String content, String serviceName);
    void saveNotificationWithBooking(String userId, String title, String content, String serviceName, Long bookingId);
    void saveProcessedNotification(String userId, String title, String content, String serviceName);
}