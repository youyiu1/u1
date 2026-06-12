package com.neighborhood.app.service.impl;

import com.neighborhood.app.service.SecurityRateLimitService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/** 安全限流服务实现。 */
@Service
@RequiredArgsConstructor
public class SecurityRateLimitServiceImpl implements SecurityRateLimitService {

    private static final int USER_LOGIN_WINDOW_SECONDS = 300;
    private static final int USER_LOGIN_MAX_ATTEMPTS = 8;
    private static final int ADMIN_LOGIN_WINDOW_SECONDS = 600;
    private static final int ADMIN_LOGIN_MAX_ATTEMPTS = 6;
    private static final int EMAIL_SEND_WINDOW_SECONDS = 600;
    private static final int EMAIL_SEND_MAX_ATTEMPTS = 5;
    private static final int RESET_PASSWORD_WINDOW_SECONDS = 600;
    private static final int RESET_PASSWORD_MAX_ATTEMPTS = 8;
    private static final int EMAIL_CODE_VERIFY_WINDOW_SECONDS = 300;
    private static final int EMAIL_CODE_VERIFY_MAX_ATTEMPTS = 6;

    private final StringRedisTemplate stringRedisTemplate;

    @Override
    public void checkUserLogin(String clientKey, String account) {
        assertAllowed("security:login:user:client:", safeKey(clientKey), USER_LOGIN_MAX_ATTEMPTS, USER_LOGIN_WINDOW_SECONDS, "登录尝试过于频繁，请稍后再试");
        assertAllowed("security:login:user:account:", safeKey(account), USER_LOGIN_MAX_ATTEMPTS, USER_LOGIN_WINDOW_SECONDS, "账号登录尝试过于频繁，请稍后再试");
    }

    @Override
    public void recordUserLoginSuccess(String clientKey, String account) {
        clear("security:login:user:client:", safeKey(clientKey));
        clear("security:login:user:account:", safeKey(account));
    }

    @Override
    public void recordUserLoginFailure(String clientKey, String account) {
        increment("security:login:user:client:", safeKey(clientKey), USER_LOGIN_WINDOW_SECONDS);
        increment("security:login:user:account:", safeKey(account), USER_LOGIN_WINDOW_SECONDS);
    }

    @Override
    public void checkAdminLogin(String clientKey, String account) {
        assertAllowed("security:login:admin:client:", safeKey(clientKey), ADMIN_LOGIN_MAX_ATTEMPTS, ADMIN_LOGIN_WINDOW_SECONDS, "管理端登录尝试过于频繁，请稍后再试");
        assertAllowed("security:login:admin:account:", safeKey(account), ADMIN_LOGIN_MAX_ATTEMPTS, ADMIN_LOGIN_WINDOW_SECONDS, "管理账号登录尝试过于频繁，请稍后再试");
    }

    @Override
    public void recordAdminLoginSuccess(String clientKey, String account) {
        clear("security:login:admin:client:", safeKey(clientKey));
        clear("security:login:admin:account:", safeKey(account));
    }

    @Override
    public void recordAdminLoginFailure(String clientKey, String account) {
        increment("security:login:admin:client:", safeKey(clientKey), ADMIN_LOGIN_WINDOW_SECONDS);
        increment("security:login:admin:account:", safeKey(account), ADMIN_LOGIN_WINDOW_SECONDS);
    }

    @Override
    public void checkEmailSend(String clientKey, String email) {
        assertAllowed("security:email:send:client:", safeKey(clientKey), EMAIL_SEND_MAX_ATTEMPTS, EMAIL_SEND_WINDOW_SECONDS, "验证码发送过于频繁，请稍后再试");
        assertAllowed("security:email:send:email:", safeKey(email), EMAIL_SEND_MAX_ATTEMPTS, EMAIL_SEND_WINDOW_SECONDS, "该邮箱验证码发送过于频繁，请稍后再试");
    }

    @Override
    public void recordEmailSend(String clientKey, String email) {
        increment("security:email:send:client:", safeKey(clientKey), EMAIL_SEND_WINDOW_SECONDS);
        increment("security:email:send:email:", safeKey(email), EMAIL_SEND_WINDOW_SECONDS);
    }

    @Override
    public void checkResetPassword(String clientKey, String email) {
        assertAllowed("security:reset:client:", safeKey(clientKey), RESET_PASSWORD_MAX_ATTEMPTS, RESET_PASSWORD_WINDOW_SECONDS, "重置密码尝试过于频繁，请稍后再试");
        assertAllowed("security:reset:email:", safeKey(email), RESET_PASSWORD_MAX_ATTEMPTS, RESET_PASSWORD_WINDOW_SECONDS, "该邮箱重置尝试过于频繁，请稍后再试");
    }

    @Override
    public void recordResetPasswordFailure(String clientKey, String email) {
        increment("security:reset:client:", safeKey(clientKey), RESET_PASSWORD_WINDOW_SECONDS);
        increment("security:reset:email:", safeKey(email), RESET_PASSWORD_WINDOW_SECONDS);
    }

    @Override
    public void recordResetPasswordSuccess(String clientKey, String email) {
        clear("security:reset:client:", safeKey(clientKey));
        clear("security:reset:email:", safeKey(email));
    }

    @Override
    public void checkEmailCodeVerify(String email) {
        assertAllowed("security:email:verify:", safeKey(email), EMAIL_CODE_VERIFY_MAX_ATTEMPTS, EMAIL_CODE_VERIFY_WINDOW_SECONDS, "验证码校验失败次数过多，请稍后再试");
    }

    @Override
    public void recordEmailCodeVerifyFailure(String email) {
        increment("security:email:verify:", safeKey(email), EMAIL_CODE_VERIFY_WINDOW_SECONDS);
    }

    @Override
    public void recordEmailCodeVerifySuccess(String email) {
        clear("security:email:verify:", safeKey(email));
    }

    private void assertAllowed(String prefix, String value, int maxAttempts, int windowSeconds, String message) {
        String key = prefix + value;
        String current = stringRedisTemplate.opsForValue().get(key);
        if (current != null && Integer.parseInt(current) >= maxAttempts) {
            throw new IllegalStateException(message);
        }
        if (current == null) {
            stringRedisTemplate.opsForValue().setIfAbsent(key, "0", windowSeconds, TimeUnit.SECONDS);
        }
    }

    private void increment(String prefix, String value, int windowSeconds) {
        String key = prefix + value;
        Long count = stringRedisTemplate.opsForValue().increment(key);
        if (count != null && count == 1) {
            stringRedisTemplate.expire(key, windowSeconds, TimeUnit.SECONDS);
        }
    }

    private void clear(String prefix, String value) {
        stringRedisTemplate.delete(prefix + value);
    }

    private String safeKey(String raw) {
        if (raw == null || raw.isBlank()) {
            return "anonymous";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.trim().toLowerCase().getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException exception) {
            return raw.replaceAll("[^a-zA-Z0-9_-]", "_");
        }
    }
}
