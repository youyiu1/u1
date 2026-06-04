package com.neighborhood.app.service;

public interface AppMetricsService {
    void recordContentAccess(String module, String operation, boolean cacheHit);
    void recordHomeAccess(boolean cacheHit);
    void recordSearch(boolean cacheHit);
    void recordNotificationList(boolean cacheHit);
    void recordFileAccess(String action, String outcome);
    void recordMessageDispatch(String channel, String mode, boolean success);
}
