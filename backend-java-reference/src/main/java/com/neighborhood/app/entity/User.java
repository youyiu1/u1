/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;

@Data
@TableName("t_user")
public class User {
    @TableId(type = IdType.ASSIGN_ID)
    private String id;
    private String name;
    private String email;
    private String password;
    @TableField("admin_role")
    private String adminRole;
    private String avatar;
    private String tag;
    private String bio;
    private Boolean isVerified;
    private Integer followersCount;
    private Integer followingCount;
    private Double rating;
    private Integer soldCount;
    // 隐私设置
    private String profileVisible = "public";  // public/friends
    private String postsVisible = "public";      // public/friends
    private Boolean showLocation = true;         // 是否显示位置
    private Double latitude;                      // 用户纬度
    private Double longitude;                    // 用户经度
}
