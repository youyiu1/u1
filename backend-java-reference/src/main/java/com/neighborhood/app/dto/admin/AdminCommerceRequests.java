package com.neighborhood.app.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** 管理端交易服务请求参数。 */
public final class AdminCommerceRequests {

    private AdminCommerceRequests() {
    }

    public record CancelOrderRequest(
            @Size(max = 300, message = "取消原因不能超过300个字符")
            String reason
    ) {
    }

    public record ServiceCreateRequest(
            @NotBlank(message = "服务标题不能为空")
            @Size(max = 80, message = "服务标题不能超过80个字符")
            String title,

            @NotBlank(message = "服务描述不能为空")
            @Size(max = 1000, message = "服务描述不能超过1000个字符")
            String description,

            @NotBlank(message = "服务分类不能为空")
            String category,

            @NotNull(message = "价格不能为空")
            Object price,

            @NotBlank(message = "计价单位不能为空")
            String unit,

            String status,

            @Size(max = 60, message = "服务区域不能超过60个字符")
            String area,

            @Size(max = 30, message = "联系电话不能超过30个字符")
            String phone
    ) {
    }
}
