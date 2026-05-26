/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.ServiceReview;
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
}