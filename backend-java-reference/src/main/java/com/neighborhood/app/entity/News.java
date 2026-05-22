/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@TableName("t_news")
public class News {
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    private String authorId;
    private String title;      // 标题（可选，详情页显示）
    private String content;
    private String location;
    private String category;  // 分类：生活记录、同城发现、探店动态、邻里闲情、物业反馈
    private Integer likes;
    private Integer commentsCount;
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<String> images;

    public List<String> getImages() {
        if (images == null) {
            return new ArrayList<>();
        }
        return images;
    }
    private Integer shares;
    private Integer collections;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}