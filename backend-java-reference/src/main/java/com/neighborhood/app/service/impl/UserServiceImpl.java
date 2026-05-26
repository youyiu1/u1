/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.Follow;
import com.neighborhood.app.entity.User;
import com.neighborhood.app.mapper.FollowMapper;
import com.neighborhood.app.mapper.UserMapper;
import com.neighborhood.app.service.UserService;
import com.neighborhood.app.service.CacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private final FollowMapper followMapper;
    private final CacheService cacheService;

    @Override
    public User register(String name, String email, String password) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password);
        user.setAvatar("/api/file/931f8e1a2d834e03a288800df5a7e6ec.jpg");
        user.setTag("新晋邻居");
        user.setIsVerified(false);
        user.setFollowersCount(0);
        user.setFollowingCount(0);
        save(user);
        cacheService.cacheUser(user.getId(), user);
        return user;
    }

    @Override
    public User login(String email, String password) {
        return getOne(new QueryWrapper<User>().eq("email", email).eq("password", password));
    }

    @Override
    public User getById(String id) {
        User cached = cacheService.getCachedUser(id);
        if (cached != null) {
            return cached;
        }
        User user = super.getById(id);
        if (user != null) {
            cacheService.cacheUser(id, user);
        }
        return user;
    }

    @Override
    public User getByName(String name) {
        return getOne(new QueryWrapper<User>().eq("name", name));
    }

    @Override
    @Transactional
    public boolean follow(String followerId, String followingId) {
        if (isFollowing(followerId, followingId)) {
            return false;
        }
        Follow follow = new Follow(followerId, followingId);
        followMapper.insert(follow);
        updateUserCounts(followerId, followingId, 1, 1);
        cacheService.evictUser(followerId);
        cacheService.evictUser(followingId);
        return true;
    }

    @Override
    @Transactional
    public boolean unfollow(String followerId, String followingId) {
        QueryWrapper<Follow> wrapper = new QueryWrapper<Follow>()
                .eq("follower_id", followerId)
                .eq("following_id", followingId);
        if (followMapper.delete(wrapper) == 0) {
            return false;
        }
        updateUserCounts(followerId, followingId, -1, -1);
        cacheService.evictUser(followerId);
        cacheService.evictUser(followingId);
        return true;
    }

    @Override
    public boolean isFollowing(String followerId, String followingId) {
        return followMapper.selectCount(
                new QueryWrapper<Follow>()
                        .eq("follower_id", followerId)
                        .eq("following_id", followingId)
        ) > 0;
    }

    @Override
    public boolean updateById(User user) {
        boolean result = super.updateById(user);
        if (result) {
            cacheService.evictUser(user.getId());
        }
        return result;
    }

    @Override
    public boolean changePassword(String userId, String oldPassword, String newPassword) {
        User user = getById(userId);
        if (user == null) {
            return false;
        }
        // 验证旧密码
        if (!user.getPassword().equals(oldPassword)) {
            return false;
        }
        // 更新新密码
        user.setPassword(newPassword);
        boolean result = super.updateById(user);
        if (result) {
            cacheService.evictUser(userId);
        }
        return result;
    }

    private void updateUserCounts(String followerId, String followingId, int followerDelta, int followingDelta) {
        User follower = getById(followerId);
        User following = getById(followingId);
        if (follower != null && follower.getFollowingCount() != null) {
            follower.setFollowingCount(Math.max(0, follower.getFollowingCount() + followingDelta));
            super.updateById(follower);
        }
        if (following != null && following.getFollowersCount() != null) {
            following.setFollowersCount(Math.max(0, following.getFollowersCount() + followerDelta));
            super.updateById(following);
        }
    }

    @Override
    public List<User> getFollowingList(String userId) {
        // 获取该用户关注的所有用户ID
        List<Follow> follows = followMapper.selectList(
                new QueryWrapper<Follow>().eq("follower_id", userId)
        );
        if (follows.isEmpty()) {
            return List.of();
        }
        List<String> followingIds = follows.stream()
                .map(Follow::getFollowingId)
                .collect(Collectors.toList());
        return getBaseMapper().selectBatchIds(followingIds);
    }

    @Override
    public List<User> getSuggestedUsers(String currentUserId, int limit) {
        // 获取当前用户已关注的所有用户ID
        List<Follow> follows = followMapper.selectList(
                new QueryWrapper<Follow>().eq("follower_id", currentUserId)
        );
        List<String> excludeIds = follows.stream()
                .map(Follow::getFollowingId)
                .collect(Collectors.toList());
        // 排除自己和已关注的人
        excludeIds.add(currentUserId);

        return lambdaQuery()
                .notIn(excludeIds.size() > 0, User::getId, excludeIds)
                .orderByDesc(User::getFollowersCount)
                .last("LIMIT " + limit)
                .list();
    }
}