package com.neighborhood.app.entity.admin;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("t_admin_image_status")
public class AdminImageStatus {
    @TableId(type = IdType.AUTO)
    private Long id;
    @TableField("image_url")
    private String imageUrl;
    private String status;
}
