/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("t_news")
public class News {
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    private String authorId;
    private String title;
    private String content;
    private String location;
    private String category;
    private Integer likes;
    private Integer commentsCount;
    private String images;
    private String status;
    private String rejectReason;
    private Integer shares;
    private Integer collections;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
