/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.User;
import java.util.List;

public interface UserService extends IService<User> {
    User register(String name, String email, String password);
    User login(String email, String password);
    User getById(String id);
    User getByName(String name);
    boolean follow(String followerId, String followingId);
    boolean unfollow(String followerId, String followingId);
    boolean isFollowing(String followerId, String followingId);
    List<User> getFollowingList(String userId);  // 获取用户关注列表
    List<User> getSuggestedUsers(String currentUserId, int limit);  // 获取推荐用户
    boolean updateById(User user);
    boolean changePassword(String userId, String oldPassword, String newPassword);  // 修改密码
}