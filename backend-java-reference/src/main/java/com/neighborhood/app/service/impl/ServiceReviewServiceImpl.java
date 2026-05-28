/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.ServiceReview;
import com.neighborhood.app.mapper.ServiceReviewMapper;
import com.neighborhood.app.service.ServiceReviewService;
import com.neighborhood.app.service.ReviewLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ServiceReviewServiceImpl extends ServiceImpl<ServiceReviewMapper, ServiceReview> implements ServiceReviewService {

    @Autowired
    private ReviewLikeService reviewLikeService;

    @Override
    public List<ServiceReview> getByServiceId(Long serviceId) {
        return lambdaQuery()
                .eq(ServiceReview::getServiceId, serviceId)
                .orderByDesc(ServiceReview::getCreateTime)
                .list();
    }

    @Override
    public List<Map<String, Object>> getByServiceIdWithLikeStatus(Long serviceId, String userId) {
        List<ServiceReview> reviews = getByServiceId(serviceId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (ServiceReview review : reviews) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", review.getId());
            map.put("serviceId", review.getServiceId());
            map.put("userId", review.getUserId());
            map.put("userName", review.getUserName());
            map.put("userAvatar", review.getUserAvatar());
            map.put("rating", review.getRating());
            map.put("content", review.getContent());
            map.put("likes", review.getLikes());
            map.put("createTime", review.getCreateTime());
            map.put("isLiked", reviewLikeService.isLiked(review.getId(), userId));
            result.add(map);
        }
        return result;
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
        review.setCreateTime(LocalDateTime.now());
        return save(review);
    }

    @Override
    public boolean likeReview(Long reviewId, String userId) {
        return reviewLikeService.like(reviewId, userId);
    }

    @Override
    public boolean unlikeReview(Long reviewId, String userId) {
        return reviewLikeService.unlike(reviewId, userId);
    }
}