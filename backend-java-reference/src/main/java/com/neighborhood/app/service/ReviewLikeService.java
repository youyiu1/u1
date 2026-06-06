/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.service.ReviewLike;
import java.util.Collection;
import java.util.List;
import java.util.Set;

/** 文件作用：评价点赞服务接口。 */
public interface ReviewLikeService extends IService<ReviewLike> {
    boolean like(Long reviewId, String userId);
    boolean unlike(Long reviewId, String userId);
    List<ReviewLike> getLikesByReviewId(Long reviewId);
    boolean isLiked(Long reviewId, String userId);
    Set<Long> likedReviewIds(Collection<Long> reviewIds, String userId);
}
