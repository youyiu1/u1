/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.Favorite;
import com.neighborhood.app.mapper.FavoriteMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.FavoriteService;
import org.springframework.stereotype.Service;

@Service
public class FavoriteServiceImpl extends ServiceImpl<FavoriteMapper, Favorite> implements FavoriteService {

    private final CacheService cacheService;

    public FavoriteServiceImpl(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    @Override
    public boolean addFavorite(String userId, String targetType, Long targetId) {
        if (isFavorited(userId, targetType, targetId)) {
            return false;
        }
        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setTargetType(targetType);
        favorite.setTargetId(targetId);
        boolean result = save(favorite);
        if (result) {
            cacheService.addFavorite(userId, targetType, targetId);
        }
        return result;
    }

    @Override
    public boolean removeFavorite(String userId, String targetType, Long targetId) {
        QueryWrapper<Favorite> wrapper = new QueryWrapper<Favorite>()
                .eq("user_id", userId)
                .eq("target_type", targetType)
                .eq("target_id", targetId);
        boolean result = remove(wrapper);
        if (result) {
            cacheService.removeFavorite(userId, targetType, targetId);
        }
        return result;
    }

    @Override
    public java.util.List<Favorite> getUserFavorites(String userId) {
        QueryWrapper<Favorite> wrapper = new QueryWrapper<Favorite>()
                .eq("user_id", userId)
                .orderByDesc("create_time");
        return list(wrapper);
    }

    @Override
    public boolean isFavorited(String userId, String targetType, Long targetId) {
        if (cacheService.isFavorited(userId, targetType, targetId)) {
            return true;
        }
        QueryWrapper<Favorite> wrapper = new QueryWrapper<Favorite>()
                .eq("user_id", userId)
                .eq("target_type", targetType)
                .eq("target_id", targetId);
        return count(wrapper) > 0;
    }
}