/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.ReviewLike;
import java.util.List;

public interface ReviewLikeService extends IService<ReviewLike> {
    boolean like(Long reviewId, String userId);
    boolean unlike(Long reviewId, String userId);
    List<ReviewLike> getLikesByReviewId(Long reviewId);
    boolean isLiked(Long reviewId, String userId);
}