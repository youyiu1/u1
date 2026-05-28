/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.CommentLike;

public interface CommentLikeService extends IService<CommentLike> {
    /**
     * 评论点赞。
     */
    boolean like(Long commentId, String userId);

    /**
     * 取消评论点赞。
     */
    boolean unlike(Long commentId, String userId);

    /**
     * 查询用户是否已点赞评论。
     */
    boolean isLiked(Long commentId, String userId);

    /**
     * 统计评论点赞总数。
     */
    long countLikes(Long commentId);
}
