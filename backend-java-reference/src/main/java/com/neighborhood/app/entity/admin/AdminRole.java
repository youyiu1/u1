package com.neighborhood.app.entity.admin;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Data;

/** 文件作用：管理端角色实体。 */
@Data
@TableName("t_admin_role")
public class AdminRole {
    @TableId
    private String id;
    private String name;
    private String code;
    private String description;
    private String status;
    @TableField("menu_ids")
    private String menuIds;
    @TableField("permission_codes")
    private String permissionCodes;
    @TableField("create_time")
    private LocalDateTime createTime;
    @TableField("update_time")
    private LocalDateTime updateTime;
}
