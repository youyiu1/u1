package com.neighborhood.app.service;

public interface AdminLogDispatchService {
    void dispatchLoginLog(String userId, String username, String ip, String device, String status, String failReason);
    void dispatchOperationLog(String operator, String role, String action, String target, String ip, String status, String details);
}