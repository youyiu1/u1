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
import java.awt.Color;
import java.awt.Font;
import java.awt.GradientPaint;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.Ellipse2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import javax.imageio.ImageIO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 文件作用：用户服务实现。 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private static final int AVATAR_SIZE = 256;
    private static final Color[] AVATAR_PALETTE = new Color[] {
            new Color(0xF59E0B),
            new Color(0xEF4444),
            new Color(0x10B981),
            new Color(0x3B82F6),
            new Color(0xEC4899),
            new Color(0x8B5CF6)
    };

    private final FollowMapper followMapper;
    private final CacheService cacheService;
    private final UserMapper userMapper;
    private final PasswordCodec passwordCodec;
    private final FileService fileService;

    @Override
    public User register(String name, String email, String password) {
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
        user.setName(trimToEmpty(request.getName()));
        user.setAvatar(trimToEmpty(request.getAvatar()));
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
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordCodec.encode(password));
        user.setAvatar(createDefaultAvatar(name));
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

    private String createDefaultAvatar(String name) {
        try {
            return fileService.uploadBytes(renderDefaultAvatar(name), buildAvatarFilename(name));
        } catch (IOException exception) {
            throw new IllegalStateException("默认头像创建失败", exception);
        }
    }

    private byte[] renderDefaultAvatar(String name) throws IOException {
        BufferedImage image = new BufferedImage(AVATAR_SIZE, AVATAR_SIZE, BufferedImage.TYPE_INT_ARGB);
        Graphics2D graphics = image.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            graphics.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

            Color primary = AVATAR_PALETTE[Math.floorMod(trimToEmpty(name).hashCode(), AVATAR_PALETTE.length)];
            Color secondary = primary.brighter();

            graphics.setPaint(new GradientPaint(0, 0, primary, AVATAR_SIZE, AVATAR_SIZE, secondary));
            graphics.fillRect(0, 0, AVATAR_SIZE, AVATAR_SIZE);

            graphics.setColor(new Color(255, 255, 255, 48));
            graphics.fill(new Ellipse2D.Double(24, 24, 96, 96));
            graphics.fill(new Ellipse2D.Double(148, 136, 72, 72));

            graphics.setColor(new Color(255, 255, 255, 220));
            graphics.fill(new Ellipse2D.Double(48, 48, 160, 160));

            graphics.setColor(primary.darker());
            graphics.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 92));
            String glyph = avatarGlyph(name);
            var metrics = graphics.getFontMetrics();
            int x = (AVATAR_SIZE - metrics.stringWidth(glyph)) / 2;
            int y = ((AVATAR_SIZE - metrics.getHeight()) / 2) + metrics.getAscent();
            graphics.drawString(glyph, x, y);
        } finally {
            graphics.dispose();
        }

        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "png", output);
        return output.toByteArray();
    }

    private String buildAvatarFilename(String name) {
        return "avatar-" + Math.abs(trimToEmpty(name).hashCode()) + ".png";
    }

    private String avatarGlyph(String name) {
        String trimmed = trimToEmpty(name);
        if (trimmed.isEmpty()) {
            return "?";
        }
        int firstCodePoint = trimmed.codePointAt(0);
        return new String(Character.toChars(firstCodePoint)).toUpperCase();
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
