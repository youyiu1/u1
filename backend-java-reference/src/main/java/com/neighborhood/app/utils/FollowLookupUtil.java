package com.neighborhood.app.utils;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.neighborhood.app.entity.user.Follow;
import com.neighborhood.app.mapper.user.FollowMapper;
import com.neighborhood.app.service.CacheService;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/** 文件作用：关注查询工具。 */
public final class FollowLookupUtil {

    private FollowLookupUtil() {
    }

    public static boolean isFollowing(CacheService cacheService, FollowMapper followMapper, String followerId, String followingId) {
        if (isBlank(followerId) || isBlank(followingId)) {
            return false;
        }
        if (cacheService.isFollowingCached(followerId, followingId)) {
            return true;
        }
        boolean following = followMapper.selectCount(new QueryWrapper<Follow>()
                .eq("follower_id", followerId)
                .eq("following_id", followingId)) > 0;
        if (following) {
            cacheService.cacheFollowing(followerId, followingId);
        }
        return following;
    }

    public static Set<String> followedIds(CacheService cacheService, FollowMapper followMapper, String followerId, Collection<String> candidateFollowingIds) {
        if (isBlank(followerId) || candidateFollowingIds == null || candidateFollowingIds.isEmpty()) {
            return Set.of();
        }
        List<String> ids = candidateFollowingIds.stream()
                .filter(id -> !isBlank(id))
                .distinct()
                .toList();
        if (ids.isEmpty()) {
            return Set.of();
        }
        Set<String> followedIds = followMapper.selectObjs(new QueryWrapper<Follow>()
                        .select("following_id")
                        .eq("follower_id", followerId)
                        .in("following_id", ids))
                .stream()
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .filter(id -> !isBlank(id))
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
        followedIds.forEach(id -> cacheService.cacheFollowing(followerId, id));
        return followedIds;
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
