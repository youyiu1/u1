/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.Comment;
import com.neighborhood.app.entity.CommentLike;
import com.neighborhood.app.mapper.CommentMapper;
import com.neighborhood.app.mapper.CommentLikeMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.CommentLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentLikeServiceImpl extends ServiceImpl<CommentLikeMapper, CommentLike> implements CommentLikeService {

    private final CacheService cacheService;
    private final JdbcTemplate jdbcTemplate;
    private final CommentMapper commentMapper;

    private void ensureLikeTableExists() {
        jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS t_comment_like (" +
                        "id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'comment like id'," +
                        "comment_id BIGINT NOT NULL COMMENT 'comment id'," +
                        "user_id VARCHAR(64) NOT NULL COMMENT 'user id'," +
                        "create_time DATETIME DEFAULT CURRENT_TIMESTAMP," +
                        "UNIQUE KEY uk_comment_user (comment_id, user_id)," +
                        "INDEX idx_comment_id (comment_id)," +
                        "INDEX idx_user_id (user_id)" +
                        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='comment like table'"
        );
    }

    @Override
    @Transactional
    public boolean like(Long commentId, String userId) {
        ensureLikeTableExists();
        if (isLiked(commentId, userId)) {
            return false;
        }
        try {
            CommentLike like = new CommentLike();
            like.setCommentId(commentId);
            like.setUserId(userId);
            boolean saved = save(like);
            if (!saved) {
                return false;
            }
            commentMapper.update(null, new LambdaUpdateWrapper<Comment>()
                    .eq(Comment::getId, commentId)
                    .setSql("likes = GREATEST(COALESCE(likes, 0) + 1, 0)"));
            cacheService.addCommentLike(commentId, userId);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    @Transactional
    public boolean unlike(Long commentId, String userId) {
        ensureLikeTableExists();
        int deleted = baseMapper.delete(
                new LambdaQueryWrapper<CommentLike>()
                        .eq(CommentLike::getCommentId, commentId)
                        .eq(CommentLike::getUserId, userId)
        );
        if (deleted <= 0) {
            return false;
        }
        commentMapper.update(null, new LambdaUpdateWrapper<Comment>()
                .eq(Comment::getId, commentId)
                .setSql("likes = GREATEST(COALESCE(likes, 0) - 1, 0)"));
        cacheService.removeCommentLike(commentId, userId);
        return true;
    }

    @Override
    public boolean isLiked(Long commentId, String userId) {
        ensureLikeTableExists();
        boolean liked = lambdaQuery()
                .eq(CommentLike::getCommentId, commentId)
                .eq(CommentLike::getUserId, userId)
                .count() > 0;
        if (liked) {
            cacheService.addCommentLike(commentId, userId);
        } else {
            cacheService.removeCommentLike(commentId, userId);
        }
        return liked;
    }

    @Override
    public long countLikes(Long commentId) {
        ensureLikeTableExists();
        return lambdaQuery()
                .eq(CommentLike::getCommentId, commentId)
                .count();
    }
}
