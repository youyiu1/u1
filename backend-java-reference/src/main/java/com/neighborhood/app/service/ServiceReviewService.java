/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.service.ServiceReview;
import java.util.List;

public interface ServiceReviewService extends IService<ServiceReview> {
    /**
     * 获取服务评价列表
     */
    List<ServiceReview> getByServiceId(Long serviceId);
    /**
     * 添加服务评价
     */
    boolean addReview(Long serviceId, String userId, String userName, String userAvatar, Integer rating, String content);
    /**
     * 获取评价列表及当前用户点赞状态
     */
    java.util.List<java.util.Map<String, Object>> getByServiceIdWithLikeStatus(Long serviceId, String userId);
    /**
     * 评价点赞
     */
    boolean likeReview(Long reviewId, String userId);
    /**
     * 取消评价点赞
     */
    boolean unlikeReview(Long reviewId, String userId);
    void refreshServiceStats(Long serviceId);
}
