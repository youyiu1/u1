package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.dto.user.NotificationSettings;
import com.neighborhood.app.dto.user.PrivacySettings;
import com.neighborhood.app.dto.user.UserProfileUpdateRequest;
import com.neighborhood.app.entity.user.User;
import java.util.List;

/** 文件作用：用户服务接口。 */
public interface UserService extends IService<User> {
    User register(String name, String email, String password);
    User login(String email, String password);
    User getById(String id);
    User getByName(String name);
    boolean emailExists(String email);
    boolean nameExists(String name);
    boolean follow(String followerId, String followingId);
    boolean unfollow(String followerId, String followingId);
    boolean isFollowing(String followerId, String followingId);
    List<User> getFollowingList(String userId);
    List<User> getSuggestedUsers(String currentUserId, int limit);
    boolean updateById(User user);
    boolean updateProfile(String userId, UserProfileUpdateRequest request);
    boolean changePassword(String userId, String oldPassword, String newPassword);
    boolean resetPasswordByEmail(String email, String newPassword);
    boolean updatePrivacy(String userId, PrivacySettings settings);
    boolean updateNotificationSettings(String userId, NotificationSettings settings);
}
