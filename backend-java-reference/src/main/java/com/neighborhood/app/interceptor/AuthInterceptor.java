package com.neighborhood.app.interceptor;

import com.neighborhood.app.util.JwtUtil;
import com.neighborhood.app.entity.User;
import com.neighborhood.app.mapper.UserMapper;
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
    private static final String ROLE_USER = "USER";
    private static final String ROLE_READONLY_ADMIN = "READONLY_ADMIN";
    private static final String ROLE_SUPER_ADMIN = "SUPER_ADMIN";

    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;
    private final UserMapper userMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String path = request.getRequestURI();

        String authHeader = request.getHeader(HEADER_AUTH);
        // 尝试从Token提取userId（公开接口也需要）
        if (authHeader != null && authHeader.startsWith(BEARER_PREFIX)) {
            String token = authHeader.substring(BEARER_PREFIX.length());
            if (jwtUtil.validateToken(token)) {
                String userId = jwtUtil.getUserIdFromToken(token);
                Object redisToken = redisTemplate.opsForValue().get(TOKEN_PREFIX + userId);
                if (redisToken != null && token.equals(redisToken.toString())) {
                    redisTemplate.expire(TOKEN_PREFIX + userId, jwtUtil.getExpiration(), TimeUnit.MILLISECONDS);
                    request.setAttribute("userId", userId);
                }
            }
        }

        // 公开接口放行（userId可能已设置）
        if (isPublicPath(path)) {
            return true;
        }

        // 非公开接口需要完整验证
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

        if (path.startsWith("/api/admin/")) {
            User user = userMapper.selectById(userId);
            String role = normalizeRole(user == null ? null : user.getAdminRole());
            if (ROLE_USER.equals(role)) {
                writeJson(response, HttpServletResponse.SC_FORBIDDEN, "{\"success\":false,\"message\":\"普通用户不能访问管理端\"}");
                return false;
            }
            if (!isSafeAdminMethod(request.getMethod()) && !ROLE_SUPER_ADMIN.equals(role)) {
                writeJson(response, HttpServletResponse.SC_FORBIDDEN, "{\"success\":false,\"message\":\"当前账号无操作权限\"}");
                return false;
            }
        }
        return true;
    }

    private String normalizeRole(String role) {
        if (ROLE_SUPER_ADMIN.equals(role)) return ROLE_SUPER_ADMIN;
        if (ROLE_READONLY_ADMIN.equals(role)) return ROLE_READONLY_ADMIN;
        return ROLE_USER;
    }

    private boolean isSafeAdminMethod(String method) {
        return "GET".equalsIgnoreCase(method) || "HEAD".equalsIgnoreCase(method) || "OPTIONS".equalsIgnoreCase(method);
    }

    private void writeJson(HttpServletResponse response, int status, String body) throws Exception {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(body);
    }

    private boolean isPublicPath(String path) {
        return path.equals("/api/user/register")
                || path.equals("/api/user/login")
                || path.equals("/api/admin/login")
                || path.equals("/api/user/send-code")
                || path.startsWith("/api/user/name")
                || path.matches("/api/user/\\d+")  // 公开：用户ID获取
                || path.startsWith("/api/user/isfollowing")
                || path.equals("/api/user/suggested")
                || path.startsWith("/api/home")
                || path.equals("/api/search")
                || path.startsWith("/api/category")
                || path.equals("/api/news/list")
                || path.matches("/api/news/\\d+")
                || path.matches("/api/news/\\d+/comments")
                || path.matches("/api/news/\\d+/like")
                || path.matches("/api/news/comment/\\d+/like")
                || path.matches("/api/news/comment/\\d+/unlike")
                || path.equals("/api/news/trending")
                || path.equals("/api/market/list")
                || path.matches("/api/market/\\d+")
                || path.equals("/api/service/list")
                || path.matches("/api/service/\\d+")
                || path.matches("/api/service/\\d+/reviews")
                || path.equals("/api/notification/list")
                || path.startsWith("/api/file/");
    }
}
