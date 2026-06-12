package com.neighborhood.app.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 管理端用户请求参数。 */
public final class AdminUserRequests {

    private AdminUserRequests() {
    }

    public record BlacklistCreateRequest(
            @NotBlank(message = "拉黑类型不能为空")
            String targetType,

            @NotBlank(message = "拉黑对象不能为空")
            @Size(max = 120, message = "拉黑对象不能超过120个字符")
            String targetValue,

            @NotBlank(message = "拉黑原因不能为空")
            @Size(max = 300, message = "拉黑原因不能超过300个字符")
            String reason,

            @Size(max = 60, message = "创建人不能超过60个字符")
            String creator
    ) {
    }

    public record UserAdminRoleRequest(
            @NotBlank(message = "管理员角色不能为空")
            String adminRole
    ) {
    }

    public record UserVerifiedRequest(
            @NotBlank(message = "认证状态不能为空")
            String verified
    ) {
    }
}
