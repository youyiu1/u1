package com.neighborhood.app.entity.admin;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("t_admin_login_log")
public class AdminLoginLog {
    @TableId(type = IdType.AUTO)
    private Long id;
    @TableField("user_id")
    private String userId;
    private String username;
    private String ip;
    private String device;
    private String location;
    private String status;
    @TableField("fail_reason")
    private String failReason;
    @TableField("create_time")
    private LocalDateTime createTime;
}
