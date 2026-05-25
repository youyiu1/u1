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

@Data
@TableName("t_comment")
public class Comment {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private Long newsId;
    private String userId;
    private String userName;
    private String userAvatar;
    private String content;
    private Integer likes;
    private LocalDateTime createTime;

    public Comment() {}

    public Comment(Long newsId, String userId, String userName, String userAvatar, String content) {
        this.newsId = newsId;
        this.userId = userId;
        this.userName = userName;
        this.userAvatar = userAvatar;
        this.content = content;
        this.createTime = LocalDateTime.now();
    }
}