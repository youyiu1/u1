package com.neighborhood.app.service;

/** 文件作用：管理端Log分发服务接口。 */
public interface AdminLogDispatchService {
    void dispatchLoginLog(String userId, String username, String ip, String device, String status, String failReason);
    void dispatchOperationLog(String operator, String role, String action, String target, String ip, String status, String details);
}
