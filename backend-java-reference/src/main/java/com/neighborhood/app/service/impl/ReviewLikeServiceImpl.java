/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.service.ReviewLike;
import com.neighborhood.app.entity.service.ServiceReview;
import com.neighborhood.app.mapper.service.ReviewLikeMapper;
import com.neighborhood.app.mapper.service.ServiceReviewMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.ReviewLikeService;
import com.neighborhood.app.utils.CounterSqlUtil;
import com.neighborhood.app.utils.SqlCollectionUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewLikeServiceImpl extends ServiceImpl<ReviewLikeMapper, ReviewLike> implements ReviewLikeService {

    private final CacheService cacheService;
    private final ServiceReviewMapper serviceReviewMapper;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public boolean like(Long reviewId, String userId) {
        try {
            boolean saved = save(buildReviewLike(reviewId, userId));
            if (!saved) {
                return false;
            }
            syncReviewLikeState(reviewId, userId, true);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    @Transactional
    public boolean unlike(Long reviewId, String userId) {
        int deleted = baseMapper.delete(reviewLikeQuery(reviewId, userId));
        if (deleted > 0) {
            syncReviewLikeState(reviewId, userId, false);
            return true;
        }
        return false;
    }

    @Override
    public List<ReviewLike> getLikesByReviewId(Long reviewId) {
        return lambdaQuery()
                .eq(ReviewLike::getReviewId, reviewId)
                .list();
    }

    @Override
    public boolean isLiked(Long reviewId, String userId) {
        if (cacheService.isReviewLiked(reviewId, userId)) {
            return true;
        }
        boolean liked = count(reviewLikeQuery(reviewId, userId)) > 0;
        if (liked) {
            cacheService.addReviewLike(reviewId, userId);
        }
        return liked;
    }

    @Override
    public Set<Long> likedReviewIds(Collection<Long> reviewIds, String userId) {
        List<Long> ids = SqlCollectionUtil.normalizePositiveLongIds(reviewIds);
        if (ids.isEmpty() || userId == null || userId.isBlank()) {
            return Set.of();
        }
        String sql = "SELECT review_id FROM t_review_like WHERE user_id = ? AND review_id IN (" +
                SqlCollectionUtil.placeholders(ids.size()) +
                ")";
        try {
            Set<Long> likedIds = jdbcTemplate.queryForList(sql, Long.class, SqlCollectionUtil.prependArg(userId, ids)).stream()
                    .filter(id -> id != null && id > 0)
                    .collect(Collectors.toSet());
            likedIds.forEach(id -> cacheService.addReviewLike(id, userId));
            return likedIds;
        } catch (Exception e) {
            return Set.of();
        }
    }

    private void updateReviewLikes(Long reviewId, int delta) {
        serviceReviewMapper.update(null, new LambdaUpdateWrapper<ServiceReview>()
                .eq(ServiceReview::getId, reviewId)
                .setSql(CounterSqlUtil.nonNegativeDelta("likes", delta)));
    }

    private void syncReviewLikeState(Long reviewId, String userId, boolean liked) {
        updateReviewLikes(reviewId, liked ? 1 : -1);
        if (liked) {
            cacheService.addReviewLike(reviewId, userId);
        } else {
            cacheService.removeReviewLike(reviewId, userId);
        }
    }

    private LambdaQueryWrapper<ReviewLike> reviewLikeQuery(Long reviewId, String userId) {
        return new LambdaQueryWrapper<ReviewLike>()
                .eq(ReviewLike::getReviewId, reviewId)
                .eq(ReviewLike::getUserId, userId);
    }

    private ReviewLike buildReviewLike(Long reviewId, String userId) {
        ReviewLike like = new ReviewLike();
        like.setReviewId(reviewId);
        like.setUserId(userId);
        return like;
    }
}
