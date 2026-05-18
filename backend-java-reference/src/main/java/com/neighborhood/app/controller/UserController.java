/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.entity.User;
import com.neighborhood.app.entity.UserVO;
import com.neighborhood.app.entity.AuthResponse;
import com.neighborhood.app.service.UserService;
import com.neighborhood.app.common.Result;
import com.neighborhood.app.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String TOKEN_PREFIX = "token:";

    @GetMapping("/{id}")
    public Result<UserVO> getById(@PathVariable String id) {
        User user = userService.getById(id);
        return Result.ok(UserVO.fromUser(user));
    }

    @PostMapping("/register")
    public Result<AuthResponse> register(@RequestBody User user) {
        User registered = userService.register(user.getName(), user.getEmail(), user.getPassword());
        String token = jwtUtil.generateToken(registered.getId());
        redisTemplate.opsForValue().set(TOKEN_PREFIX + registered.getId(), token, jwtUtil.getExpiration(), TimeUnit.MILLISECONDS);
        return Result.ok(new AuthResponse(UserVO.fromUser(registered), token));
    }

    @PostMapping("/login")
    public Result<AuthResponse> login(@RequestBody User user) {
        User loggedIn = userService.login(user.getEmail(), user.getPassword());
        if (loggedIn == null) {
            return Result.fail("Invalid email or password");
        }
        String token = jwtUtil.generateToken(loggedIn.getId());
        redisTemplate.opsForValue().set(TOKEN_PREFIX + loggedIn.getId(), token, jwtUtil.getExpiration(), TimeUnit.MILLISECONDS);
        return Result.ok(new AuthResponse(UserVO.fromUser(loggedIn), token));
    }

    @PostMapping("/follow")
    public Result<Boolean> follow(@RequestBody FollowRequest request) {
        boolean success = userService.follow(request.getFollowerId(), request.getFollowingId());
        return Result.ok(success);
    }

    @PostMapping("/unfollow")
    public Result<Boolean> unfollow(@RequestBody FollowRequest request) {
        boolean success = userService.unfollow(request.getFollowerId(), request.getFollowingId());
        return Result.ok(success);
    }

    @GetMapping("/isfollowing")
    public Result<Boolean> isFollowing(@RequestParam String followerId, @RequestParam String followingId) {
        return Result.ok(userService.isFollowing(followerId, followingId));
    }

    @PostMapping("/update")
    public Result<Boolean> update(@RequestBody User user) {
        return Result.ok(userService.updateById(user));
    }

    public static class FollowRequest {
        private String followerId;
        private String followingId;

        public String getFollowerId() { return followerId; }
        public void setFollowerId(String followerId) { this.followerId = followerId; }
        public String getFollowingId() { return followingId; }
        public void setFollowingId(String followingId) { this.followingId = followingId; }
    }
}