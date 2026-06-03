package com.neighborhood.app.service.impl;

import com.neighborhood.app.service.AdminLogDispatchService;
import com.neighborhood.app.service.AdminLogWriteService;
import com.neighborhood.app.service.AsyncMessageDispatcher;

import com.neighborhood.app.messaging.AdminLogMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminLogDispatchServiceImpl implements AdminLogDispatchService {

    private final AsyncMessageDispatcher asyncMessageDispatcher;
    private final AdminLogWriteService adminLogWriteService;

    @Value("${app.messaging.rabbit.admin-log-exchange}")
    private String adminLogExchange;

    @Value("${app.messaging.rabbit.admin-log-routing-key}")
    private String adminLogRoutingKey;

    public void dispatchLoginLog(String userId, String username, String ip, String device, String status, String failReason) {
        AdminLogMessage message = AdminLogMessage.login(userId, username, ip, device, status, failReason);
        asyncMessageDispatcher.dispatch(
                "admin_log",
                adminLogExchange,
                adminLogRoutingKey,
                message,
                () -> adminLogWriteService.saveLoginLog(message)
        );
    }

    public void dispatchOperationLog(String operator, String role, String action, String target, String ip, String status, String details) {
        AdminLogMessage message = AdminLogMessage.operation(operator, role, action, target, ip, status, details);
        asyncMessageDispatcher.dispatch(
                "admin_log",
                adminLogExchange,
                adminLogRoutingKey,
                message,
                () -> adminLogWriteService.saveOperationLog(message)
        );
    }
}
