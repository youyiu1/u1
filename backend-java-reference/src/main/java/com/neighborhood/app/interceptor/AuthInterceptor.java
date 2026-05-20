/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.interceptor;

import com.neighborhood.app.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String TOKEN_PREFIX = "token:";
    private static final String HEADER_AUTH = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 放行预检请求
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String path = request.getRequestURI();
        System.out.println("=== AuthInterceptor.preHandle === path=" + path + ", method=" + request.getMethod());

        // 公开接口无需认证
        if (path.startsWith("/api/service/") && path.contains("/reviews")) {
            return true;
        }

        String authHeader = request.getHeader(HEADER_AUTH);
        System.out.println("=== AuthInterceptor === authHeader=" + authHeader);
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"success\":false,\"message\":\"未登录\"}");
            return false;
        }

        String token = authHeader.substring(BEARER_PREFIX.length());

        // 验证JWT格式和签名
        if (!jwtUtil.validateToken(token)) {
            System.out.println("=== AuthInterceptor === token validation failed");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"success\":false,\"message\":\"Token无效\"}");
            return false;
        }

        // 检查Redis中Token是否存在（已登录状态）
        String userId = jwtUtil.getUserIdFromToken(token);
        System.out.println("=== AuthInterceptor === userId from token=" + userId);
        Object redisToken = redisTemplate.opsForValue().get(TOKEN_PREFIX + userId);

        if (redisToken == null || !token.equals(redisToken.toString())) {
            System.out.println("=== AuthInterceptor === redis token mismatch or expired");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"success\":false,\"message\":\"Token已过期\"}");
            return false;
        }

        // 续期Token TTL
        redisTemplate.expire(TOKEN_PREFIX + userId, jwtUtil.getExpiration(), TimeUnit.MILLISECONDS);

        // 将userId存入request供后续使用
        request.setAttribute("userId", userId);
        System.out.println("=== AuthInterceptor === set userId=" + userId + " into request");
        return true;
    }
}
