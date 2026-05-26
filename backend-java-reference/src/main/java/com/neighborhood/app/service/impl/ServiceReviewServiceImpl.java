/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.ServiceReview;
import com.neighborhood.app.mapper.ServiceReviewMapper;
import com.neighborhood.app.service.ServiceReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceReviewServiceImpl extends ServiceImpl<ServiceReviewMapper, ServiceReview> implements ServiceReviewService {

    @Override
    public List<ServiceReview> getByServiceId(Long serviceId) {
        return lambdaQuery()
                .eq(ServiceReview::getServiceId, serviceId)
                .orderByDesc(ServiceReview::getCreateTime)
                .list();
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
    public boolean likeReview(Long reviewId) {
        return lambdaUpdate()
                .eq(ServiceReview::getId, reviewId)
                .setSql("likes = likes + 1")
                .update();
    }

    @Override
    public boolean unlikeReview(Long reviewId) {
        return lambdaUpdate()
                .eq(ServiceReview::getId, reviewId)
                .setSql("likes = likes - 1")
                .update();
    }
}