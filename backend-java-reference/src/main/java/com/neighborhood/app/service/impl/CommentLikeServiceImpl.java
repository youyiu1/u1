package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.content.Comment;
import com.neighborhood.app.entity.content.CommentLike;
import com.neighborhood.app.mapper.content.CommentLikeMapper;
import com.neighborhood.app.mapper.content.CommentMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.CommentLikeService;
import com.neighborhood.app.utils.CounterSqlUtil;
import com.neighborhood.app.utils.ServiceExecutionUtil;
import com.neighborhood.app.utils.SqlCollectionUtil;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 文件作用：评论点赞服务实现。 */
@Service
@RequiredArgsConstructor
public class CommentLikeServiceImpl extends ServiceImpl<CommentLikeMapper, CommentLike> implements CommentLikeService {

    private final CacheService cacheService;
    private final JdbcTemplate jdbcTemplate;
    private final CommentMapper commentMapper;

    @Override
    @Transactional
    public boolean like(Long commentId, String userId) {
        return ServiceExecutionUtil.getOrDefault(() -> {
            if (!save(buildCommentLike(commentId, userId))) {
                return false;
            }
            syncCommentLikeState(commentId, userId, true);
            return true;
        }, false);
    }

    @Override
    @Transactional
    public boolean unlike(Long commentId, String userId) {
        int deleted = baseMapper.delete(commentLikeQuery(commentId, userId));
        if (deleted <= 0) {
            return false;
        }
        syncCommentLikeState(commentId, userId, false);
        return true;
    }

    @Override
    @Transactional
    public Boolean toggleLike(Long commentId, String userId) {
        return ServiceExecutionUtil.getOrDefault(() -> {
            int deleted = baseMapper.delete(commentLikeQuery(commentId, userId));
            if (deleted > 0) {
                syncCommentLikeState(commentId, userId, false);
                return false;
            }
            if (!save(buildCommentLike(commentId, userId))) {
                return null;
            }
            syncCommentLikeState(commentId, userId, true);
            return true;
        }, null);
    }

    @Override
    public boolean isLiked(Long commentId, String userId) {
        if (cacheService.isCommentLiked(commentId, userId)) {
            return true;
        }
        return ServiceExecutionUtil.getOrDefault(() -> {
            boolean liked = count(commentLikeQuery(commentId, userId)) > 0;
            syncCommentCache(commentId, userId, liked);
            return liked;
        }, false);
    }

    @Override
    public long countLikes(Long commentId) {
        return ServiceExecutionUtil.getOrDefault(
                () -> lambdaQuery()
                        .eq(CommentLike::getCommentId, commentId)
                        .count(),
                0L
        );
    }

    @Override
    public Map<Long, Long> countLikesByCommentIds(Collection<Long> commentIds) {
        List<Long> ids = SqlCollectionUtil.normalizePositiveLongIds(commentIds);
        if (ids.isEmpty()) {
            return Map.of();
        }
        String sql = "SELECT comment_id, COUNT(1) cnt FROM t_comment_like WHERE comment_id IN ("
                + SqlCollectionUtil.placeholders(ids.size())
                + ") GROUP BY comment_id";
        return ServiceExecutionUtil.getOrDefault(() -> {
            Map<Long, Long> counts = new LinkedHashMap<>();
            for (Map<String, Object> row : jdbcTemplate.queryForList(sql, ids.toArray())) {
                Number commentId = (Number) row.get("comment_id");
                Number count = (Number) row.get("cnt");
                if (commentId != null && count != null) {
                    counts.put(commentId.longValue(), count.longValue());
                }
            }
            return counts;
        }, Map.of());
    }

    @Override
    public Set<Long> likedCommentIds(Collection<Long> commentIds, String userId) {
        List<Long> ids = SqlCollectionUtil.normalizePositiveLongIds(commentIds);
        if (ids.isEmpty() || userId == null || userId.isBlank()) {
            return Set.of();
        }
        String sql = "SELECT comment_id FROM t_comment_like WHERE user_id = ? AND comment_id IN ("
                + SqlCollectionUtil.placeholders(ids.size())
                + ")";
        return ServiceExecutionUtil.getOrDefault(() -> {
            Set<Long> likedIds = jdbcTemplate.queryForList(sql, Long.class, SqlCollectionUtil.prependArg(userId, ids)).stream()
                    .filter(id -> id != null && id > 0)
                    .collect(Collectors.toSet());
            likedIds.forEach(id -> cacheService.addCommentLike(id, userId));
            return likedIds;
        }, Set.of());
    }

    private LambdaQueryWrapper<CommentLike> commentLikeQuery(Long commentId, String userId) {
        return new LambdaQueryWrapper<CommentLike>()
                .eq(CommentLike::getCommentId, commentId)
                .eq(CommentLike::getUserId, userId);
    }

    private CommentLike buildCommentLike(Long commentId, String userId) {
        CommentLike like = new CommentLike();
        like.setCommentId(commentId);
        like.setUserId(userId);
        return like;
    }

    private void updateCommentLikes(Long commentId, int delta) {
        commentMapper.update(null, new LambdaUpdateWrapper<Comment>()
                .eq(Comment::getId, commentId)
                .setSql(CounterSqlUtil.nonNegativeCoalescedDelta("likes", delta)));
    }

    private void syncCommentLikeState(Long commentId, String userId, boolean liked) {
        updateCommentLikes(commentId, liked ? 1 : -1);
        syncCommentCache(commentId, userId, liked);
    }

    private void syncCommentCache(Long commentId, String userId, boolean liked) {
        if (liked) {
            cacheService.addCommentLike(commentId, userId);
        } else {
            cacheService.removeCommentLike(commentId, userId);
        }
    }
}
