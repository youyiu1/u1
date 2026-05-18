/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("t_news")
public class News {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private String authorId;
    private String content;
    private String location;
    private Integer likes;
    private Integer commentsCount;
    private List<String> images;
    private Integer shares;
    private Integer collections;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}