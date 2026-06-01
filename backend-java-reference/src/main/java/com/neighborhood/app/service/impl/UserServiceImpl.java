package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.dto.NotificationSettings;
import com.neighborhood.app.dto.PrivacySettings;
import com.neighborhood.app.entity.Follow;
import com.neighborhood.app.entity.User;
import com.neighborhood.app.mapper.FollowMapper;
import com.neighborhood.app.mapper.UserMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.UserService;
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
    private final UserMapper userMapper;

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
        user.setPushEnabled(true);
        user.setMessageNotify(true);
        user.setFollowNotify(true);
        user.setLikeNotify(true);
        user.setCommentNotify(true);
        user.setSystemNotify(false);
        user.setProfileVisible("public");
        user.setPostsVisible("public");
        user.setShowLocation(true);
        save(user);
        cacheService.cacheUser(user.getId(), user);
        return user;
    }

    @Override
    public User login(String email, String password) {
        return getOne(userQuery().eq("email", email).eq("password", password));
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
        return getOne(userQuery().eq("name", name));
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
        if (followMapper.delete(followQuery(followerId, followingId)) == 0) {
            return false;
        }
        updateUserCounts(followerId, followingId, -1, -1);
        cacheService.evictUser(followerId);
        cacheService.evictUser(followingId);
        return true;
    }

    @Override
    public boolean isFollowing(String followerId, String followingId) {
        return followMapper.selectCount(followQuery(followerId, followingId)) > 0;
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
    public boolean updatePrivacy(String userId, PrivacySettings settings) {
        User user = getById(userId);
        if (user == null) {
            return false;
        }
        if (settings.getProfileVisible() != null) {
            user.setProfileVisible(settings.getProfileVisible());
        }
        if (settings.getPostsVisible() != null) {
            user.setPostsVisible(settings.getPostsVisible());
        }
        if (settings.getShowLocation() != null) {
            user.setShowLocation(settings.getShowLocation());
        }
        boolean result = super.updateById(user);
        if (result) {
            cacheService.evictUser(userId);
        }
        return result;
    }

    @Override
    public boolean updateNotificationSettings(String userId, NotificationSettings settings) {
        User user = getById(userId);
        if (user == null) {
            return false;
        }
        if (settings.getPushEnabled() != null) {
            user.setPushEnabled(settings.getPushEnabled());
        }
        if (settings.getMessageNotify() != null) {
            user.setMessageNotify(settings.getMessageNotify());
        }
        if (settings.getFollowNotify() != null) {
            user.setFollowNotify(settings.getFollowNotify());
        }
        if (settings.getLikeNotify() != null) {
            user.setLikeNotify(settings.getLikeNotify());
        }
        if (settings.getCommentNotify() != null) {
            user.setCommentNotify(settings.getCommentNotify());
        }
        if (settings.getSystemNotify() != null) {
            user.setSystemNotify(settings.getSystemNotify());
        }
        boolean result = super.updateById(user);
        if (result) {
            cacheService.evictUser(userId);
        }
        return result;
    }

    @Override
    public boolean changePassword(String userId, String oldPassword, String newPassword) {
        User user = getById(userId);
        if (user == null) {
            return false;
        }
        if (!user.getPassword().equals(oldPassword)) {
            return false;
        }
        user.setPassword(newPassword);
        boolean result = super.updateById(user);
        if (result) {
            cacheService.evictUser(userId);
        }
        return result;
    }

    private void updateUserCounts(String followerId, String followingId, int followerDelta, int followingDelta) {
        userMapper.update(null, new UpdateWrapper<User>()
                .eq("id", followerId)
                .setSql("following_count = GREATEST(COALESCE(following_count, 0) + (" + followingDelta + "), 0)"));
        userMapper.update(null, new UpdateWrapper<User>()
                .eq("id", followingId)
                .setSql("followers_count = GREATEST(COALESCE(followers_count, 0) + (" + followerDelta + "), 0)"));
    }

    @Override
    public List<User> getFollowingList(String userId) {
        List<Follow> follows = followMapper.selectList(followerQuery(userId));
        if (follows.isEmpty()) {
            return List.of();
        }
        List<String> followingIds = follows.stream().map(Follow::getFollowingId).collect(Collectors.toList());
        return getBaseMapper().selectBatchIds(followingIds);
    }

    @Override
    public List<User> getSuggestedUsers(String currentUserId, int limit) {
        List<Follow> follows = followMapper.selectList(followerQuery(currentUserId));
        List<String> excludeIds = follows.stream().map(Follow::getFollowingId).collect(Collectors.toList());
        excludeIds.add(currentUserId);
        return lambdaQuery()
                .notIn(excludeIds.size() > 0, User::getId, excludeIds)
                .orderByDesc(User::getFollowersCount)
                .last("LIMIT " + limit)
                .list();
    }

    private QueryWrapper<User> userQuery() {
        return new QueryWrapper<>();
    }

    private QueryWrapper<Follow> followQuery(String followerId, String followingId) {
        return new QueryWrapper<Follow>()
                .eq("follower_id", followerId)
                .eq("following_id", followingId);
    }

    private QueryWrapper<Follow> followerQuery(String followerId) {
        return new QueryWrapper<Follow>().eq("follower_id", followerId);
    }
}
