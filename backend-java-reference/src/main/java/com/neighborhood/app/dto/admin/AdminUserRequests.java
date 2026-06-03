package com.neighborhood.app.dto.admin;

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