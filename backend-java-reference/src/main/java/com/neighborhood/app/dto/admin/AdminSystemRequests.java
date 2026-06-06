package com.neighborhood.app.dto.admin;

import java.util.List;

/** 文件作用：管理端系统请求参数。 */
public final class AdminSystemRequests {

    private AdminSystemRequests() {
    }

    public record CategoryCreateRequest(
            String name,
            String type
    ) {
    }

    public record NotificationCreateRequest(
            String target,
            String title,
            String content
    ) {
    }

    public record RoleUpdateRequest(
            String name,
            String description,
            String status,
            List<String> menuIds,
            List<String> permissionCodes
    ) {
    }
}
