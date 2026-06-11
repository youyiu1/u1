package com.neighborhood.app.controller.admin;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.dto.user.CaptchaResponse;
import com.neighborhood.app.dto.admin.AdminAuthRequests.LoginRequest;
import com.neighborhood.app.service.CaptchaService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 文件作用：管理端认证接口。 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminSupport support;
    private final CaptchaService captchaService;

    /** 获取管理端图形验证码。 */
    @GetMapping("/captcha-image")
    public Result<CaptchaResponse> getCaptcha(HttpServletRequest request) {
        try {
            return Result.ok(captchaService.generateCaptcha(resolveClientKey(request)));
        } catch (RuntimeException exception) {
            return Result.fail(exception.getMessage());
        }
    }

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginRequest body, HttpServletRequest request) {
        return support.login(body, request);
    }

    @PostMapping("/logout")
    public Result<Boolean> logout(@RequestAttribute String userId, HttpServletRequest request) {
        return support.logout(userId, request);
    }

    @GetMapping("/me")
    public Result<Map<String, Object>> me(@RequestAttribute String userId) {
        return support.me(userId);
    }

    private String resolveClientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        String ip = forwarded == null || forwarded.isBlank() ? request.getRemoteAddr() : forwarded.split(",")[0].trim();
        String userAgent = request.getHeader("User-Agent");
        return (ip == null ? "unknown" : ip) + "|" + (userAgent == null ? "unknown" : userAgent);
    }
}
