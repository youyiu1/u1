/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.market.Favorite;

public interface FavoriteService extends IService<Favorite> {
    /**
     * 添加收藏
     */
    boolean addFavorite(String userId, String targetType, Long targetId);

    /**
     * 取消收藏
     */
    boolean removeFavorite(String userId, String targetType, Long targetId);

    /**
     * 获取用户收藏列表
     */
    java.util.List<Favorite> getUserFavorites(String userId);

    /**
     * 检查是否已收藏（先查Redis）
     */
    boolean isFavorited(String userId, String targetType, Long targetId);
}