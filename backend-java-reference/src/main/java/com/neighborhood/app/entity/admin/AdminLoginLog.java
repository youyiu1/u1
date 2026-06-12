package com.neighborhood.app.entity.admin;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Data;

/** 文件作用：管理端登录Log实体。 */
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
