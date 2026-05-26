/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("t_user")
public class User {
    @TableId(type = IdType.ASSIGN_ID)
    private String id;
    private String name;
    private String email;
    private String password;
    private String avatar;
    private String tag;
    private String bio;
    private Boolean isVerified;
    private Integer followersCount;
    private Integer followingCount;
    private Double rating;
    private Integer soldCount;
}