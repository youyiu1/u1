package com.neighborhood.app.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 管理端认证请求参数。 */
public final class AdminAuthRequests {

    private AdminAuthRequests() {
    }

    public record LoginRequest(
            @NotBlank(message = "账号不能为空")
            String username,

            @NotBlank(message = "密码不能为空")
            String password,

            @NotBlank(message = "验证码标识不能为空")
            String captchaId,

            @NotBlank(message = "图形验证码不能为空")
            @Size(min = 4, max = 4, message = "图形验证码格式不正确")
            String captchaCode
    ) {
    }
}
