package com.neighborhood.app.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

/** 管理端系统请求参数。 */
public final class AdminSystemRequests {

    private AdminSystemRequests() {
    }

    public record CategoryCreateRequest(
            @NotBlank(message = "分类名称不能为空")
            @Size(max = 40, message = "分类名称不能超过40个字符")
            String name,

            @NotBlank(message = "分类类型不能为空")
            String type
    ) {
    }

    public record NotificationCreateRequest(
            @NotBlank(message = "通知对象不能为空")
            String target,

            List<String> userIds,

            @NotBlank(message = "通知标题不能为空")
            @Size(max = 80, message = "通知标题不能超过80个字符")
            String title,

            @NotBlank(message = "通知内容不能为空")
            @Size(max = 1000, message = "通知内容不能超过1000个字符")
            String content
    ) {
    }

    public record RoleUpdateRequest(
            @NotBlank(message = "角色名称不能为空")
            @Size(max = 60, message = "角色名称不能超过60个字符")
            String name,

            @Size(max = 300, message = "角色描述不能超过300个字符")
            String description,

            @NotBlank(message = "角色状态不能为空")
            String status,

            List<String> menuIds,

            List<String> permissionCodes
    ) {
    }
}
