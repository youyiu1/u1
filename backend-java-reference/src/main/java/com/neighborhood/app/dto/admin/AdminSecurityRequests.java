package com.neighborhood.app.dto.admin;

/** 文件作用：管理端安全请求参数。 */
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
