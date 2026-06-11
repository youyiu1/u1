package com.neighborhood.app.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 管理端通用请求参数。 */
public final class AdminCommonRequests {

    private AdminCommonRequests() {
    }

    public record StatusRequest(
            @NotBlank(message = "状态不能为空")
            String status,

            @Size(max = 300, message = "拒绝原因不能超过300个字符")
            String rejectReason
    ) {
    }
}
