package com.neighborhood.app.service;

public interface NotificationDispatchService {
    void dispatchNotification(String userId, String title, String content, String serviceName);
    void dispatchNotificationWithBooking(String userId, String title, String content, String serviceName, Long bookingId);
}