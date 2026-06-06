package com.neighborhood.app.entity.admin;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Data;

/** 文件作用：管理端操作Log实体。 */
@Data
@TableName("t_admin_operation_log")
public class AdminOperationLog {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String operator;
    @TableField("role_name")
    private String roleName;
    @TableField("action_name")
    private String actionName;
    private String target;
    private String ip;
    private String status;
    private String details;
    @TableField("create_time")
    private LocalDateTime createTime;
}
