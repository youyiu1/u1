package com.neighborhood.app.dto.user;

import lombok.Data;

/** 文件作用：用户登录请求参数。 */
@Data
public class UserLoginRequest {
    private String email;
    private String password;
    private String captchaId;
    private String captchaCode;
}
