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

    private static final String TOKEN_PREFIX = "token:";
    private static final String HEADER_AUTH = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String path = request.getRequestURI();

        // 公开接口放行
        if (isPublicPath(path)) {
            return true;
        }

        String authHeader = request.getHeader(HEADER_AUTH);
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"success\":false,\"message\":\"未登录\"}");
            return false;
        }

        String token = authHeader.substring(BEARER_PREFIX.length());

        if (!jwtUtil.validateToken(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"success\":false,\"message\":\"Token无效\"}");
            return false;
        }

        String userId = jwtUtil.getUserIdFromToken(token);
        Object redisToken = redisTemplate.opsForValue().get(TOKEN_PREFIX + userId);

        if (redisToken == null || !token.equals(redisToken.toString())) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"success\":false,\"message\":\"Token已过期\"}");
            return false;
        }

        redisTemplate.expire(TOKEN_PREFIX + userId, jwtUtil.getExpiration(), TimeUnit.MILLISECONDS);
        request.setAttribute("userId", userId);
        return true;
    }

    private boolean isPublicPath(String path) {
        return path.equals("/api/user/register")
                || path.equals("/api/user/login")
                || path.equals("/api/user/send-code")
                || path.startsWith("/api/user/name")
                || path.matches("/api/user/\\d+")  // 公开：用户ID获取
                || path.startsWith("/api/home")
                || path.equals("/api/search")
                || path.startsWith("/api/category")
                || path.equals("/api/news/list")
                || path.matches("/api/news/\\d+")
                || path.matches("/api/news/\\d+/comments")
                || path.matches("/api/news/\\d+/like")
                || path.equals("/api/market/list")
                || path.matches("/api/market/\\d+")
                || path.equals("/api/service/list")
                || path.matches("/api/service/\\d+")
                || path.matches("/api/service/\\d+/reviews")
                || path.equals("/api/notification/list")
                || path.startsWith("/api/file/");
    }
}