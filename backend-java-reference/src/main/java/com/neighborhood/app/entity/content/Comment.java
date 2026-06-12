/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity.content;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import java.time.LocalDateTime;
import lombok.Data;

/** 文件作用：评论实体。 */
@Data
@TableName("t_comment")
public class Comment {
    @JsonSerialize(using = ToStringSerializer.class)
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    @JsonSerialize(using = ToStringSerializer.class)
    private Long newsId;

    @JsonSerialize(using = ToStringSerializer.class)
    private Long parentId;

    private String userId;
    private String userName;
    private String userAvatar;
    private String content;
    private Integer likes;
    private String status;

    @TableField(exist = false)
    private Boolean isLiked;

    private LocalDateTime createTime;
}
