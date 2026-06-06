package com.neighborhood.app.dto.admin;

/** 文件作用：管理端用户请求参数。 */
public final class AdminUserRequests {

    private AdminUserRequests() {
    }

    public record BlacklistCreateRequest(
            String targetType,
            String targetValue,
            String reason,
            String creator
    ) {
    }

    public record UserAdminRoleRequest(
            String adminRole
    ) {
    }

    public record UserVerifiedRequest(
            String verified
    ) {
    }
}
