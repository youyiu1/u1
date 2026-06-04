package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.content.News;
import com.neighborhood.app.entity.market.Favorite;
import com.neighborhood.app.mapper.content.NewsMapper;
import com.neighborhood.app.mapper.market.FavoriteMapper;
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
        return persistFavoriteChange(
                save(buildFavorite(userId, targetType, targetId)),
                userId,
                targetType,
                targetId,
                true
        );
    }

    @Override
    public boolean removeFavorite(String userId, String targetType, Long targetId) {
        return persistFavoriteChange(
                remove(favoriteQuery(userId, targetType, targetId)),
                userId,
                targetType,
                targetId,
                false
        );
    }

    @Override
    public List<Favorite> getUserFavorites(String userId) {
        return lambdaQuery()
                .eq(Favorite::getUserId, userId)
                .orderByDesc(Favorite::getCreateTime)
                .list();
    }

    @Override
    public boolean isFavorited(String userId, String targetType, Long targetId) {
        if (cacheService.isFavorited(userId, targetType, targetId)) {
            return true;
        }
        boolean favorited = count(favoriteQuery(userId, targetType, targetId)) > 0;
        syncFavoriteCache(userId, targetType, targetId, favorited);
        return favorited;
    }

    private void syncFavoriteState(String userId, String targetType, Long targetId, boolean favorited) {
        syncFavoriteCache(userId, targetType, targetId, favorited);
        syncNewsFavoriteState(targetType, targetId, favorited);
    }

    private void syncNewsFavoriteState(String targetType, Long targetId, boolean favorited) {
        if (!isNewsTarget(targetType)) {
            return;
        }
        updateNewsCollections(targetId, favorited ? 1 : -1);
        cacheService.evictNews(targetId);
    }

    private void updateNewsCollections(Long newsId, int delta) {
        UpdateWrapper<News> wrapper = new UpdateWrapper<>();
        wrapper.eq("id", newsId);
        wrapper.setSql(CounterSqlUtil.nonNegativeDelta("collections", delta));
        newsMapper.update(null, wrapper);
    }

    private LambdaQueryWrapper<Favorite> favoriteQuery(String userId, String targetType, Long targetId) {
        return new LambdaQueryWrapper<Favorite>()
                .eq(Favorite::getUserId, userId)
                .eq(Favorite::getTargetType, targetType)
                .eq(Favorite::getTargetId, targetId);
    }

    private Favorite buildFavorite(String userId, String targetType, Long targetId) {
        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setTargetType(targetType);
        favorite.setTargetId(targetId);
        return favorite;
    }

    private boolean persistFavoriteChange(
            boolean changed,
            String userId,
            String targetType,
            Long targetId,
            boolean favorited
    ) {
        if (!changed) {
            return false;
        }
        syncFavoriteState(userId, targetType, targetId, favorited);
        return true;
    }

    private boolean isNewsTarget(String targetType) {
        return TARGET_TYPE_NEWS.equals(targetType);
    }

    private void syncFavoriteCache(String userId, String targetType, Long targetId, boolean favorited) {
        if (favorited) {
            cacheService.addFavorite(userId, targetType, targetId);
        } else {
            cacheService.removeFavorite(userId, targetType, targetId);
        }
    }
}
