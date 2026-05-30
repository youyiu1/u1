/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.ReviewLike;
import com.neighborhood.app.entity.ServiceReview;
import com.neighborhood.app.mapper.ReviewLikeMapper;
import com.neighborhood.app.mapper.ServiceReviewMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.ReviewLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewLikeServiceImpl extends ServiceImpl<ReviewLikeMapper, ReviewLike> implements ReviewLikeService {

    private final CacheService cacheService;
    private final ServiceReviewMapper serviceReviewMapper;

    @Override
    @Transactional
    public boolean like(Long reviewId, String userId) {
        if (isLiked(reviewId, userId)) {
            return false;
        }
        try {
            ReviewLike like = new ReviewLike();
            like.setReviewId(reviewId);
            like.setUserId(userId);
            save(like);
            updateReviewLikes(reviewId, 1);
            cacheService.addReviewLike(reviewId, userId);
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
            updateReviewLikes(reviewId, -1);
            cacheService.removeReviewLike(reviewId, userId);
            return true;
        }
        return false;
    }

    @Override
    public java.util.List<ReviewLike> getLikesByReviewId(Long reviewId) {
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

    private void updateReviewLikes(Long reviewId, int delta) {
        String expression = delta > 0 ? "likes = likes + 1" : "likes = GREATEST(likes - 1, 0)";
        serviceReviewMapper.update(null, new LambdaUpdateWrapper<ServiceReview>()
                .eq(ServiceReview::getId, reviewId)
                .setSql(expression));
    }

    private LambdaQueryWrapper<ReviewLike> reviewLikeQuery(Long reviewId, String userId) {
        return new LambdaQueryWrapper<ReviewLike>()
                .eq(ReviewLike::getReviewId, reviewId)
                .eq(ReviewLike::getUserId, userId);
    }
}
