package com.neighborhood.app.entity.admin;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

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
