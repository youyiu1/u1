package com.neighborhood.app.interceptor;

import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.mapper.user.UserMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.utils.CollectionStringUtil;
import com.neighborhood.app.utils.UserLookupUtil;
import com.neighborhood.app.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private static final String TOKEN_PREFIX = "token:";
    private static final String HEADER_AUTH = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String ROLE_USER = "USER";
    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_READONLY_ADMIN = "READONLY_ADMIN";
    private static final String ROLE_SUPER_ADMIN = "SUPER_ADMIN";

    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;
    private final UserMapper userMapper;
    private final JdbcTemplate jdbcTemplate;
    private final CacheService cacheService;

    private record AuthState(String token, String userId, boolean tokenValid, boolean valid) {
    }

    private record RoleMeta(String status, List<String> permissionCodes) {
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String path = request.getRequestURI();
        AuthState authState = authenticateRequest(request);
        if (authState.valid()) {
            request.setAttribute("userId", authState.userId());
        }

        if (isPublicPath(path)) {
            return true;
        }

        if (authState.token() == null) {
            writeJson(response, HttpServletResponse.SC_UNAUTHORIZED, "{\"success\":false,\"message\":\"请先登录\"}");
            return false;
        }
        if (!authState.valid()) {
            if (!authState.tokenValid()) {
                writeJson(response, HttpServletResponse.SC_UNAUTHORIZED, "{\"success\":false,\"message\":\"Token 无效\"}");
            } else {
                writeJson(response, HttpServletResponse.SC_UNAUTHORIZED, "{\"success\":false,\"message\":\"Token 已过期，请重新登录\"}");
            }
            return false;
        }

        if (path.startsWith("/api/admin/")) {
            User user = cachedUser(authState.userId());
            String role = normalizeRole(user == null ? null : user.getAdminRole());

            if (ROLE_USER.equals(role)) {
                writeJson(response, HttpServletResponse.SC_FORBIDDEN, "{\"success\":false,\"message\":\"普通用户不能访问管理端\"}");
                return false;
            }

            RoleMeta roleMeta = loadRoleMeta(role);
            if (!isRoleEnabled(role, roleMeta)) {
                writeJson(response, HttpServletResponse.SC_FORBIDDEN, "{\"success\":false,\"message\":\"当前管理员角色已被停用\"}");
                return false;
            }

            if (isSafeAdminMethod(request.getMethod())) {
                return true;
            }

            if (ROLE_READONLY_ADMIN.equals(role)) {
                writeJson(response, HttpServletResponse.SC_FORBIDDEN, "{\"success\":false,\"message\":\"只读管理员不能执行写操作\"}");
                return false;
            }

            String requiredPermission = resolveRequiredPermission(path, request.getMethod());
            if (requiredPermission != null && !hasPermission(role, requiredPermission, roleMeta)) {
                writeJson(response, HttpServletResponse.SC_FORBIDDEN, "{\"success\":false,\"message\":\"当前账号缺少对应权限\"}");
                return false;
            }

            if (requiredPermission == null && !ROLE_SUPER_ADMIN.equals(role)) {
                writeJson(response, HttpServletResponse.SC_FORBIDDEN, "{\"success\":false,\"message\":\"当前账号缺少对应权限\"}");
                return false;
            }
        }

        return true;
    }

    private AuthState authenticateRequest(HttpServletRequest request) {
        String authHeader = request.getHeader(HEADER_AUTH);
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            return new AuthState(null, null, false, false);
        }
        String token = authHeader.substring(BEARER_PREFIX.length());
        if (!jwtUtil.validateToken(token)) {
            return new AuthState(token, null, false, false);
        }
        String userId = jwtUtil.getUserIdFromToken(token);
        Object redisToken = redisTemplate.opsForValue().get(TOKEN_PREFIX + userId);
        if (redisToken == null || !token.equals(redisToken.toString())) {
            return new AuthState(token, userId, true, false);
        }
        redisTemplate.expire(TOKEN_PREFIX + userId, jwtUtil.getExpiration(), TimeUnit.MILLISECONDS);
        return new AuthState(token, userId, true, true);
    }

    private User cachedUser(String userId) {
        return UserLookupUtil.getById(cacheService, userMapper, userId);
    }

    private String normalizeRole(String role) {
        if (ROLE_SUPER_ADMIN.equals(role)) return ROLE_SUPER_ADMIN;
        if (ROLE_ADMIN.equals(role)) return ROLE_ADMIN;
        if (ROLE_READONLY_ADMIN.equals(role)) return ROLE_READONLY_ADMIN;
        return ROLE_USER;
    }

    private RoleMeta loadRoleMeta(String role) {
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                    "SELECT status, permission_codes FROM t_admin_role WHERE code = ?",
                    role
            );
            if (rows.isEmpty()) {
                return new RoleMeta(null, List.of());
            }
            Map<String, Object> row = rows.get(0);
            return new RoleMeta(
                    row.get("status") == null ? null : String.valueOf(row.get("status")),
                    CollectionStringUtil.parseStringArray(row.get("permission_codes") == null ? null : String.valueOf(row.get("permission_codes")))
            );
        } catch (Exception ignored) {
            return new RoleMeta(null, List.of());
        }
    }

    private boolean isRoleEnabled(String role, RoleMeta roleMeta) {
        if (ROLE_USER.equals(role)) {
            return false;
        }
        if (roleMeta.status() == null) {
            return ROLE_SUPER_ADMIN.equals(role) || ROLE_ADMIN.equals(role) || ROLE_READONLY_ADMIN.equals(role);
        }
        return !"disabled".equalsIgnoreCase(roleMeta.status());
    }

    private boolean hasPermission(String role, String requiredPermission, RoleMeta roleMeta) {
        if (requiredPermission == null || ROLE_SUPER_ADMIN.equals(role)) {
            return true;
        }
        return roleMeta.permissionCodes().contains(requiredPermission);
    }

    private String resolveRequiredPermission(String path, String method) {
        boolean safe = isSafeAdminMethod(method);
        if (path.equals("/api/admin/me") || path.equals("/api/admin/dashboard/stats")) return null;
        if (path.equals("/api/admin/users")) return safe ? null : "user:view";
        if (path.matches("/api/admin/users/[^/]+/status")) return "user:ban";
        if (path.matches("/api/admin/users/[^/]+/verified")) return "user:verify";
        if (path.matches("/api/admin/users/[^/]+/admin-role")) return "user:role";
        if (path.equals("/api/admin/dynamics")) return safe ? null : "posts:view";
        if (path.matches("/api/admin/dynamics/[^/]+/status")) return "posts:audit";
        if (path.matches("/api/admin/dynamics/[^/]+/comments(/[^/]+)?")) return "comments:manage";
        if (path.equals("/api/admin/goods")) return safe ? null : "goods:audit";
        if (path.matches("/api/admin/goods/[^/]+/status")) return "goods:audit";
        if (path.equals("/api/admin/services")) return safe ? null : "services:manage";
        if (path.matches("/api/admin/services/[^/]+/status")) return "services:manage";
        if (path.equals("/api/admin/orders")) return safe ? null : "orders:cancel";
        if (path.matches("/api/admin/orders/[^/]+/cancel")) return "orders:cancel";
        if (path.equals("/api/admin/notifications")) return safe ? null : "notifications:create";
        if (path.matches("/api/admin/notifications/[^/]+/toggle")) return "notifications:create";
        if (path.equals("/api/admin/categories")) return safe ? null : "categories:edit";
        if (path.matches("/api/admin/categories/[^/]+/toggle")) return "categories:edit";
        if (path.equals("/api/admin/comments")) return safe ? null : "comments:manage";
        if (path.matches("/api/admin/comments/[^/]+(/status)?")) return "comments:manage";
        if (path.equals("/api/admin/blacklist")) return safe ? null : "blacklist:edit";
        if (path.matches("/api/admin/blacklist/[^/]+")) return "blacklist:edit";
        if (path.equals("/api/admin/images")) return safe ? null : "images:audit";
        if (path.matches("/api/admin/images/[^/]+(/status)?")) return "images:audit";
        if (path.equals("/api/admin/messages")) return safe ? null : "messages:manage";
        if (path.matches("/api/admin/messages/[^/]+(/read)?")) return "messages:manage";
        if (path.equals("/api/admin/login-logs")) return null;
        if (path.equals("/api/admin/operation-logs")) return safe ? null : "logs:operation";
        if (path.equals("/api/admin/operation-logs/retention")) return "logs:retention";
        if (path.equals("/api/admin/menus")) return null;
        if (path.equals("/api/admin/roles")) return null;
        if (path.matches("/api/admin/roles/[^/]+")) return "roles:manage";
        if (path.equals("/api/admin/permissions")) return null;
        return null;
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
                || path.matches("/api/user/\\d+")
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
