package com.neighborhood.app.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.neighborhood.app.dto.home.HomeIndexData;
import com.neighborhood.app.entity.content.News;
import com.neighborhood.app.entity.market.MarketItem;
import com.neighborhood.app.entity.service.Notification;
import com.neighborhood.app.entity.service.ServiceEntity;
import com.neighborhood.app.entity.system.SearchResult;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.service.CacheService;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/** 缓存服务实现 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CacheServiceImpl implements CacheService {

    private static final String HOT_DATA_CACHE = "hotData";
    private static final String STATE_DATA_CACHE = "stateData";

    private static final long USER_TTL_MINUTES = 30;
    private static final long NEWS_LIST_TTL_MINUTES = 10;
    private static final long NEWS_DETAIL_TTL_MINUTES = 15;
    private static final long SERVICE_LIST_TTL_MINUTES = 10;
    private static final long SERVICE_DETAIL_TTL_MINUTES = 15;
    private static final long MARKET_LIST_TTL_MINUTES = 10;
    private static final long MARKET_DETAIL_TTL_MINUTES = 15;
    private static final long HOME_INDEX_TTL_MINUTES = 5;
    private static final long NOTIFICATION_LIST_TTL_MINUTES = 10;
    private static final long SEARCH_RESULT_TTL_MINUTES = 5;

    private static final long FAVORITE_CACHE_TTL_DAYS = 30;
    private static final long REVIEW_LIKE_CACHE_TTL_DAYS = 30;
    private static final long COMMENT_LIKE_CACHE_TTL_DAYS = 30;
    private static final long FOLLOW_CACHE_TTL_DAYS = 30;

    private static final ValueCacheSpec NEWS_CACHE = new ValueCacheSpec("news:", "news:list", NEWS_DETAIL_TTL_MINUTES, NEWS_LIST_TTL_MINUTES);
    private static final ValueCacheSpec SERVICE_CACHE = new ValueCacheSpec("service:", "service:list", SERVICE_DETAIL_TTL_MINUTES, SERVICE_LIST_TTL_MINUTES);
    private static final ValueCacheSpec MARKET_CACHE = new ValueCacheSpec("market:", "market:list", MARKET_DETAIL_TTL_MINUTES, MARKET_LIST_TTL_MINUTES);

    private static final StateCacheSpec NEWS_LIKE_CACHE = new StateCacheSpec("news:likes:", 0);
    private static final StateCacheSpec REVIEW_LIKE_CACHE = new StateCacheSpec("review:likes:", REVIEW_LIKE_CACHE_TTL_DAYS);
    private static final StateCacheSpec COMMENT_LIKE_CACHE = new StateCacheSpec("comment:likes:", COMMENT_LIKE_CACHE_TTL_DAYS);
    private static final StateCacheSpec FAVORITE_CACHE = new StateCacheSpec("favorites:", FAVORITE_CACHE_TTL_DAYS);
    private static final StateCacheSpec FOLLOW_CACHE = new StateCacheSpec("following:", FOLLOW_CACHE_TTL_DAYS);

    private final CacheManager cacheManager;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void cacheUser(String userId, User user) {
        putJsonValue("user:" + userId, user, USER_TTL_MINUTES, TimeUnit.MINUTES, "cache user failed", userId);
    }

    @Override
    public User getCachedUser(String userId) {
        return getJsonValue("user:" + userId, HOT_DATA_CACHE, User.class, "get user cache failed", userId);
    }

    @Override
    public void evictUser(String userId) {
        deleteKey("user:" + userId, HOT_DATA_CACHE, "evict user cache failed", userId);
    }

    @Override
    public void cacheNews(Long newsId, News news) {
        cacheDetail(NEWS_CACHE, newsId, news, News.class, "cache news failed");
    }

    @Override
    public News getCachedNews(Long newsId) {
        return getCachedDetail(NEWS_CACHE, newsId, News.class, "get news cache failed");
    }

    @Override
    public List<News> getCachedNewsList() {
        return getCachedList(NEWS_CACHE, listType(News.class), "get news list cache failed");
    }

    @Override
    public void cacheNewsList(List<News> list) {
        cacheList(NEWS_CACHE, list, "cache news list failed");
    }

    @Override
    public void evictNews(Long newsId) {
        evictDetailAndList(NEWS_CACHE, newsId, "evict news cache failed");
    }

    @Override
    public void evictNewsList() {
        evictList(NEWS_CACHE, "evict news list cache failed");
    }

    @Override
    public void cacheService(Long serviceId, ServiceEntity service) {
        cacheDetail(SERVICE_CACHE, serviceId, service, ServiceEntity.class, "cache service failed");
    }

    @Override
    public ServiceEntity getCachedService(Long serviceId) {
        return getCachedDetail(SERVICE_CACHE, serviceId, ServiceEntity.class, "get service cache failed");
    }

    @Override
    public List<ServiceEntity> getCachedServiceList() {
        return getCachedList(SERVICE_CACHE, listType(ServiceEntity.class), "get service list cache failed");
    }

    @Override
    public void cacheServiceList(List<ServiceEntity> list) {
        cacheList(SERVICE_CACHE, list, "cache service list failed");
    }

    @Override
    public void evictService(Long serviceId) {
        evictDetailAndList(SERVICE_CACHE, serviceId, "evict service cache failed");
    }

    @Override
    public void cacheMarketItem(Long itemId, MarketItem item) {
        cacheDetail(MARKET_CACHE, itemId, item, MarketItem.class, "cache market item failed");
    }

    @Override
    public MarketItem getCachedMarketItem(Long itemId) {
        return getCachedDetail(MARKET_CACHE, itemId, MarketItem.class, "get market item cache failed");
    }

    @Override
    public List<MarketItem> getCachedMarketList() {
        return getCachedList(MARKET_CACHE, listType(MarketItem.class), "get market list cache failed");
    }

    @Override
    public void cacheMarketList(List<MarketItem> list) {
        cacheList(MARKET_CACHE, list, "cache market list failed");
    }

    @Override
    public void evictMarketItem(Long itemId) {
        evictDetailAndList(MARKET_CACHE, itemId, "evict market item cache failed");
    }

    @Override
    public void evictMarketList() {
        evictList(MARKET_CACHE, "evict market list cache failed");
    }

    @Override
    public void cacheHomeIndex(HomeIndexData data) {
        putJsonValue("home:index", data, HOME_INDEX_TTL_MINUTES, TimeUnit.MINUTES, "cache home index failed", null);
    }

    @Override
    public HomeIndexData getCachedHomeIndex() {
        return getJsonValue("home:index", HOT_DATA_CACHE, HomeIndexData.class, "get home index cache failed", null);
    }

    @Override
    public void evictHomeIndex() {
        deleteKey("home:index", HOT_DATA_CACHE, "evict home index cache failed", null);
    }

    @Override
    public void cacheNotificationList(String userId, List<Notification> list) {
        if (isBlank(userId)) {
            return;
        }
        putJsonValue(notificationListKey(userId), list, NOTIFICATION_LIST_TTL_MINUTES, TimeUnit.MINUTES, "cache notification list failed", userId);
    }

    @Override
    public List<Notification> getCachedNotificationList(String userId) {
        if (isBlank(userId)) {
            return null;
        }
        return getJsonValue(notificationListKey(userId), HOT_DATA_CACHE, listType(Notification.class), "get notification list cache failed", userId);
    }

    @Override
    public void evictNotificationList(String userId) {
        if (isBlank(userId)) {
            return;
        }
        deleteKey(notificationListKey(userId), HOT_DATA_CACHE, "evict notification list cache failed", userId);
    }

    @Override
    public void cacheSearchResult(String keyword, SearchResult result) {
        putJsonValue(searchResultKey(keyword), result, SEARCH_RESULT_TTL_MINUTES, TimeUnit.MINUTES, "cache search result failed", keyword);
    }

    @Override
    public SearchResult getCachedSearchResult(String keyword) {
        return getJsonValue(searchResultKey(keyword), HOT_DATA_CACHE, SearchResult.class, "get search result cache failed", keyword);
    }

    @Override
    public void evictSearchResult(String keyword) {
        deleteKey(searchResultKey(keyword), HOT_DATA_CACHE, "evict search result cache failed", keyword);
    }

    @Override
    public void evictAll() {
        try {
            if (stringRedisTemplate.getConnectionFactory() != null) {
                stringRedisTemplate.getConnectionFactory().getConnection().flushDb();
            }
            clearLocalCache(HOT_DATA_CACHE);
            clearLocalCache(STATE_DATA_CACHE);
        } catch (Exception e) {
            log.error("clear cache failed", e);
        }
    }

    @Override
    public void addNewsLike(Long newsId, String userId) {
        addStateMember(NEWS_LIKE_CACHE, String.valueOf(newsId), userId, "add news like cache failed", newsId, userId);
    }

    @Override
    public void removeNewsLike(Long newsId, String userId) {
        removeStateMember(NEWS_LIKE_CACHE, String.valueOf(newsId), userId, "remove news like cache failed", newsId, userId);
    }

    @Override
    public boolean isNewsLiked(Long newsId, String userId) {
        return hasStateMember(NEWS_LIKE_CACHE, String.valueOf(newsId), userId, "check news like cache failed", newsId, userId);
    }

    @Override
    public void addReviewLike(Long reviewId, String userId) {
        addStateMember(REVIEW_LIKE_CACHE, String.valueOf(reviewId), userId, "add review like cache failed", reviewId, userId);
    }

    @Override
    public void removeReviewLike(Long reviewId, String userId) {
        removeStateMember(REVIEW_LIKE_CACHE, String.valueOf(reviewId), userId, "remove review like cache failed", reviewId, userId);
    }

    @Override
    public boolean isReviewLiked(Long reviewId, String userId) {
        return hasStateMember(REVIEW_LIKE_CACHE, String.valueOf(reviewId), userId, "check review like cache failed", reviewId, userId);
    }

    @Override
    public void addCommentLike(Long commentId, String userId) {
        addStateMember(COMMENT_LIKE_CACHE, String.valueOf(commentId), userId, "add comment like cache failed", commentId, userId);
    }

    @Override
    public void removeCommentLike(Long commentId, String userId) {
        removeStateMember(COMMENT_LIKE_CACHE, String.valueOf(commentId), userId, "remove comment like cache failed", commentId, userId);
    }

    @Override
    public boolean isCommentLiked(Long commentId, String userId) {
        return hasStateMember(COMMENT_LIKE_CACHE, String.valueOf(commentId), userId, "check comment like cache failed", commentId, userId);
    }

    @Override
    public void addFavorite(String userId, String targetType, Long targetId) {
        addStateMember(FAVORITE_CACHE, userId + ":" + targetType, String.valueOf(targetId), "add favorite cache failed", userId, targetType, targetId);
    }

    @Override
    public void removeFavorite(String userId, String targetType, Long targetId) {
        removeStateMember(FAVORITE_CACHE, userId + ":" + targetType, String.valueOf(targetId), "remove favorite cache failed", userId, targetType, targetId);
    }

    @Override
    public boolean isFavorited(String userId, String targetType, Long targetId) {
        return hasStateMember(FAVORITE_CACHE, userId + ":" + targetType, String.valueOf(targetId), "check favorite cache failed", userId, targetType, targetId);
    }

    @Override
    public void cacheFollowing(String followerId, String followingId) {
        addStateMember(FOLLOW_CACHE, followerId, followingId, "cache follow state failed", followerId, followingId);
    }

    @Override
    public void removeFollowing(String followerId, String followingId) {
        removeStateMember(FOLLOW_CACHE, followerId, followingId, "remove follow state cache failed", followerId, followingId);
    }

    @Override
    public boolean isFollowingCached(String followerId, String followingId) {
        return hasStateMember(FOLLOW_CACHE, followerId, followingId, "check follow state cache failed", followerId, followingId);
    }

    private <T> void cacheDetail(ValueCacheSpec spec, Long id, T value, Class<T> type, String errorMessage) {
        if (id == null || id <= 0) {
            return;
        }
        putJsonValue(spec.detailKey(id), value, spec.detailTtlMinutes(), TimeUnit.MINUTES, errorMessage, id);
    }

    private <T> T getCachedDetail(ValueCacheSpec spec, Long id, Class<T> type, String errorMessage) {
        if (id == null || id <= 0) {
            return null;
        }
        return getJsonValue(spec.detailKey(id), HOT_DATA_CACHE, type, errorMessage, id);
    }

    private <T> List<T> getCachedList(ValueCacheSpec spec, JavaType javaType, String errorMessage) {
        return getJsonValue(spec.listKey(), HOT_DATA_CACHE, javaType, errorMessage, null);
    }

    private void cacheList(ValueCacheSpec spec, Object value, String errorMessage) {
        putJsonValue(spec.listKey(), value, spec.listTtlMinutes(), TimeUnit.MINUTES, errorMessage, null);
    }

    private void evictDetailAndList(ValueCacheSpec spec, Long id, String errorMessage) {
        if (id == null || id <= 0) {
            evictList(spec, errorMessage);
            return;
        }
        deleteKeys(HOT_DATA_CACHE, errorMessage, id, spec.detailKey(id), spec.listKey());
    }

    private void evictList(ValueCacheSpec spec, String errorMessage) {
        deleteKey(spec.listKey(), HOT_DATA_CACHE, errorMessage, null);
    }

    private void addStateMember(StateCacheSpec spec, String scope, String member, String errorMessage, Object... context) {
        if (isBlank(scope) || isBlank(member)) {
            return;
        }
        String redisKey = spec.redisKey(scope);
        try {
            stringRedisTemplate.opsForSet().add(redisKey, member);
            expireDays(redisKey, spec.ttlDays());
            putLocal(STATE_DATA_CACHE, spec.localKey(scope, member), true);
        } catch (Exception e) {
            logError(errorMessage, e, context);
        }
    }

    private void removeStateMember(StateCacheSpec spec, String scope, String member, String errorMessage, Object... context) {
        if (isBlank(scope) || isBlank(member)) {
            return;
        }
        String redisKey = spec.redisKey(scope);
        try {
            stringRedisTemplate.opsForSet().remove(redisKey, member);
            expireDays(redisKey, spec.ttlDays());
            evictLocal(STATE_DATA_CACHE, spec.localKey(scope, member));
        } catch (Exception e) {
            logError(errorMessage, e, context);
        }
    }

    private boolean hasStateMember(StateCacheSpec spec, String scope, String member, String errorMessage, Object... context) {
        if (isBlank(scope) || isBlank(member)) {
            return false;
        }
        String localKey = spec.localKey(scope, member);
        Boolean localValue = getLocal(STATE_DATA_CACHE, localKey);
        if (Boolean.TRUE.equals(localValue)) {
            return true;
        }
        try {
            boolean result = Boolean.TRUE.equals(stringRedisTemplate.opsForSet().isMember(spec.redisKey(scope), member));
            if (result) {
                putLocal(STATE_DATA_CACHE, localKey, true);
            }
            return result;
        } catch (Exception e) {
            logError(errorMessage, e, context);
            return false;
        }
    }

    private void putJsonValue(String key, Object value, long ttl, TimeUnit unit, String message, Object context) {
        try {
            stringRedisTemplate.opsForValue().set(key, writeJson(value), ttl, unit);
            putLocal(HOT_DATA_CACHE, key, value);
        } catch (Exception e) {
            logError(message, e, context);
        }
    }

    private <T> T getJsonValue(String key, String cacheName, Class<T> type, String message, Object context) {
        T localValue = getLocal(cacheName, key);
        if (localValue != null) {
            return localValue;
        }
        try {
            String json = stringRedisTemplate.opsForValue().get(key);
            if (json == null || json.isBlank()) {
                return null;
            }
            T value = objectMapper.readValue(json, type);
            putLocal(cacheName, key, value);
            return value;
        } catch (Exception e) {
            deleteCorruptedValue(key, cacheName, message, context, e);
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private <T> T getJsonValue(String key, String cacheName, JavaType javaType, String message, Object context) {
        T localValue = getLocal(cacheName, key);
        if (localValue != null) {
            return localValue;
        }
        try {
            String json = stringRedisTemplate.opsForValue().get(key);
            if (json == null || json.isBlank()) {
                return null;
            }
            T value = (T) objectMapper.readValue(json, javaType);
            putLocal(cacheName, key, value);
            return value;
        } catch (Exception e) {
            deleteCorruptedValue(key, cacheName, message, context, e);
            return null;
        }
    }

    private String writeJson(Object value) throws JsonProcessingException {
        return objectMapper.writeValueAsString(value);
    }

    private void deleteKey(String key, String cacheName, String message, Object context) {
        try {
            stringRedisTemplate.delete(key);
            evictLocal(cacheName, key);
        } catch (Exception e) {
            logError(message, e, context);
        }
    }

    private void deleteKeys(String cacheName, String message, Object context, String... keys) {
        try {
            stringRedisTemplate.delete(Arrays.asList(keys));
            for (String key : keys) {
                evictLocal(cacheName, key);
            }
        } catch (Exception e) {
            logError(message, e, context);
        }
    }

    private void expireDays(String key, long ttlDays) {
        if (ttlDays > 0) {
            stringRedisTemplate.expire(key, ttlDays, TimeUnit.DAYS);
        }
    }

    @SuppressWarnings("unchecked")
    private <T> T getLocal(String cacheName, String key) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache == null) {
            return null;
        }
        Cache.ValueWrapper wrapper = cache.get(key);
        return wrapper == null ? null : (T) wrapper.get();
    }

    private void putLocal(String cacheName, String key, Object value) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null && value != null) {
            cache.put(key, value);
        }
    }

    private void evictLocal(String cacheName, String key) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.evict(key);
        }
    }

    private void clearLocalCache(String cacheName) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.clear();
        }
    }

    private void deleteCorruptedValue(String key, String cacheName, String message, Object context, Exception e) {
        log.warn("{}; corrupted cache key removed: {}", message, key, e);
        try {
            stringRedisTemplate.delete(key);
        } catch (Exception deleteException) {
            logError("delete corrupted cache failed", deleteException, key);
        } finally {
            evictLocal(cacheName, key);
        }
    }

    private void logError(String message, Exception e, Object... context) {
        if (context == null || context.length == 0 || context[0] == null) {
            log.error(message, e);
            return;
        }
        StringBuilder builder = new StringBuilder(message).append(": ");
        for (int i = 0; i < context.length; i++) {
            if (i > 0) {
                builder.append(", ");
            }
            builder.append("{}");
        }
        log.error(builder.toString(), appendException(context, e));
    }

    private Object[] appendException(Object[] context, Exception e) {
        Object[] args = new Object[context.length + 1];
        System.arraycopy(context, 0, args, 0, context.length);
        args[context.length] = e;
        return args;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String notificationListKey(String userId) {
        return "notification:list:" + userId;
    }

    private String searchResultKey(String keyword) {
        String normalized = keyword == null ? "" : keyword.trim().toLowerCase();
        return "search:result:" + (normalized.isEmpty() ? "_all" : normalized);
    }

    private JavaType listType(Class<?> elementType) {
        return objectMapper.getTypeFactory().constructCollectionType(List.class, elementType);
    }

    private record ValueCacheSpec(String detailPrefix, String listKey, long detailTtlMinutes, long listTtlMinutes) {
        private String detailKey(Long id) {
            return detailPrefix + id;
        }
    }

    private record StateCacheSpec(String redisPrefix, long ttlDays) {
        private String redisKey(String scope) {
            return redisPrefix + scope;
        }

        private String localKey(String scope, String member) {
            return redisKey(scope) + ":" + member;
        }
    }
}
