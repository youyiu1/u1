package com.neighborhood.app.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 管理端安全请求参数。 */
public final class AdminSecurityRequests {

    private AdminSecurityRequests() {
    }

    public record OperationLogCreateRequest(
            @NotBlank(message = "操作人不能为空")
            @Size(max = 60, message = "操作人不能超过60个字符")
            String operator,

            @Size(max = 60, message = "角色不能超过60个字符")
            String role,

            @NotBlank(message = "操作动作不能为空")
            @Size(max = 120, message = "操作动作不能超过120个字符")
            String action,

            @Size(max = 120, message = "操作对象不能超过120个字符")
            String target,

            @Size(max = 64, message = "IP不能超过64个字符")
            String ip,

            @Size(max = 30, message = "状态不能超过30个字符")
            String status,

            @Size(max = 1000, message = "详情不能超过1000个字符")
            String details
    ) {
    }

    public record OperationLogRetentionRequest(
            @NotBlank(message = "保留策略不能为空")
            String policy
    ) {
    }
}
