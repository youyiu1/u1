/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.service.ServiceReview;
import com.neighborhood.app.mapper.service.ServiceReviewMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.ReviewLikeService;
import com.neighborhood.app.service.ServiceReviewService;
import com.neighborhood.app.utils.ServiceReviewResponseUtil;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

/** 文件作用：服务评价服务实现。 */
@Service
@RequiredArgsConstructor
public class ServiceReviewServiceImpl extends ServiceImpl<ServiceReviewMapper, ServiceReview> implements ServiceReviewService {

    private final ReviewLikeService reviewLikeService;
    private final JdbcTemplate jdbcTemplate;
    private final CacheService cacheService;

    @Override
    public List<ServiceReview> getByServiceId(Long serviceId) {
        return lambdaQuery()
                .eq(ServiceReview::getServiceId, serviceId)
                .eq(ServiceReview::getStatus, "normal")
                .orderByDesc(ServiceReview::getCreateTime)
                .list();
    }

    @Override
    public List<Map<String, Object>> getByServiceIdWithLikeStatus(Long serviceId, String userId) {
        List<ServiceReview> reviews = getByServiceId(serviceId);
        if (reviews.isEmpty()) {
            return List.of();
        }
        Set<Long> likedReviewIds = reviewLikeService.likedReviewIds(reviews.stream()
                .map(ServiceReview::getId)
                .toList(), userId);
        return reviews.stream()
                .map(review -> ServiceReviewResponseUtil.toReviewResponse(review, likedReviewIds.contains(review.getId())))
                .toList();
    }

    @Override
    public boolean addReview(Long serviceId, String userId, String userName, String userAvatar, Integer rating, String content) {
        ServiceReview review = buildReview(serviceId, userId, userName, userAvatar, rating, content);
        boolean saved = save(review);
        if (saved) {
            evictServiceCaches(serviceId);
        }
        return saved;
    }

    @Override
    public boolean likeReview(Long reviewId, String userId) {
        return reviewLikeService.like(reviewId, userId);
    }

    @Override
    public boolean unlikeReview(Long reviewId, String userId) {
        return reviewLikeService.unlike(reviewId, userId);
    }

    @Override
    public void refreshServiceStats(Long serviceId) {
        if (serviceId == null || serviceId <= 0) {
            return;
        }
        jdbcTemplate.update("""
                UPDATE t_service
                SET reviews = (
                    SELECT COUNT(1)
                    FROM t_service_review
                    WHERE service_id = ? AND status = 'normal'
                ),
                rating = COALESCE((
                    SELECT AVG(rating)
                    FROM t_service_review
                    WHERE service_id = ? AND status = 'normal'
                ), 0)
                WHERE id = ?
                """, serviceId, serviceId, serviceId);
        evictServiceCaches(serviceId);
    }

    private void evictServiceCaches(Long serviceId) {
        cacheService.evictService(serviceId);
        cacheService.evictHomeIndex();
    }

    private ServiceReview buildReview(Long serviceId, String userId, String userName, String userAvatar, Integer rating, String content) {
        ServiceReview review = new ServiceReview();
        review.setServiceId(serviceId);
        review.setUserId(userId);
        review.setUserName(userName);
        review.setUserAvatar(userAvatar);
        review.setRating(rating);
        review.setContent(content);
        review.setLikes(0);
        review.setStatus("normal");
        review.setCreateTime(LocalDateTime.now());
        return review;
    }
}
