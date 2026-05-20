/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import com.neighborhood.app.service.CacheService;

import java.util.ArrayList;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class CacheServiceImpl implements CacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public void cacheUser(String userId, Object user) {
        try {
            redisTemplate.opsForValue().set(USER_KEY + userId, user, USER_TTL, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.error("缓存用户失败: {}", userId, e);
        }
    }

    @Override
    public <T> T getCachedUser(String userId) {
        try {
            Object result = redisTemplate.opsForValue().get(USER_KEY + userId);
            if (result != null) {
                return (T) result;
            }
            return null;
        } catch (Exception e) {
            log.error("获取用户缓存失败: {}", userId, e);
            return null;
        }
    }

    @Override
    public void evictUser(String userId) {
        try {
            redisTemplate.delete(USER_KEY + userId);
        } catch (Exception e) {
            log.error("删除用户缓存失败: {}", userId, e);
        }
    }

    @Override
    public void cacheNews(Long newsId, Object news) {
        try {
            redisTemplate.opsForValue().set(NEWS_KEY + newsId, news, NEWS_DETAIL_TTL, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.error("缓存动态失败: {}", newsId, e);
        }
    }

    @Override
    public <T> T getCachedNews(Long newsId) {
        try {
            Object result = redisTemplate.opsForValue().get(NEWS_KEY + newsId);
            if (result != null) {
                return (T) result;
            }
            return null;
        } catch (Exception e) {
            log.error("获取动态缓存失败: {}", newsId, e);
            return null;
        }
    }

    @Override
    public <T> T getCachedNewsList() {
        try {
            Object result = redisTemplate.opsForValue().get(NEWS_LIST_KEY);
            if (result != null) {
                return (T) result;
            }
            return null;
        } catch (Exception e) {
            log.error("获取动态列表缓存失败", e);
            return null;
        }
    }

    @Override
    public void cacheNewsList(Object list) {
        try {
            redisTemplate.opsForValue().set(NEWS_LIST_KEY, list, NEWS_LIST_TTL, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.error("缓存动态列表失败", e);
        }
    }

    @Override
    public void evictNews(Long newsId) {
        try {
            redisTemplate.delete(NEWS_KEY + newsId);
            redisTemplate.delete(NEWS_LIST_KEY);
        } catch (Exception e) {
            log.error("删除动态缓存失败: {}", newsId, e);
        }
    }

    @Override
    public void evictNewsList() {
        try {
            redisTemplate.delete(NEWS_LIST_KEY);
        } catch (Exception e) {
            log.error("删除动态列表缓存失败", e);
        }
    }

    @Override
    public void cacheService(Long serviceId, Object service) {
        try {
            redisTemplate.opsForValue().set(SERVICE_KEY + serviceId, service, SERVICE_DETAIL_TTL, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.error("缓存服务失败: {}", serviceId, e);
        }
    }

    @Override
    public <T> T getCachedService(Long serviceId) {
        try {
            Object result = redisTemplate.opsForValue().get(SERVICE_KEY + serviceId);
            if (result != null) {
                return (T) result;
            }
            return null;
        } catch (Exception e) {
            log.error("获取服务缓存失败: {}", serviceId, e);
            return null;
        }
    }

    @Override
    public <T> T getCachedServiceList() {
        try {
            Object result = redisTemplate.opsForValue().get(SERVICE_LIST_KEY);
            if (result != null) {
                return (T) result;
            }
            return null;
        } catch (Exception e) {
            log.error("获取服务列表缓存失败", e);
            return null;
        }
    }

    @Override
    public void cacheServiceList(Object list) {
        try {
            redisTemplate.opsForValue().set(SERVICE_LIST_KEY, list, SERVICE_LIST_TTL, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.error("缓存服务列表失败", e);
        }
    }

    @Override
    public void evictService(Long serviceId) {
        try {
            redisTemplate.delete(SERVICE_KEY + serviceId);
            redisTemplate.delete(SERVICE_LIST_KEY);
        } catch (Exception e) {
            log.error("删除服务缓存失败: {}", serviceId, e);
        }
    }

    @Override
    public void cacheMarketItem(Long itemId, Object item) {
        try {
            redisTemplate.opsForValue().set(MARKET_KEY + itemId, item, MARKET_DETAIL_TTL, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.error("缓存闲置失败: {}", itemId, e);
        }
    }

    @Override
    public <T> T getCachedMarketItem(Long itemId) {
        try {
            Object result = redisTemplate.opsForValue().get(MARKET_KEY + itemId);
            if (result != null) {
                return (T) result;
            }
            return null;
        } catch (Exception e) {
            log.error("获取闲置缓存失败: {}", itemId, e);
            return null;
        }
    }

    @Override
    public <T> T getCachedMarketList() {
        try {
            Object result = redisTemplate.opsForValue().get(MARKET_LIST_KEY);
            if (result != null) {
                return (T) result;
            }
            return null;
        } catch (Exception e) {
            log.error("获取闲置列表缓存失败", e);
            return null;
        }
    }

    @Override
    public void cacheMarketList(Object list) {
        try {
            redisTemplate.opsForValue().set(MARKET_LIST_KEY, list, MARKET_LIST_TTL, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.error("缓存闲置列表失败", e);
        }
    }

    @Override
    public void evictMarketItem(Long itemId) {
        try {
            redisTemplate.delete(MARKET_KEY + itemId);
            redisTemplate.delete(MARKET_LIST_KEY);
        } catch (Exception e) {
            log.error("删除闲置缓存失败: {}", itemId, e);
        }
    }

    @Override
    public void cacheHomeIndex(Object data) {
        try {
            redisTemplate.opsForValue().set(HOME_INDEX_KEY, data, HOME_INDEX_TTL, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.error("缓存首页数据失败", e);
        }
    }

    @Override
    public <T> T getCachedHomeIndex() {
        try {
            Object result = redisTemplate.opsForValue().get(HOME_INDEX_KEY);
            if (result != null) {
                return (T) result;
            }
            return null;
        } catch (Exception e) {
            log.error("获取首页缓存失败", e);
            return null;
        }
    }

    @Override
    public void evictHomeIndex() {
        try {
            redisTemplate.delete(HOME_INDEX_KEY);
        } catch (Exception e) {
            log.error("删除首页缓存失败", e);
        }
    }

    @Override
    public void evictAll() {
        try {
            redisTemplate.getConnectionFactory().getConnection().flushDb();
        } catch (Exception e) {
            log.error("清空缓存失败", e);
        }
    }

    // ==================== 常量 ====================

    private static final String USER_KEY = "user:";
    private static final long USER_TTL = 30;

    private static final String NEWS_KEY = "news:";
    private static final String NEWS_LIST_KEY = "news:list";
    private static final long NEWS_LIST_TTL = 10;
    private static final long NEWS_DETAIL_TTL = 15;

    private static final String SERVICE_KEY = "service:";
    private static final String SERVICE_LIST_KEY = "service:list";
    private static final long SERVICE_LIST_TTL = 10;
    private static final long SERVICE_DETAIL_TTL = 15;

    private static final String MARKET_KEY = "market:";
    private static final String MARKET_LIST_KEY = "market:list";
    private static final long MARKET_LIST_TTL = 10;
    private static final long MARKET_DETAIL_TTL = 15;

    private static final String HOME_INDEX_KEY = "home:index";
    private static final long HOME_INDEX_TTL = 5;
}