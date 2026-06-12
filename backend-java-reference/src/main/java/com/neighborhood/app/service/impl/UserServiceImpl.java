package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.dto.user.NotificationSettings;
import com.neighborhood.app.dto.user.PrivacySettings;
import com.neighborhood.app.dto.user.UserProfileUpdateRequest;
import com.neighborhood.app.entity.user.Follow;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.mapper.user.FollowMapper;
import com.neighborhood.app.mapper.user.UserMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.FileService;
import com.neighborhood.app.service.UserService;
import com.neighborhood.app.utils.CounterSqlUtil;
import com.neighborhood.app.utils.FollowLookupUtil;
import com.neighborhood.app.utils.PasswordCodec;
import com.neighborhood.app.utils.UserLookupUtil;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 文件作用：用户服务实现。 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private final FollowMapper followMapper;
    private final CacheService cacheService;
    private final UserMapper userMapper;
    private final PasswordCodec passwordCodec;
    private final FileService fileService;

    @Override
    public User register(String name, String email, String password) {
        assertRegisterAvailable(name, email);
        User user = buildRegisteredUser(name, email, password);
        save(user);
        cacheService.cacheUser(user.getId(), user);
        return user;
    }

    @Override
    public User login(String email, String password) {
        User user = lambdaQuery()
                .eq(User::getEmail, email)
                .one();
        if (!passwordMatched(user, password)) {
            return null;
        }
        upgradePasswordIfNeeded(user, password);
        return user;
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
    public boolean emailExists(String email) {
        return !trimToEmpty(email).isEmpty()
                && lambdaQuery().eq(User::getEmail, trimToEmpty(email)).count() > 0;
    }

    @Override
    public boolean nameExists(String name) {
        return !trimToEmpty(name).isEmpty()
                && lambdaQuery().eq(User::getName, trimToEmpty(name)).count() > 0;
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
    public boolean updateProfile(String userId, UserProfileUpdateRequest request) {
        User user = getById(userId);
        if (user == null || request == null) {
            return false;
        }
        String nextName = trimToEmpty(request.getName());
        if (nextName.isEmpty()) {
            throw new IllegalArgumentException("昵称不能为空");
        }
        if (!nextName.equals(user.getName()) && nameExists(nextName)) {
            throw new IllegalArgumentException("用户名已存在");
        }
        user.setName(nextName);
        user.setAvatar(resolveProfileAvatar(user.getAvatar(), request.getAvatar()));
        user.setTag(trimToEmpty(request.getTag()));
        user.setBio(trimToEmpty(request.getBio()));
        user.setPhone(trimToEmpty(request.getPhone()));
        user.setRegion(trimToEmpty(request.getRegion()));
        return updateAndEvict(user, userId);
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
        if (!passwordMatched(user, oldPassword)) {
            return false;
        }
        user.setPassword(passwordCodec.encode(newPassword));
        return updateAndEvict(user, userId);
    }

    @Override
    public boolean resetPasswordByEmail(String email, String newPassword) {
        User user = lambdaQuery()
                .eq(User::getEmail, email)
                .one();
        if (user == null) {
            return false;
        }
        user.setPassword(passwordCodec.encode(newPassword));
        return updateAndEvict(user, user.getId());
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
        int safeLimit = Math.min(Math.max(1, limit), 20);
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
        user.setName(trimToEmpty(name));
        user.setEmail(trimToEmpty(email));
        user.setPassword(passwordCodec.encode(password));
        user.setAvatar(fileService.ensureDefaultAvatar());
        user.setTag("社区新人");
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

    private void assertRegisterAvailable(String name, String email) {
        if (emailExists(email)) {
            throw new IllegalArgumentException("邮箱已注册");
        }
        if (nameExists(name)) {
            throw new IllegalArgumentException("用户名已存在");
        }
    }

    private boolean passwordMatched(User user, String rawPassword) {
        return user != null && passwordCodec.matches(rawPassword, user.getPassword());
    }

    private void upgradePasswordIfNeeded(User user, String rawPassword) {
        if (user == null || !passwordCodec.needsUpgrade(user.getPassword())) {
            return;
        }
        user.setPassword(passwordCodec.encode(rawPassword));
        updateAndEvict(user, user.getId());
    }

    private String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private String resolveProfileAvatar(String currentAvatar, String requestedAvatar) {
        String nextAvatar = trimToEmpty(requestedAvatar);
        if (!nextAvatar.isEmpty()) {
            return nextAvatar;
        }
        String existingAvatar = trimToEmpty(currentAvatar);
        return existingAvatar.isEmpty() ? fileService.ensureDefaultAvatar() : existingAvatar;
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
