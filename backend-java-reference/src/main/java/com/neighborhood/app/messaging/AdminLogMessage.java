package com.neighborhood.app.messaging;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminLogMessage {

    public static final String TYPE_LOGIN = "LOGIN";
    public static final String TYPE_OPERATION = "OPERATION";

    private String type;
    private String userId;
    private String username;
    private String device;
    private String failReason;
    private String operator;
    private String role;
    private String action;
    private String target;
    private String details;
    private String ip;
    private String status;

    public static AdminLogMessage login(String userId, String username, String ip, String device, String status, String failReason) {
        return new AdminLogMessage(TYPE_LOGIN, userId, username, device, failReason, null, null, null, null, null, ip, status);
    }

    public static AdminLogMessage operation(String operator, String role, String action, String target, String ip, String status, String details) {
        return new AdminLogMessage(TYPE_OPERATION, null, null, null, null, operator, role, action, target, details, ip, status);
    }
}
