/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity.content;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/** 文件作用：评论点赞实体。 */
@Data
@TableName("t_comment_like")
public class CommentLike {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private Long commentId;
    private String userId;
}
