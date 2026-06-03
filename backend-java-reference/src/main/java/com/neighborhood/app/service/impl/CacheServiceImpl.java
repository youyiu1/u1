/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.neighborhood.app.service.CacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.serializer.SerializationException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.concurrent.TimeUnit;

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
    private final RedisTemplate<String, Object> redisTemplate;
    private final StringRedisTemplate stringRedisTemplate;

    @Override
    public void cacheUser(String userId, Object user) {
        putValue("user:" + userId, user, USER_TTL_MINUTES, TimeUnit.MINUTES, "缓存用户失败", userId);
    }

    @Override
    public <T> T getCachedUser(String userId) {
        return getValue("user:" + userId, HOT_DATA_CACHE, "获取用户缓存失败", userId);
    }

    @Override
    public void evictUser(String userId) {
        deleteKey("user:" + userId, HOT_DATA_CACHE, "删除用户缓存失败", userId);
    }

    @Override
    public void cacheNews(Long newsId, Object news) {
        cacheDetail(NEWS_CACHE, newsId, news, "缓存动态失败");
    }

    @Override
    public <T> T getCachedNews(Long newsId) {
        return getCachedDetail(NEWS_CACHE, newsId, "获取动态缓存失败");
    }

    @Override
    public <T> T getCachedNewsList() {
        return getCachedList(NEWS_CACHE, "获取动态列表缓存失败");
    }

    @Override
    public void cacheNewsList(Object list) {
        cacheList(NEWS_CACHE, list, "缓存动态列表失败");
    }

    @Override
    public void evictNews(Long newsId) {
        evictDetailAndList(NEWS_CACHE, newsId, "删除动态缓存失败");
    }

    @Override
    public void evictNewsList() {
        evictList(NEWS_CACHE, "删除动态列表缓存失败");
    }

    @Override
    public void cacheService(Long serviceId, Object service) {
        cacheDetail(SERVICE_CACHE, serviceId, service, "缓存服务失败");
    }

    @Override
    public <T> T getCachedService(Long serviceId) {
        return getCachedDetail(SERVICE_CACHE, serviceId, "获取服务缓存失败");
    }

    @Override
    public <T> T getCachedServiceList() {
        return getCachedList(SERVICE_CACHE, "获取服务列表缓存失败");
    }

    @Override
    public void cacheServiceList(Object list) {
        cacheList(SERVICE_CACHE, list, "缓存服务列表失败");
    }

    @Override
    public void evictService(Long serviceId) {
        evictDetailAndList(SERVICE_CACHE, serviceId, "删除服务缓存失败");
    }

    @Override
    public void cacheMarketItem(Long itemId, Object item) {
        cacheDetail(MARKET_CACHE, itemId, item, "缓存闲置商品失败");
    }

    @Override
    public <T> T getCachedMarketItem(Long itemId) {
        return getCachedDetail(MARKET_CACHE, itemId, "获取闲置商品缓存失败");
    }

    @Override
    public <T> T getCachedMarketList() {
        return getCachedList(MARKET_CACHE, "获取闲置商品列表缓存失败");
    }

    @Override
    public void cacheMarketList(Object list) {
        cacheList(MARKET_CACHE, list, "缓存闲置商品列表失败");
    }

    @Override
    public void evictMarketItem(Long itemId) {
        evictDetailAndList(MARKET_CACHE, itemId, "删除闲置商品缓存失败");
    }

    @Override
    public void evictMarketList() {
        evictList(MARKET_CACHE, "删除闲置商品列表缓存失败");
    }

    @Override
    public void cacheHomeIndex(Object data) {
        putValue("home:index", data, HOME_INDEX_TTL_MINUTES, TimeUnit.MINUTES, "缓存首页数据失败", null);
    }

    @Override
    public <T> T getCachedHomeIndex() {
        return getValue("home:index", HOT_DATA_CACHE, "获取首页缓存失败", null);
    }

    @Override
    public void evictHomeIndex() {
        deleteKey("home:index", HOT_DATA_CACHE, "删除首页缓存失败", null);
    }

    @Override
    public void evictAll() {
        try {
            redisTemplate.getConnectionFactory().getConnection().flushDb();
            clearLocalCache(HOT_DATA_CACHE);
            clearLocalCache(STATE_DATA_CACHE);
        } catch (Exception e) {
            log.error("清空缓存失败", e);
        }
    }

    @Override
    public void addNewsLike(Long newsId, String userId) {
        addStateMember(NEWS_LIKE_CACHE, String.valueOf(newsId), userId, "新增动态点赞缓存失败", newsId, userId);
    }

    @Override
    public void removeNewsLike(Long newsId, String userId) {
        removeStateMember(NEWS_LIKE_CACHE, String.valueOf(newsId), userId, "删除动态点赞缓存失败", newsId, userId);
    }

    @Override
    public boolean isNewsLiked(Long newsId, String userId) {
        return hasStateMember(NEWS_LIKE_CACHE, String.valueOf(newsId), userId, "查询动态点赞缓存失败", newsId, userId);
    }

    @Override
    public void addReviewLike(Long reviewId, String userId) {
        addStateMember(REVIEW_LIKE_CACHE, String.valueOf(reviewId), userId, "新增评价点赞缓存失败", reviewId, userId);
    }

    @Override
    public void removeReviewLike(Long reviewId, String userId) {
        removeStateMember(REVIEW_LIKE_CACHE, String.valueOf(reviewId), userId, "删除评价点赞缓存失败", reviewId, userId);
    }

    @Override
    public boolean isReviewLiked(Long reviewId, String userId) {
        return hasStateMember(REVIEW_LIKE_CACHE, String.valueOf(reviewId), userId, "查询评价点赞缓存失败", reviewId, userId);
    }

    @Override
    public void addCommentLike(Long commentId, String userId) {
        addStateMember(COMMENT_LIKE_CACHE, String.valueOf(commentId), userId, "新增评论点赞缓存失败", commentId, userId);
    }

    @Override
    public void removeCommentLike(Long commentId, String userId) {
        removeStateMember(COMMENT_LIKE_CACHE, String.valueOf(commentId), userId, "删除评论点赞缓存失败", commentId, userId);
    }

    @Override
    public boolean isCommentLiked(Long commentId, String userId) {
        return hasStateMember(COMMENT_LIKE_CACHE, String.valueOf(commentId), userId, "查询评论点赞缓存失败", commentId, userId);
    }

    @Override
    public void addFavorite(String userId, String targetType, Long targetId) {
        addStateMember(FAVORITE_CACHE, userId + ":" + targetType, String.valueOf(targetId), "新增收藏缓存失败", userId, targetType, targetId);
    }

    @Override
    public void removeFavorite(String userId, String targetType, Long targetId) {
        removeStateMember(FAVORITE_CACHE, userId + ":" + targetType, String.valueOf(targetId), "删除收藏缓存失败", userId, targetType, targetId);
    }

    @Override
    public boolean isFavorited(String userId, String targetType, Long targetId) {
        return hasStateMember(FAVORITE_CACHE, userId + ":" + targetType, String.valueOf(targetId), "查询收藏缓存失败", userId, targetType, targetId);
    }

    @Override
    public void cacheFollowing(String followerId, String followingId) {
        addStateMember(FOLLOW_CACHE, followerId, followingId, "缓存关注关系失败", followerId, followingId);
    }

    @Override
    public void removeFollowing(String followerId, String followingId) {
        removeStateMember(FOLLOW_CACHE, followerId, followingId, "删除关注关系缓存失败", followerId, followingId);
    }

    @Override
    public boolean isFollowingCached(String followerId, String followingId) {
        return hasStateMember(FOLLOW_CACHE, followerId, followingId, "查询关注关系缓存失败", followerId, followingId);
    }

    private void cacheDetail(ValueCacheSpec spec, Long id, Object value, String errorMessage) {
        if (id == null || id <= 0) {
            return;
        }
        putValue(spec.detailKey(id), value, spec.detailTtlMinutes(), TimeUnit.MINUTES, errorMessage, id);
    }

    private <T> T getCachedDetail(ValueCacheSpec spec, Long id, String errorMessage) {
        if (id == null || id <= 0) {
            return null;
        }
        return getValue(spec.detailKey(id), HOT_DATA_CACHE, errorMessage, id);
    }

    private <T> T getCachedList(ValueCacheSpec spec, String errorMessage) {
        return getValue(spec.listKey(), HOT_DATA_CACHE, errorMessage, null);
    }

    private void cacheList(ValueCacheSpec spec, Object value, String errorMessage) {
        putValue(spec.listKey(), value, spec.listTtlMinutes(), TimeUnit.MINUTES, errorMessage, null);
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

    private void putValue(String key, Object value, long ttl, TimeUnit unit, String message, Object context) {
        try {
            redisTemplate.opsForValue().set(key, value, ttl, unit);
            putLocal(HOT_DATA_CACHE, key, value);
        } catch (Exception e) {
            logError(message, e, context);
        }
    }

    @SuppressWarnings("unchecked")
    private <T> T getValue(String key, String cacheName, String message, Object context) {
        T localValue = getLocal(cacheName, key);
        if (localValue != null) {
            return localValue;
        }
        try {
            T value = (T) redisTemplate.opsForValue().get(key);
            if (value != null) {
                putLocal(cacheName, key, value);
            }
            return value;
        } catch (SerializationException e) {
            deleteCorruptedValue(key, cacheName, message, context, e);
            return null;
        } catch (Exception e) {
            logError(message, e, context);
            return null;
        }
    }

    private void deleteKey(String key, String cacheName, String message, Object context) {
        try {
            redisTemplate.delete(key);
            evictLocal(cacheName, key);
        } catch (Exception e) {
            logError(message, e, context);
        }
    }

    private void deleteKeys(String cacheName, String message, Object context, String... keys) {
        try {
            redisTemplate.delete(Arrays.asList(keys));
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

    private void deleteCorruptedValue(String key, String cacheName, String message, Object context, SerializationException e) {
        log.warn("{}，已删除损坏缓存键: {}", message, key, e);
        try {
            redisTemplate.delete(key);
        } catch (Exception deleteException) {
            logError("删除损坏缓存失败", deleteException, key);
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
