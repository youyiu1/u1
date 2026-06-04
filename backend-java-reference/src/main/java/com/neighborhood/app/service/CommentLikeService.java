package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.content.CommentLike;

import java.util.Collection;
import java.util.Map;
import java.util.Set;

public interface CommentLikeService extends IService<CommentLike> {
    /** 评论点赞。 */
    boolean like(Long commentId, String userId);

    /** 取消评论点赞。 */
    boolean unlike(Long commentId, String userId);

    /** 切换评论点赞状态，失败时返回 `null`。 */
    Boolean toggleLike(Long commentId, String userId);

    /** 查询用户是否已点赞评论。 */
    boolean isLiked(Long commentId, String userId);

    /** 统计评论点赞数。 */
    long countLikes(Long commentId);

    Map<Long, Long> countLikesByCommentIds(Collection<Long> commentIds);

    Set<Long> likedCommentIds(Collection<Long> commentIds, String userId);
}
