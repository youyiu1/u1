package com.neighborhood.app.entity.admin;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Data;

/** 文件作用：管理端黑名单实体。 */
@Data
@TableName("t_admin_blacklist")
public class AdminBlacklist {
    @TableId(type = IdType.AUTO)
    private Long id;
    @TableField("target_type")
    private String targetType;
    @TableField("target_value")
    private String targetValue;
    private String reason;
    private String creator;
    @TableField("create_time")
    private LocalDateTime createTime;
}
