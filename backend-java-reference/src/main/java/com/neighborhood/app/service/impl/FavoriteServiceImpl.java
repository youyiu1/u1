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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;

@Slf4j
@Service
public class FavoriteServiceImpl extends ServiceImpl<FavoriteMapper, Favorite> implements FavoriteService {

    private final CacheService cacheService;
    private final DataSource dataSource;

    public FavoriteServiceImpl(CacheService cacheService, DataSource dataSource) {
        this.cacheService = cacheService;
        this.dataSource = dataSource;
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
            // 同步更新目标收藏数
            if ("news".equals(targetType)) {
                updateNewsCollections(targetId, 1);
                cacheService.evictNews(targetId);
            }
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
            // 同步更新目标收藏数
            if ("news".equals(targetType)) {
                updateNewsCollections(targetId, -1);
                cacheService.evictNews(targetId);
            }
        }
        return result;
    }

    // 更新news表的collections字段
    private void updateNewsCollections(Long newsId, int delta) {
        String sql = delta > 0
            ? "UPDATE t_news SET collections = collections + " + delta + " WHERE id = " + newsId
            : "UPDATE t_news SET collections = GREATEST(collections + " + delta + ", 0) WHERE id = " + newsId;
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.executeUpdate();
        } catch (Exception e) {
            log.error("更新收藏数失败: newsId={}, delta={}", newsId, delta, e);
        }
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