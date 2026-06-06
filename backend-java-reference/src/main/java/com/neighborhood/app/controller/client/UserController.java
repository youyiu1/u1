package com.neighborhood.app.controller.client;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.common.ResultUtils;
import com.neighborhood.app.dto.user.AuthResponse;
import com.neighborhood.app.dto.user.ChangePasswordRequest;
import com.neighborhood.app.dto.user.FollowRequest;
import com.neighborhood.app.dto.user.NotificationSettings;
import com.neighborhood.app.dto.user.PrivacySettings;
import com.neighborhood.app.dto.user.RegisterRequest;
import com.neighborhood.app.dto.user.UserLoginRequest;
import com.neighborhood.app.dto.user.UserProfileUpdateRequest;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.service.EmailService;
import com.neighborhood.app.service.UserService;
import com.neighborhood.app.util.JwtUtil;
import com.neighborhood.app.utils.AuthTokenStore;
import com.neighborhood.app.utils.RequestUserUtil;
import com.neighborhood.app.vo.user.PublicUserVO;
import com.neighborhood.app.vo.user.UserVO;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 用户端用户接口。 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private static final String USER_NOT_FOUND_MESSAGE = "用户不存在";
    private static final String OPERATION_FAILED_MESSAGE = "操作失败，请稍后重试";

    private final UserService userService;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;
    private final AuthTokenStore authTokenStore;

    /** 获取用户详情。 */
    @GetMapping("/{id}")
    public Result<UserVO> getById(@PathVariable String id) {
        return userResult(userService.getById(id));
    }

    /** 获取当前登录用户信息。 */
    @GetMapping("/profile/current")
    public Result<UserVO> getCurrentUser(@RequestAttribute String userId) {
        return userResult(userService.getById(userId));
    }

    /** 根据用户名获取用户信息。 */
    @GetMapping("/name/{name}")
    public Result<UserVO> getByName(@PathVariable String name) {
        return userResult(userService.getByName(name));
    }

    /** 用户注册。 */
    @PostMapping("/register")
    public Result<AuthResponse> register(@RequestBody RegisterRequest request) {
        if (!emailService.verifyCode(request.getEmail(), request.getCode())) {
            return ResultUtils.fail("验证码错误或已过期");
        }
        User user = userService.register(request.getName(), request.getEmail(), request.getPassword());
        return authResult(user);
    }

    /** 发送注册验证码。 */
    @PostMapping("/send-code")
    public Result<Boolean> sendCode(@RequestParam String email) {
        try {
            emailService.sendVerificationCode(email);
            return ResultUtils.bool(true);
        } catch (RuntimeException exception) {
            return ResultUtils.fail(exception.getMessage());
        }
    }

    /** 用户登录。 */
    @PostMapping("/login")
    public Result<AuthResponse> login(@RequestBody UserLoginRequest request) {
        User loggedIn = userService.login(request.getEmail(), request.getPassword());
        if (loggedIn == null) {
            return ResultUtils.fail("用户名或密码错误");
        }
        return authResult(loggedIn);
    }

    /** 用户退出登录。 */
    @PostMapping("/logout")
    public Result<Boolean> logout(@RequestAttribute String userId, HttpServletRequest request) {
        String token = RequestUserUtil.currentBearerToken(request);
        if (token == null || token.isBlank()) {
            return ResultUtils.bool(true);
        }
        return ResultUtils.bool(authTokenStore.revokeToken(userId, token));
    }

    /** 关注用户。 */
    @PostMapping("/follow")
    public Result<Boolean> follow(@RequestBody FollowRequest request, HttpServletRequest httpRequest) {
        return ResultUtils.bool(userService.follow(
                RequestUserUtil.currentUserId(httpRequest),
                request.getFollowingId()
        ));
    }

    /** 取消关注用户。 */
    @PostMapping("/unfollow")
    public Result<Boolean> unfollow(@RequestBody FollowRequest request, HttpServletRequest httpRequest) {
        return ResultUtils.bool(userService.unfollow(
                RequestUserUtil.currentUserId(httpRequest),
                request.getFollowingId()
        ));
    }

    /** 查询是否已关注用户。 */
    @GetMapping("/isfollowing")
    public Result<Boolean> isFollowing(@RequestParam String followerId, @RequestParam String followingId) {
        return ResultUtils.bool(userService.isFollowing(followerId, followingId));
    }

    /** 获取用户关注列表。 */
    @GetMapping("/{userId}/following")
    public Result<List<PublicUserVO>> getFollowingList(@PathVariable String userId) {
        return ResultUtils.ok(userService.getFollowingList(userId).stream()
                .map(PublicUserVO::fromUser)
                .toList());
    }

    /** 获取推荐用户列表。 */
    @GetMapping("/suggested")
    public Result<List<PublicUserVO>> getSuggestedUsers(
            @RequestParam(required = false) String currentUserId,
            @RequestParam(defaultValue = "5") int limit,
            HttpServletRequest request) {
        return ResultUtils.ok(userService.getSuggestedUsers(
                effectiveUserId(request, currentUserId),
                limit
        ).stream()
                .map(PublicUserVO::fromUser)
                .toList());
    }

    /** 更新当前登录用户资料。 */
    @PostMapping("/update")
    public Result<Boolean> update(@RequestAttribute String userId, @RequestBody UserProfileUpdateRequest request) {
        if (request == null || request.getName() == null || request.getName().trim().isEmpty()) {
            return ResultUtils.fail("昵称不能为空");
        }
        return ResultUtils.bool(userService.updateProfile(userId, request));
    }

    /** 修改密码。 */
    @PostMapping("/change-password")
    public Result<Boolean> changePassword(@RequestAttribute String userId, @RequestBody ChangePasswordRequest request) {
        if (request.getOldPassword() == null || request.getNewPassword() == null) {
            return ResultUtils.fail("旧密码和新密码不能为空");
        }
        if (request.getNewPassword().length() < 6) {
            return ResultUtils.fail("新密码至少 6 位");
        }
        return ResultUtils.bool(userService.changePassword(userId, request.getOldPassword(), request.getNewPassword()));
    }

    /** 更新隐私设置。 */
    @PostMapping("/privacy")
    public Result<Boolean> updatePrivacy(@RequestAttribute String userId, @RequestBody PrivacySettings settings) {
        return ResultUtils.bool(userService.updatePrivacy(userId, settings));
    }

    /** 更新通知设置。 */
    @PostMapping("/notification-settings")
    public Result<Boolean> updateNotificationSettings(@RequestAttribute String userId, @RequestBody NotificationSettings settings) {
        return ResultUtils.bool(userService.updateNotificationSettings(userId, settings));
    }

    private Result<UserVO> userResult(User user) {
        if (user == null) {
            return ResultUtils.fail(USER_NOT_FOUND_MESSAGE);
        }
        return ResultUtils.ok(buildUserVO(user));
    }

    private Result<AuthResponse> authResult(User user) {
        if (user == null) {
            return ResultUtils.fail(OPERATION_FAILED_MESSAGE);
        }
        String token = jwtUtil.generateToken(user.getId());
        if (!cacheToken(user.getId(), token)) {
            return ResultUtils.fail(OPERATION_FAILED_MESSAGE);
        }
        UserVO userVO = buildUserVO(user);
        userVO.setIsOnline(true);
        return ResultUtils.ok(new AuthResponse(userVO, token));
    }

    private String effectiveUserId(HttpServletRequest request, String userId) {
        return RequestUserUtil.getEffectiveUserId(request, userId);
    }

    private UserVO buildUserVO(User user) {
        UserVO userVO = UserVO.fromUser(user);
        userVO.setIsOnline(authTokenStore.hasActiveToken(user.getId()));
        return userVO;
    }

    private boolean cacheToken(String userId, String token) {
        return authTokenStore.storeToken(userId, token, jwtUtil.getExpiration());
    }
}
