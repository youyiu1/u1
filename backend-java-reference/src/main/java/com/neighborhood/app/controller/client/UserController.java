package com.neighborhood.app.controller.client;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.dto.user.AuthResponse;
import com.neighborhood.app.dto.user.ChangePasswordRequest;
import com.neighborhood.app.dto.user.FollowRequest;
import com.neighborhood.app.dto.user.NotificationSettings;
import com.neighborhood.app.dto.user.PrivacySettings;
import com.neighborhood.app.dto.user.RegisterRequest;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.service.EmailService;
import com.neighborhood.app.service.UserService;
import com.neighborhood.app.util.JwtUtil;
import com.neighborhood.app.vo.user.UserVO;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private static final String TOKEN_PREFIX = "token:";

    private final UserService userService;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;

    @GetMapping("/{id}")
    public Result<UserVO> getById(@PathVariable String id) {
        return userResult(userService.getById(id));
    }

    /**
     * 获取当前登录用户信息（需登录）
     */
    @GetMapping("/profile/current")
    public Result<UserVO> getCurrentUser(@RequestAttribute String userId) {
        return userResult(userService.getById(userId));
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
        return userResult(user);
    }

    @PostMapping("/register")
    public Result<AuthResponse> register(@RequestBody RegisterRequest request) {
        if (!emailService.verifyCode(request.getEmail(), request.getCode())) {
            return Result.fail("验证码错误或已过期");
        }
        return authResult(userService.register(request.getName(), request.getEmail(), request.getPassword()));
    }

    @PostMapping("/send-code")
    public Result<Boolean> sendCode(@RequestParam String email) {
        emailService.sendVerificationCode(email);
        return booleanResult(true);
    }

    @PostMapping("/login")
    public Result<AuthResponse> login(@RequestBody User user) {
        User loggedIn = userService.login(user.getEmail(), user.getPassword());
        if (loggedIn == null) {
            return Result.fail("Invalid email or password");
        }
        return authResult(loggedIn);
    }

    @PostMapping("/follow")
    public Result<Boolean> follow(@RequestBody FollowRequest request) {
        return booleanResult(userService.follow(request.getFollowerId(), request.getFollowingId()));
    }

    @PostMapping("/unfollow")
    public Result<Boolean> unfollow(@RequestBody FollowRequest request) {
        return booleanResult(userService.unfollow(request.getFollowerId(), request.getFollowingId()));
    }

    @GetMapping("/isfollowing")
    public Result<Boolean> isFollowing(@RequestParam String followerId, @RequestParam String followingId) {
        return booleanResult(userService.isFollowing(followerId, followingId));
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
        return booleanResult(userService.updateById(user));
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
            return Result.fail("新密码至少 6 位");
        }
        return booleanResult(userService.changePassword(userId, request.getOldPassword(), request.getNewPassword()));
    }

    /**
     * 更新隐私设置
     */
    @PostMapping("/privacy")
    public Result<Boolean> updatePrivacy(@RequestAttribute String userId, @RequestBody PrivacySettings settings) {
        return booleanResult(userService.updatePrivacy(userId, settings));
    }

    /**
     * 更新通知设置
     */
    @PostMapping("/notification-settings")
    public Result<Boolean> updateNotificationSettings(@RequestAttribute String userId, @RequestBody NotificationSettings settings) {
        return booleanResult(userService.updateNotificationSettings(userId, settings));
    }

    private Result<UserVO> userResult(User user) {
        return Result.ok(UserVO.fromUser(user));
    }

    private Result<Boolean> booleanResult(boolean success) {
        return Result.ok(success);
    }

    private Result<AuthResponse> authResult(User user) {
        String token = jwtUtil.generateToken(user.getId());
        redisTemplate.opsForValue().set(TOKEN_PREFIX + user.getId(), token, jwtUtil.getExpiration(), TimeUnit.MILLISECONDS);
        return Result.ok(new AuthResponse(UserVO.fromUser(user), token));
    }
}
