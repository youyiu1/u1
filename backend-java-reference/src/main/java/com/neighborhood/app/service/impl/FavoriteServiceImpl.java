/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.market.Favorite;
import com.neighborhood.app.entity.content.News;
import com.neighborhood.app.mapper.market.FavoriteMapper;
import com.neighborhood.app.mapper.content.NewsMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.FavoriteService;
import com.neighborhood.app.utils.CounterSqlUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl extends ServiceImpl<FavoriteMapper, Favorite> implements FavoriteService {

    private static final String TARGET_TYPE_NEWS = "news";

    private final CacheService cacheService;
    private final NewsMapper newsMapper;

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
            syncFavoriteState(userId, targetType, targetId, true);
        }
        return result;
    }

    @Override
    public boolean removeFavorite(String userId, String targetType, Long targetId) {
        boolean result = remove(favoriteQuery(userId, targetType, targetId));
        if (result) {
            syncFavoriteState(userId, targetType, targetId, false);
        }
        return result;
    }

    @Override
    public List<Favorite> getUserFavorites(String userId) {
        return list(new QueryWrapper<Favorite>()
                .eq("user_id", userId)
                .orderByDesc("create_time"));
    }

    @Override
    public boolean isFavorited(String userId, String targetType, Long targetId) {
        if (cacheService.isFavorited(userId, targetType, targetId)) {
            return true;
        }
        boolean favorited = count(favoriteQuery(userId, targetType, targetId)) > 0;
        if (favorited) {
            cacheService.addFavorite(userId, targetType, targetId);
        }
        return favorited;
    }

    private void syncFavoriteState(String userId, String targetType, Long targetId, boolean favorited) {
        syncFavoriteCache(userId, targetType, targetId, favorited);
        if (TARGET_TYPE_NEWS.equals(targetType)) {
            updateNewsCollections(targetId, favorited ? 1 : -1);
            cacheService.evictNews(targetId);
        }
    }

    private void updateNewsCollections(Long newsId, int delta) {
        UpdateWrapper<News> wrapper = new UpdateWrapper<>();
        wrapper.eq("id", newsId);
        wrapper.setSql(CounterSqlUtil.nonNegativeDelta("collections", delta));
        newsMapper.update(null, wrapper);
    }

    private QueryWrapper<Favorite> favoriteQuery(String userId, String targetType, Long targetId) {
        return new QueryWrapper<Favorite>()
                .eq("user_id", userId)
                .eq("target_type", targetType)
                .eq("target_id", targetId);
    }

    private void syncFavoriteCache(String userId, String targetType, Long targetId, boolean favorited) {
        if (favorited) {
            cacheService.addFavorite(userId, targetType, targetId);
        } else {
            cacheService.removeFavorite(userId, targetType, targetId);
        }
    }
}
