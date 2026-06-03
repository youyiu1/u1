package com.neighborhood.app.dto.admin;

public final class AdminSecurityRequests {

    private AdminSecurityRequests() {
    }

    public record OperationLogCreateRequest(
            String operator,
            String role,
            String action,
            String target,
            String ip,
            String status,
            String details
    ) {
    }

    public record OperationLogRetentionRequest(
            String policy
    ) {
    }
}