/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.entity.User;
import com.neighborhood.app.entity.UserVO;
import com.neighborhood.app.entity.AuthResponse;
import com.neighborhood.app.service.UserService;
import com.neighborhood.app.service.EmailService;
import com.neighborhood.app.common.Result;
import com.neighborhood.app.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private EmailService emailService;
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

    /**
     * 获取当前登录用户信息（需登录）
     */
    @GetMapping("/profile/current")
    public Result<UserVO> getCurrentUser(@RequestAttribute String userId) {
        User user = userService.getById(userId);
        return Result.ok(UserVO.fromUser(user));
    }

    /**
     * 根据用户名获取用户信息（公开接口）
     */
    @GetMapping("/name/{name}")
    public Result<UserVO> getByName(@PathVariable String name) {
        User user = userService.getByName(name);
        if (user == null) {
            return Result.fail("用户不存在");
        }
        return Result.ok(UserVO.fromUser(user));
    }

    @PostMapping("/register")
    public Result<AuthResponse> register(@RequestBody RegisterRequest request) {
        // 验证验证码
        if (!emailService.verifyCode(request.getEmail(), request.getCode())) {
            return Result.fail("验证码错误或已过期");
        }
        // 注册用户
        User registered = userService.register(request.getName(), request.getEmail(), request.getPassword());
        String token = jwtUtil.generateToken(registered.getId());
        redisTemplate.opsForValue().set(TOKEN_PREFIX + registered.getId(), token, jwtUtil.getExpiration(), TimeUnit.MILLISECONDS);
        return Result.ok(new AuthResponse(UserVO.fromUser(registered), token));
    }

    @PostMapping("/send-code")
    public Result<Boolean> sendCode(@RequestParam String email) {
        emailService.sendVerificationCode(email);
        return Result.ok(true);
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

    /**
     * 获取用户关注列表
     */
    @GetMapping("/{userId}/following")
    public Result<List<User>> getFollowingList(@PathVariable String userId) {
        return Result.ok(userService.getFollowingList(userId));
    }

    /**
     * 获取推荐用户（排除已关注）
     */
    @GetMapping("/suggested")
    public Result<List<User>> getSuggestedUsers(
            @RequestParam(required = false) String currentUserId,
            @RequestParam(defaultValue = "5") int limit,
            HttpServletRequest request) {
        // 如果没传currentUserId，从token获取
        if (currentUserId == null || currentUserId.isEmpty()) {
            currentUserId = (String) request.getAttribute("userId");
        }
        return Result.ok(userService.getSuggestedUsers(currentUserId, limit));
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

    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private String code;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
    }
}