/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.neighborhood.app.dto.home.HomeIndexData;
import com.neighborhood.app.entity.content.News;
import com.neighborhood.app.entity.market.MarketItem;
import com.neighborhood.app.entity.service.Notification;
import com.neighborhood.app.entity.service.ServiceEntity;
import com.neighborhood.app.entity.system.SearchResult;
import com.neighborhood.app.entity.user.User;
import java.util.List;

/** 鏂囦欢浣滅敤锛氱紦瀛樻湇鍔℃帴鍙ｃ€?*/
public interface CacheService {
    void cacheUser(String userId, User user);
    User getCachedUser(String userId);
    void evictUser(String userId);
    void cacheNews(Long newsId, News news);
    News getCachedNews(Long newsId);
    List<News> getCachedNewsList();
    void cacheNewsList(List<News> list);
    void evictNews(Long newsId);
    void evictNewsList();
    void cacheService(Long serviceId, ServiceEntity service);
    ServiceEntity getCachedService(Long serviceId);
    List<ServiceEntity> getCachedServiceList();
    void cacheServiceList(List<ServiceEntity> list);
    void evictService(Long serviceId);
    void cacheMarketItem(Long itemId, MarketItem item);
    MarketItem getCachedMarketItem(Long itemId);
    List<MarketItem> getCachedMarketList();
    void cacheMarketList(List<MarketItem> list);
    void evictMarketItem(Long itemId);
    void evictMarketList();
    void cacheHomeIndex(HomeIndexData data);
    HomeIndexData getCachedHomeIndex();
    void evictHomeIndex();
    void cacheNotificationList(String userId, List<Notification> list);
    List<Notification> getCachedNotificationList(String userId);
    void evictNotificationList(String userId);
    void cacheSearchResult(String keyword, SearchResult result);
    SearchResult getCachedSearchResult(String keyword);
    void evictSearchResult(String keyword);
    void evictAll();

    // ========== 鐐硅禐鐩稿叧 ==========
    void addNewsLike(Long newsId, String userId);
    void removeNewsLike(Long newsId, String userId);
    boolean isNewsLiked(Long newsId, String userId);

    // ========== 璇勪环鐐硅禐鐩稿叧 ==========
    void addReviewLike(Long reviewId, String userId);
    void removeReviewLike(Long reviewId, String userId);
    boolean isReviewLiked(Long reviewId, String userId);

    // ========== 璇勮鐐硅禐鐩稿叧 ==========
    void addCommentLike(Long commentId, String userId);
    void removeCommentLike(Long commentId, String userId);
    boolean isCommentLiked(Long commentId, String userId);

    // ========== 鏀惰棌鐩稿叧 ==========
    void addFavorite(String userId, String targetType, Long targetId);
    void removeFavorite(String userId, String targetType, Long targetId);
    boolean isFavorited(String userId, String targetType, Long targetId);

    void cacheFollowing(String followerId, String followingId);
    void removeFollowing(String followerId, String followingId);
    boolean isFollowingCached(String followerId, String followingId);
}
