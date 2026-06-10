package com.neighborhood.app.dto.admin;

/** 文件作用：管理端认证请求参数。 */
public final class AdminAuthRequests {

    private AdminAuthRequests() {
    }

    public record LoginRequest(
            String username,
            String password,
            String captchaId,
            String captchaCode
    ) {
    }
}
