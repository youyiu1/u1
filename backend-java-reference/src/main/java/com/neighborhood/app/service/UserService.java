/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.Follow;
import com.neighborhood.app.entity.User;
import com.neighborhood.app.mapper.FollowMapper;
import com.neighborhood.app.mapper.UserMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService extends ServiceImpl<UserMapper, User> {

    private final FollowMapper followMapper;

    public UserService(FollowMapper followMapper) {
        super();
        this.followMapper = followMapper;
    }

    public User register(String name, String email, String password) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password);
        user.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=" + email);
        user.setTag("新晋邻居");
        user.setIsVerified(false);
        user.setFollowersCount(0);
        user.setFollowingCount(0);
        save(user);
        return user;
    }

    public User login(String email, String password) {
        return getOne(new QueryWrapper<User>().eq("email", email).eq("password", password));
    }

    @Transactional
    public boolean follow(String followerId, String followingId) {
        if (isFollowing(followerId, followingId)) {
            return false;
        }
        followMapper.insert(new Follow(followerId, followingId));
        updateUserCounts(followerId, followingId, 1, 1);
        return true;
    }

    @Transactional
    public boolean unfollow(String followerId, String followingId) {
        QueryWrapper<Follow> wrapper = new QueryWrapper<Follow>()
            .eq("follower_id", followerId)
            .eq("following_id", followingId);
        if (followMapper.delete(wrapper) == 0) {
            return false;
        }
        updateUserCounts(followerId, followingId, -1, -1);
        return true;
    }

    public boolean isFollowing(String followerId, String followingId) {
        return followMapper.selectCount(
            new QueryWrapper<Follow>()
                .eq("follower_id", followerId)
                .eq("following_id", followingId)
        ) > 0;
    }

    private void updateUserCounts(String followerId, String followingId, int followerDelta, int followingDelta) {
        User follower = getById(followerId);
        User following = getById(followingId);
        if (follower != null && follower.getFollowingCount() != null) {
            follower.setFollowingCount(Math.max(0, follower.getFollowingCount() + followingDelta));
            updateById(follower);
        }
        if (following != null && following.getFollowersCount() != null) {
            following.setFollowersCount(Math.max(0, following.getFollowersCount() + followerDelta));
            updateById(following);
        }
    }
}