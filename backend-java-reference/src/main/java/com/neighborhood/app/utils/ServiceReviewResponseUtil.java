package com.neighborhood.app.utils;

import com.neighborhood.app.entity.service.ServiceReview;

import java.util.HashMap;
import java.util.Map;

public final class ServiceReviewResponseUtil {

    private ServiceReviewResponseUtil() {
    }

    public static Map<String, Object> toReviewResponse(ServiceReview review, boolean liked) {
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
}
