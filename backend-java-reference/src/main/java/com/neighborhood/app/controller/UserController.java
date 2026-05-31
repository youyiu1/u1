package com.neighborhood.app.controller;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.dto.ChangePasswordRequest;
import com.neighborhood.app.dto.FollowRequest;
import com.neighborhood.app.dto.NotificationSettings;
import com.neighborhood.app.dto.PrivacySettings;
import com.neighborhood.app.dto.RegisterRequest;
import com.neighborhood.app.dto.AuthResponse;
import com.neighborhood.app.entity.User;
import com.neighborhood.app.service.EmailService;
import com.neighborhood.app.service.UserService;
import com.neighborhood.app.util.JwtUtil;
import com.neighborhood.app.vo.UserVO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;

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
        if (!emailService.verifyCode(request.getEmail(), request.getCode())) {
            return Result.fail("验证码错误或已过期");
        }
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
     * 获取推荐用户
     */
    @GetMapping("/suggested")
    public Result<List<User>> getSuggestedUsers(
            @RequestParam(required = false) String currentUserId,
            @RequestParam(defaultValue = "5") int limit,
            HttpServletRequest request) {
        if (currentUserId == null || currentUserId.isEmpty()) {
            currentUserId = (String) request.getAttribute("userId");
        }
        return Result.ok(userService.getSuggestedUsers(currentUserId, limit));
    }

    @PostMapping("/update")
    public Result<Boolean> update(@RequestAttribute String userId, @RequestBody User user) {
        user.setId(userId);
        return Result.ok(userService.updateById(user));
    }

    /**
     * 修改密码（需验证旧密码）
     */
    @PostMapping("/change-password")
    public Result<Boolean> changePassword(@RequestAttribute String userId, @RequestBody ChangePasswordRequest request) {
        if (request.getOldPassword() == null || request.getNewPassword() == null) {
            return Result.fail("旧密码和新密码不能为空");
        }
        if (request.getNewPassword().length() < 6) {
            return Result.fail("新密码至少6位");
        }
        return Result.ok(userService.changePassword(userId, request.getOldPassword(), request.getNewPassword()));
    }

    /**
     * 更新隐私设置
     */
    @PostMapping("/privacy")
    public Result<Boolean> updatePrivacy(@RequestAttribute String userId, @RequestBody PrivacySettings settings) {
        return Result.ok(userService.updatePrivacy(userId, settings));
    }

    /**
     * 更新通知设置
     */
    @PostMapping("/notification-settings")
    public Result<Boolean> updateNotificationSettings(@RequestAttribute String userId, @RequestBody NotificationSettings settings) {
        return Result.ok(userService.updateNotificationSettings(userId, settings));
    }
}
