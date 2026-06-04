package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.dto.user.NotificationSettings;
import com.neighborhood.app.dto.user.PrivacySettings;
import com.neighborhood.app.entity.user.Follow;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.mapper.user.FollowMapper;
import com.neighborhood.app.mapper.user.UserMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.UserService;
import com.neighborhood.app.utils.CounterSqlUtil;
import com.neighborhood.app.utils.FollowLookupUtil;
import com.neighborhood.app.utils.UserLookupUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Consumer;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private static final String DEFAULT_AVATAR = "/api/file/931f8e1a2d834e03a288800df5a7e6ec.jpg";

    private final FollowMapper followMapper;
    private final CacheService cacheService;
    private final UserMapper userMapper;

    @Override
    public User register(String name, String email, String password) {
        User user = buildRegisteredUser(name, email, password);
        save(user);
        cacheService.cacheUser(user.getId(), user);
        return user;
    }

    @Override
    public User login(String email, String password) {
        return lambdaQuery()
                .eq(User::getEmail, email)
                .eq(User::getPassword, password)
                .one();
    }

    @Override
    public User getById(String id) {
        return UserLookupUtil.getById(cacheService, userMapper, id);
    }

    @Override
    public User getByName(String name) {
        return lambdaQuery()
                .eq(User::getName, name)
                .one();
    }

    @Override
    @Transactional
    public boolean follow(String followerId, String followingId) {
        if (isFollowing(followerId, followingId)) {
            return false;
        }
        followMapper.insert(new Follow(followerId, followingId));
        syncFollowState(followerId, followingId, true);
        return true;
    }

    @Override
    @Transactional
    public boolean unfollow(String followerId, String followingId) {
        if (followMapper.delete(followQuery(followerId, followingId)) == 0) {
            return false;
        }
        syncFollowState(followerId, followingId, false);
        return true;
    }

    @Override
    public boolean isFollowing(String followerId, String followingId) {
        return FollowLookupUtil.isFollowing(cacheService, followMapper, followerId, followingId);
    }

    @Override
    public boolean updateById(User user) {
        return updateAndEvict(user, user.getId());
    }

    @Override
    public boolean updatePrivacy(String userId, PrivacySettings settings) {
        User user = getById(userId);
        if (user == null) {
            return false;
        }
        applyIfPresent(settings.getProfileVisible(), user::setProfileVisible);
        applyIfPresent(settings.getPostsVisible(), user::setPostsVisible);
        applyIfPresent(settings.getShowLocation(), user::setShowLocation);
        return updateAndEvict(user, userId);
    }

    @Override
    public boolean updateNotificationSettings(String userId, NotificationSettings settings) {
        User user = getById(userId);
        if (user == null) {
            return false;
        }
        applyIfPresent(settings.getPushEnabled(), user::setPushEnabled);
        applyIfPresent(settings.getMessageNotify(), user::setMessageNotify);
        applyIfPresent(settings.getFollowNotify(), user::setFollowNotify);
        applyIfPresent(settings.getLikeNotify(), user::setLikeNotify);
        applyIfPresent(settings.getCommentNotify(), user::setCommentNotify);
        applyIfPresent(settings.getSystemNotify(), user::setSystemNotify);
        return updateAndEvict(user, userId);
    }

    @Override
    public boolean changePassword(String userId, String oldPassword, String newPassword) {
        User user = getById(userId);
        if (user == null || !user.getPassword().equals(oldPassword)) {
            return false;
        }
        user.setPassword(newPassword);
        return updateAndEvict(user, userId);
    }

    @Override
    public List<User> getFollowingList(String userId) {
        List<String> followingIds = listFollowingIds(userId);
        if (followingIds.isEmpty()) {
            return List.of();
        }
        Map<String, User> userMap = UserLookupUtil.mapByIds(cacheService, userMapper, followingIds);
        return followingIds.stream()
                .map(userMap::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Override
    public List<User> getSuggestedUsers(String currentUserId, int limit) {
        List<String> excludeIds = new ArrayList<>(listFollowingIds(currentUserId));
        if (currentUserId != null && !currentUserId.isBlank()) {
            excludeIds.add(currentUserId);
        }
        int safeLimit = Math.max(1, limit);
        return lambdaQuery()
                .notIn(!excludeIds.isEmpty(), User::getId, excludeIds)
                .orderByDesc(User::getFollowersCount)
                .last("LIMIT " + safeLimit)
                .list();
    }

    private void updateUserCounts(String followerId, String followingId, int followerDelta, int followingDelta) {
        userMapper.update(null, new UpdateWrapper<User>()
                .eq("id", followerId)
                .setSql(CounterSqlUtil.nonNegativeCoalescedDelta("following_count", followingDelta)));
        userMapper.update(null, new UpdateWrapper<User>()
                .eq("id", followingId)
                .setSql(CounterSqlUtil.nonNegativeCoalescedDelta("followers_count", followerDelta)));
    }

    private QueryWrapper<Follow> followQuery(String followerId, String followingId) {
        return new QueryWrapper<Follow>()
                .eq("follower_id", followerId)
                .eq("following_id", followingId);
    }

    private QueryWrapper<Follow> followerQuery(String followerId) {
        return new QueryWrapper<Follow>().eq("follower_id", followerId);
    }

    private List<String> listFollowingIds(String userId) {
        return UserLookupUtil.normalizeIds(followMapper.selectObjs(followerQuery(userId).select("following_id")).stream()
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .collect(Collectors.toCollection(ArrayList::new)));
    }

    private boolean updateAndEvict(User user, String userId) {
        boolean result = super.updateById(user);
        if (result) {
            cacheService.evictUser(userId);
        }
        return result;
    }

    private <T> void applyIfPresent(T value, Consumer<T> consumer) {
        if (value != null) {
            consumer.accept(value);
        }
    }

    private User buildRegisteredUser(String name, String email, String password) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password);
        user.setAvatar(DEFAULT_AVATAR);
        user.setTag("鏂版檵閭诲眳");
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
        return user;
    }

    private void syncFollowState(String followerId, String followingId, boolean following) {
        if (following) {
            cacheService.cacheFollowing(followerId, followingId);
            updateUserCounts(followerId, followingId, 1, 1);
        } else {
            cacheService.removeFollowing(followerId, followingId);
            updateUserCounts(followerId, followingId, -1, -1);
        }
        evictUsers(followerId, followingId);
    }

    private void evictUsers(String... userIds) {
        for (String userId : userIds) {
            cacheService.evictUser(userId);
        }
    }
}
