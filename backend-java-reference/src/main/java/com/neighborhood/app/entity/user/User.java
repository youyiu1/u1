package com.neighborhood.app.entity.user;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

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
    @TableField("phone")
    private String phone;
    @TableField("region")
    private String region;
    @TableField("status")
    private String status;
    @TableField("push_enabled")
    private Boolean pushEnabled = true;
    @TableField("message_notify")
    private Boolean messageNotify = true;
    @TableField("follow_notify")
    private Boolean followNotify = true;
    @TableField("like_notify")
    private Boolean likeNotify = true;
    @TableField("comment_notify")
    private Boolean commentNotify = true;
    @TableField("system_notify")
    private Boolean systemNotify = false;
    private String profileVisible = "public";
    private String postsVisible = "public";
    private Boolean showLocation = true;
    private Double latitude;
    private Double longitude;
    @TableField("created_at")
    private LocalDateTime createdAt;
    @TableField("updated_at")
    private LocalDateTime updatedAt;
}
