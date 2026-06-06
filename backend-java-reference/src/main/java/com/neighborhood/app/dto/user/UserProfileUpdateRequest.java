package com.neighborhood.app.dto.user;

import lombok.Data;

/** 文件作用：用户资料更新参数。 */
@Data
public class UserProfileUpdateRequest {
    private String name;
    private String avatar;
    private String tag;
    private String bio;
    private String phone;
    private String region;
}
