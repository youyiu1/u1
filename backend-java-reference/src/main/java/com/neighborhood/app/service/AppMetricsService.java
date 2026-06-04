package com.neighborhood.app.service;

public interface AppMetricsService {
    void recordHomeAccess(boolean cacheHit);
    void recordSearch(boolean cacheHit);
    void recordNotificationList(boolean cacheHit);
    void recordFileAccess(String action, String outcome);
}
