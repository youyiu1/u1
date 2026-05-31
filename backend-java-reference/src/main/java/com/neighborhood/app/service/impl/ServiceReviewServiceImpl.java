/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.ServiceReview;
import com.neighborhood.app.mapper.ServiceReviewMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.ServiceReviewService;
import com.neighborhood.app.service.ReviewLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ServiceReviewServiceImpl extends ServiceImpl<ServiceReviewMapper, ServiceReview> implements ServiceReviewService {

    private final ReviewLikeService reviewLikeService;
    private final JdbcTemplate jdbcTemplate;
    private final CacheService cacheService;

    @Override
    public List<ServiceReview> getByServiceId(Long serviceId) {
        ensureReviewStatusColumnExists();
        return lambdaQuery()
                .eq(ServiceReview::getServiceId, serviceId)
                .eq(ServiceReview::getStatus, "normal")
                .orderByDesc(ServiceReview::getCreateTime)
                .list();
    }

    @Override
    public List<Map<String, Object>> getByServiceIdWithLikeStatus(Long serviceId, String userId) {
        return getByServiceId(serviceId).stream()
                .map(review -> toReviewResponse(review, reviewLikeService.isLiked(review.getId(), userId)))
                .toList();
    }

    @Override
    public boolean addReview(Long serviceId, String userId, String userName, String userAvatar, Integer rating, String content) {
        ServiceReview review = new ServiceReview();
        review.setServiceId(serviceId);
        review.setUserId(userId);
        review.setUserName(userName);
        review.setUserAvatar(userAvatar);
        review.setRating(rating);
        review.setContent(content);
        review.setLikes(0);
        review.setStatus("pending");
        review.setCreateTime(LocalDateTime.now());
        boolean saved = save(review);
        if (saved) {
            cacheService.evictService(serviceId);
            cacheService.evictHomeIndex();
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

    private Map<String, Object> toReviewResponse(ServiceReview review, boolean liked) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", review.getId());
        map.put("serviceId", review.getServiceId());
        map.put("userId", review.getUserId());
        map.put("userName", review.getUserName());
        map.put("userAvatar", review.getUserAvatar());
        map.put("rating", review.getRating());
        map.put("content", review.getContent());
        map.put("likes", review.getLikes());
        map.put("status", review.getStatus());
        map.put("createTime", review.getCreateTime());
        map.put("isLiked", liked);
        return map;
    }

    private void ensureReviewStatusColumnExists() {
        try {
            jdbcTemplate.execute("ALTER TABLE t_service_review ADD COLUMN status VARCHAR(20) DEFAULT 'normal'");
        } catch (Exception ignored) {
        }
    }
}
