/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.ReviewLike;
import com.neighborhood.app.entity.ServiceReview;
import com.neighborhood.app.mapper.ReviewLikeMapper;
import com.neighborhood.app.service.ReviewLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewLikeServiceImpl extends ServiceImpl<ReviewLikeMapper, ReviewLike> implements ReviewLikeService {

    @Override
    public boolean like(Long reviewId, String userId) {
        if (isLiked(reviewId, userId)) {
            return false;
        }
        ReviewLike like = new ReviewLike();
        like.setReviewId(reviewId);
        like.setUserId(userId);
        save(like);
        lambdaUpdate()
            .eq(ServiceReview::getId, reviewId)
            .setSql("likes = likes + 1")
            .update();
        return true;
    }

    @Override
    public boolean unlike(Long reviewId, String userId) {
        lambdaQuery()
            .eq(ReviewLike::getReviewId, reviewId)
            .eq(ReviewLike::getUserId, userId)
            .remove();
        lambdaUpdate()
            .eq(ServiceReview::getId, reviewId)
            .setSql("likes = likes - 1")
            .update();
        return true;
    }

    @Override
    public java.util.List<ReviewLike> getLikesByReviewId(Long reviewId) {
        return lambdaQuery()
            .eq(ReviewLike::getReviewId, reviewId)
            .list();
    }

    @Override
    public boolean isLiked(Long reviewId, String userId) {
        return lambdaQuery()
            .eq(ReviewLike::getReviewId, reviewId)
            .eq(ReviewLike::getUserId, userId)
            .count() > 0;
    }
}