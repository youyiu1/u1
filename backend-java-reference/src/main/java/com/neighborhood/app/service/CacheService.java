/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

public interface CacheService {
    void cacheUser(String userId, Object user);
    <T> T getCachedUser(String userId);
    void evictUser(String userId);
    void cacheNews(Long newsId, Object news);
    <T> T getCachedNews(Long newsId);
    <T> T getCachedNewsList();
    void cacheNewsList(Object list);
    void evictNews(Long newsId);
    void evictNewsList();
    void cacheService(Long serviceId, Object service);
    <T> T getCachedService(Long serviceId);
    <T> T getCachedServiceList();
    void cacheServiceList(Object list);
    void evictService(Long serviceId);
    void cacheMarketItem(Long itemId, Object item);
    <T> T getCachedMarketItem(Long itemId);
    <T> T getCachedMarketList();
    void cacheMarketList(Object list);
    void evictMarketItem(Long itemId);
    void evictMarketList();
    void cacheHomeIndex(Object data);
    <T> T getCachedHomeIndex();
    void evictHomeIndex();
    void evictAll();

    // ========== 点赞相关 ==========
    void addNewsLike(Long newsId, String userId);
    void removeNewsLike(Long newsId, String userId);
    boolean isNewsLiked(Long newsId, String userId);

    // ========== 评价点赞相关 ==========
    void addReviewLike(Long reviewId, String userId);
    void removeReviewLike(Long reviewId, String userId);
    boolean isReviewLiked(Long reviewId, String userId);

    // ========== 评论点赞相关 ==========
    void addCommentLike(Long commentId, String userId);
    void removeCommentLike(Long commentId, String userId);
    boolean isCommentLiked(Long commentId, String userId);

    // ========== 收藏相关 ==========
    void addFavorite(String userId, String targetType, Long targetId);
    void removeFavorite(String userId, String targetType, Long targetId);
    boolean isFavorited(String userId, String targetType, Long targetId);
}