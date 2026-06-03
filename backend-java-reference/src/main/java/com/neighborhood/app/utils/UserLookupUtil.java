package com.neighborhood.app.utils;

import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.mapper.user.UserMapper;
import com.neighborhood.app.service.CacheService;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public final class UserLookupUtil {

    private UserLookupUtil() {
    }

    public static List<String> normalizeIds(Collection<String> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return List.of();
        }
        return userIds.stream()
                .filter(id -> id != null && !id.isBlank())
                .distinct()
                .toList();
    }

    public static <T> Map<String, User> mapByExtractor(CacheService cacheService, UserMapper userMapper, Collection<T> items, Function<T, String> idExtractor) {
        if (items == null || items.isEmpty()) {
            return Map.of();
        }
        return mapByIds(cacheService, userMapper, items.stream()
                .map(idExtractor)
                .toList());
    }

    public static Map<String, User> mapByIds(UserMapper userMapper, Collection<String> userIds) {
        List<String> ids = normalizeIds(userIds);
        if (ids.isEmpty()) {
            return Map.of();
        }
        return userMapper.selectBatchIds(ids).stream()
                .collect(Collectors.toMap(User::getId, user -> user));
    }

    public static Map<String, User> mapByIds(CacheService cacheService, UserMapper userMapper, Collection<String> userIds) {
        List<String> ids = normalizeIds(userIds);
        if (ids.isEmpty()) {
            return Map.of();
        }

        Map<String, User> result = new LinkedHashMap<>();
        List<String> missingIds = ids.stream()
                .filter(id -> {
                    User cached = cacheService.getCachedUser(id);
                    if (cached == null) {
                        return true;
                    }
                    result.put(id, cached);
                    return false;
                })
                .toList();
        if (missingIds.isEmpty()) {
            return result;
        }

        userMapper.selectBatchIds(missingIds).forEach(user -> {
            result.put(user.getId(), user);
            cacheService.cacheUser(user.getId(), user);
        });
        return result;
    }

    public static User getById(CacheService cacheService, UserMapper userMapper, String userId) {
        if (userId == null || userId.isBlank()) {
            return null;
        }
        User cached = cacheService.getCachedUser(userId);
        if (cached != null) {
            return cached;
        }
        User user = userMapper.selectById(userId);
        if (user != null) {
            cacheService.cacheUser(userId, user);
        }
        return user;
    }
}
