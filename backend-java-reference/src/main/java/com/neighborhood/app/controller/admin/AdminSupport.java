/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.neighborhood.app.common.Result;
import com.neighborhood.app.dto.admin.AdminAuthRequests.LoginRequest;
import com.neighborhood.app.dto.admin.AdminCommonRequests.StatusRequest;
import com.neighborhood.app.entity.admin.AdminRole;
import com.neighborhood.app.entity.content.Comment;
import com.neighborhood.app.entity.content.News;
import com.neighborhood.app.entity.service.ServiceEntity;
import com.neighborhood.app.entity.service.ServiceReview;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.mapper.content.CommentMapper;
import com.neighborhood.app.mapper.content.NewsMapper;
import com.neighborhood.app.mapper.service.ServiceMapper;
import com.neighborhood.app.mapper.service.ServiceReviewMapper;
import com.neighborhood.app.mapper.user.UserMapper;
import com.neighborhood.app.service.AdminImageStatusService;
import com.neighborhood.app.service.AdminLogDispatchService;
import com.neighborhood.app.service.AdminRoleConfigService;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.UserService;
import com.neighborhood.app.util.JwtUtil;
import com.neighborhood.app.utils.CollectionStringUtil;
import com.neighborhood.app.utils.StringValueUtil;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

@Component
@RequiredArgsConstructor
public class AdminSupport {

    private static final String TOKEN_PREFIX = "token:";
    public static final String ROLE_USER = "USER";
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_READONLY_ADMIN = "READONLY_ADMIN";
    public static final String ROLE_SUPER_ADMIN = "SUPER_ADMIN";
    private static final String MENU_GROUP_USER = "\u7528\u6237\u98ce\u63a7";
    private static final String MENU_GROUP_CONTENT = "\u5185\u5bb9\u8fd0\u8425";
    private static final String MENU_GROUP_SERVICE = "\u751f\u6d3b\u670d\u52a1";
    private static final String MENU_GROUP_SYSTEM = "\u7cfb\u7edf\u8bbe\u7f6e";
    private static final String MENU_GROUP_SECURITY = "\u7cfb\u7edf\u5b89\u5168";
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final Set<String> ADMIN_RESTRICTED_PERMISSION_CODES = Set.of("user:role", "roles:manage", "logs:retention");
    private static final List<String> READONLY_PERMISSION_CODES = List.of(
            "user:view",
            "posts:view",
            "goods:view",
            "services:view",
            "orders:view",
            "categories:view",
            "notifications:view",
            "menus:view",
            "messages:view",
            "comments:view",
            "images:view",
            "blacklist:view",
            "logs:login",
            "logs:operation",
            "roles:view",
            "permissions:view"
    );

    private final JdbcTemplate jdbcTemplate;
    private final UserMapper userMapper;
    private final CommentMapper commentMapper;
    private final NewsMapper newsMapper;
    private final ServiceMapper serviceMapper;
    private final ServiceReviewMapper serviceReviewMapper;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;
    private final CacheService cacheService;
    private final AdminLogDispatchService adminLogDispatchService;
    private final AdminImageStatusService adminImageStatusService;
    private final AdminRoleConfigService adminRoleConfigService;
    private final UserService userService;

    public record RoleSeed(
            String id,
            String name,
            String code,
            String description,
            List<String> menuIds,
            List<String> permissionCodes,
            String status
    ) {
    }

    public record AdminRoleConfig(
            String status,
            List<String> menuIds,
            List<String> permissionCodes
    ) {
    }

    @PostConstruct
    public void ensureAdminSchema() {
        executeQuietly("ALTER TABLE t_user ADD COLUMN phone VARCHAR(32) DEFAULT ''");
        executeQuietly("ALTER TABLE t_user ADD COLUMN tag VARCHAR(50) DEFAULT ''");
        executeQuietly("ALTER TABLE t_user ADD COLUMN region VARCHAR(100) DEFAULT ''");
        executeQuietly("ALTER TABLE t_user ADD COLUMN status VARCHAR(20) DEFAULT 'normal'");
        executeQuietly("ALTER TABLE t_user ADD COLUMN admin_role VARCHAR(32) DEFAULT 'USER'");
        executeQuietly("ALTER TABLE t_user ADD COLUMN profile_visible VARCHAR(20) DEFAULT 'public'");
        executeQuietly("ALTER TABLE t_user ADD COLUMN posts_visible VARCHAR(20) DEFAULT 'public'");
        executeQuietly("ALTER TABLE t_user ADD COLUMN show_location TINYINT(1) DEFAULT 1");
        executeQuietly("ALTER TABLE t_user ADD COLUMN push_enabled TINYINT(1) DEFAULT 1");
        executeQuietly("ALTER TABLE t_user ADD COLUMN message_notify TINYINT(1) DEFAULT 1");
        executeQuietly("ALTER TABLE t_user ADD COLUMN follow_notify TINYINT(1) DEFAULT 1");
        executeQuietly("ALTER TABLE t_user ADD COLUMN like_notify TINYINT(1) DEFAULT 1");
        executeQuietly("ALTER TABLE t_user ADD COLUMN comment_notify TINYINT(1) DEFAULT 1");
        executeQuietly("ALTER TABLE t_user ADD COLUMN system_notify TINYINT(1) DEFAULT 0");
        executeQuietly("ALTER TABLE t_news ADD COLUMN status VARCHAR(20) DEFAULT 'normal'");
        executeQuietly("ALTER TABLE t_news ADD COLUMN reject_reason VARCHAR(255) DEFAULT ''");
        executeQuietly("ALTER TABLE t_market_item ADD COLUMN status VARCHAR(20) DEFAULT 'active'");
        executeQuietly("ALTER TABLE t_market_item ADD COLUMN reject_reason VARCHAR(255) DEFAULT ''");
        executeQuietly("ALTER TABLE t_service ADD COLUMN status VARCHAR(20) DEFAULT 'active'");
        executeQuietly("ALTER TABLE t_service ADD COLUMN reject_reason VARCHAR(255) DEFAULT ''");
        executeQuietly("ALTER TABLE t_service ADD COLUMN area VARCHAR(100) DEFAULT ''");
        executeQuietly("ALTER TABLE t_service ADD COLUMN phone VARCHAR(32) DEFAULT ''");
        executeQuietly("ALTER TABLE t_order ADD COLUMN cancel_reason VARCHAR(255) DEFAULT ''");
        executeQuietly("ALTER TABLE t_comment ADD COLUMN status VARCHAR(20) DEFAULT 'normal'");
        executeQuietly("ALTER TABLE t_service_review ADD COLUMN status VARCHAR(20) DEFAULT 'normal'");
        executeQuietly("""
                CREATE TABLE IF NOT EXISTS t_category (
                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                    name VARCHAR(100) NOT NULL,
                    icon VARCHAR(64) DEFAULT 'category',
                    type VARCHAR(20) DEFAULT 'service',
                    status VARCHAR(20) DEFAULT 'normal',
                    sort_order INT DEFAULT 0,
                    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_type_order (type, sort_order)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                """);
        executeQuietly("ALTER TABLE t_category ADD COLUMN type VARCHAR(20) DEFAULT 'service'");
        executeQuietly("ALTER TABLE t_category ADD COLUMN status VARCHAR(20) DEFAULT 'normal'");
        executeQuietly("ALTER TABLE t_category ADD COLUMN sort_order INT DEFAULT 0");
        executeQuietly("""
                CREATE TABLE IF NOT EXISTS t_admin_blacklist (
                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                    target_type VARCHAR(20) NOT NULL,
                    target_value VARCHAR(255) NOT NULL,
                    reason VARCHAR(255) DEFAULT '',
                    creator VARCHAR(64) DEFAULT '',
                    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_target (target_type, target_value)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                """);
        executeQuietly("""
                CREATE TABLE IF NOT EXISTS t_admin_operation_log (
                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                    operator VARCHAR(64) DEFAULT '',
                    role_name VARCHAR(64) DEFAULT '',
                    action_name VARCHAR(100) DEFAULT '',
                    target VARCHAR(255) DEFAULT '',
                    ip VARCHAR(64) DEFAULT '',
                    status VARCHAR(20) DEFAULT 'success',
                    details VARCHAR(500) DEFAULT '',
                    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_create_time (create_time DESC)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                """);
        executeQuietly("""
                CREATE TABLE IF NOT EXISTS t_admin_login_log (
                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                    user_id VARCHAR(64) DEFAULT '',
                    username VARCHAR(64) DEFAULT '',
                    ip VARCHAR(64) DEFAULT '',
                    device VARCHAR(255) DEFAULT '',
                    location VARCHAR(100) DEFAULT '',
                    status VARCHAR(20) DEFAULT 'success',
                    fail_reason VARCHAR(255) DEFAULT '',
                    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_create_time (create_time DESC)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                """);
        executeQuietly("""
                CREATE TABLE IF NOT EXISTS t_admin_image_status (
                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                    image_url VARCHAR(500) NOT NULL,
                    status VARCHAR(20) DEFAULT 'approved',
                    UNIQUE KEY uk_image_url (image_url)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                """);
        executeQuietly("""
                CREATE TABLE IF NOT EXISTS t_admin_role (
                    id VARCHAR(64) PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    code VARCHAR(64) NOT NULL,
                    description VARCHAR(255) DEFAULT '',
                    status VARCHAR(20) DEFAULT 'active',
                    menu_ids TEXT,
                    permission_codes TEXT,
                    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY uk_role_code (code)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                """);
        ensureDefaultAdminRoles();
    }

    public Result<Map<String, Object>> login(LoginRequest body, HttpServletRequest request) {
        String account = safeTrim(body == null ? null : body.username());
        String password = body == null ? "" : empty(body.password());
        User user = findUserByAccount(account);
        if (user == null || !Objects.equals(user.getPassword(), password)) {
            saveLoginLog("", account, requestIp(request), request.getHeader("User-Agent"), "failed", "\u8d26\u53f7\u6216\u5bc6\u7801\u9519\u8bef");
            return Result.fail("\u8d26\u53f7\u6216\u5bc6\u7801\u9519\u8bef");
        }
        String adminRole = normalizeAdminRole(user.getAdminRole());
        if (ROLE_USER.equals(adminRole)) {
            saveLoginLog(user.getId(), user.getName(), requestIp(request), request.getHeader("User-Agent"), "failed", "\u666e\u901a\u7528\u6237\u4e0d\u80fd\u8bbf\u95ee\u7ba1\u7406\u7aef");
            return Result.fail("\u666e\u901a\u7528\u6237\u4e0d\u80fd\u8bbf\u95ee\u7ba1\u7406\u7aef");
        }
        AdminRoleConfig roleConfig = loadAdminRoleConfig(adminRole);
        if (!isAdminRoleEnabled(roleConfig)) {
            saveLoginLog(user.getId(), user.getName(), requestIp(request), request.getHeader("User-Agent"), "failed", "\u5f53\u524d\u7ba1\u7406\u5458\u89d2\u8272\u5df2\u505c\u7528");
            return Result.fail("\u5f53\u524d\u7ba1\u7406\u5458\u89d2\u8272\u5df2\u505c\u7528");
        }
        String token = jwtUtil.generateToken(user.getId());
        redisTemplate.opsForValue().set(TOKEN_PREFIX + user.getId(), token, jwtUtil.getExpiration(), TimeUnit.MILLISECONDS);
        saveLoginLog(user.getId(), user.getName(), requestIp(request), request.getHeader("User-Agent"), "success", "");
        return Result.ok(Map.of(
                "token", token,
                "username", user.getName(),
                "adminRole", adminRole,
                "readonly", String.valueOf(isReadOnlyRole(adminRole)),
                "permissionCodes", roleConfig.permissionCodes(),
                "menuIds", roleConfig.menuIds()
        ));
    }


    public Result<Map<String, Object>> me(String userId) {
        User user = userService.getById(userId);
        String adminRole = normalizeAdminRole(user == null ? "" : user.getAdminRole());
        if (ROLE_USER.equals(adminRole)) {
            return Result.fail("\u666e\u901a\u7528\u6237\u4e0d\u80fd\u8bbf\u95ee\u7ba1\u7406\u7aef");
        }
        AdminRoleConfig roleConfig = loadAdminRoleConfig(adminRole);
        if (!isAdminRoleEnabled(roleConfig)) {
            return Result.fail("\u5f53\u524d\u7ba1\u7406\u5458\u89d2\u8272\u5df2\u505c\u7528");
        }
        return Result.ok(Map.of(
                "username", user == null ? "admin" : user.getName(),
                "adminRole", adminRole,
                "readonly", String.valueOf(isReadOnlyRole(adminRole)),
                "permissionCodes", roleConfig.permissionCodes(),
                "menuIds", roleConfig.menuIds()
        ));
    }

    public Result<Map<String, Object>> stats() {
        Map<String, Object> row = jdbcTemplate.queryForMap("""
                SELECT
                    (SELECT COUNT(1) FROM t_user) totalUsers,
                    (SELECT COUNT(1) FROM t_news WHERE status <> 'removed') newPosts,
                    (SELECT COUNT(1) FROM t_market_item WHERE status = 'active') activeGoods,
                    (SELECT COUNT(1) FROM t_service WHERE status = 'active') activeServices,
                    (SELECT COUNT(1) FROM t_order WHERE create_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)) monthlyOrders
                """);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalUsers", num(row.get("totalUsers")));
        data.put("totalUsersTrend", 0);
        data.put("newPosts", num(row.get("newPosts")));
        data.put("newPostsTrend", 0);
        data.put("activeGoods", num(row.get("activeGoods")));
        data.put("activeGoodsTrend", 0);
        data.put("activeServices", num(row.get("activeServices")));
        data.put("activeServicesTrend", 0);
        data.put("monthlyOrders", num(row.get("monthlyOrders")));
        data.put("monthlyOrdersTrend", 0);
        return Result.ok(data);
    }
    private User findUserByAccount(String account) {
        List<User> users = userMapper.selectList(new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<User>()
                .eq("email", account).or().eq("name", account).last("LIMIT 1"));
        return users.isEmpty() ? null : users.get(0);
    }

    private User requireUser(String userId) {
        return userService.getById(userId);
    }

    public boolean isSuperAdmin(String userId) {
        User operator = requireUser(userId);
        return operator != null && ROLE_SUPER_ADMIN.equals(normalizeAdminRole(operator.getAdminRole()));
    }

    public String normalizeAdminRole(String role) {
        if (ROLE_SUPER_ADMIN.equals(role)) return ROLE_SUPER_ADMIN;
        if (ROLE_ADMIN.equals(role)) return ROLE_ADMIN;
        if (ROLE_READONLY_ADMIN.equals(role)) return ROLE_READONLY_ADMIN;
        return ROLE_USER;
    }

    public Map<String, Object> orderItem(Map<String, Object> row) {
        String status = normalizeOrderStatus(str(row.get("status")));
        BigDecimal price = decimal(row.get("price"));
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", str(row.get("id")));
        item.put("buyerId", str(row.get("buyer_id")));
        item.put("buyerName", emptyTo(str(row.get("buyer_name")), "\u672a\u77e5\u7528\u6237"));
        item.put("buyerTag", str(row.get("buyer_tag")));
        item.put("buyerAvatar", str(row.get("buyer_avatar")));
        item.put("buyerPhone", str(row.get("buyer_phone")));
        item.put("buyerAddress", str(row.get("buyer_address")));
        item.put("sellerId", str(row.get("seller_id")));
        item.put("sellerName", emptyTo(str(row.get("seller_name")), "\u672a\u77e5\u5546\u5bb6"));
        item.put("sellerTag", str(row.get("seller_tag")));
        item.put("sellerAvatar", str(row.get("seller_avatar")));
        item.put("sellerPhone", str(row.get("seller_phone")));
        item.put("sellerRating", decimal(row.get("seller_rating")).toPlainString());
        item.put("serviceName", emptyTo(str(row.get("service_name")), str(row.get("title"))));
        item.put("price", price);
        item.put("paymentPrice", price);
        item.put("scheduleTime", time(row.get("booking_date")) + " " + str(row.get("booking_time")));
        item.put("buildTime", time(row.get("create_time")));
        item.put("status", status);
        item.put("cancelReason", str(row.get("cancel_reason")));
        item.put("steps", List.of(
                Map.of("name", "\u4e0b\u5355", "time", time(row.get("create_time"))),
                Map.of("name", "\u5f85\u5904\u7406", "time", time(row.get("update_time")))
        ));
        item.put("remark", "");
        item.put("feeBreakdown", List.of(Map.of("name", "\u670d\u52a1\u8d39\u7528", "value", price)));
        return item;
    }

    public Map<String, Object> userItem(Map<String, Object> row) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", str(row.get("id")));
        item.put("name", str(row.get("name")));
        item.put("email", str(row.get("email")));
        item.put("phone", str(row.get("phone")));
        item.put("avatar", str(row.get("avatar")));
        item.put("tag", str(row.get("tag")));
        item.put("status", emptyTo(str(row.get("status")), "normal"));
        item.put("adminRole", normalizeAdminRole(str(row.get("admin_role"))));
        item.put("verified", bool(row.get("is_verified")) ? "verified" : "unverified");
        item.put("region", emptyTo(str(row.get("region")), str(row.get("tag"))));
        item.put("registerTime", time(row.get("created_at")));
        item.put("followersCount", num(row.get("followers_count")));
        item.put("followingCount", num(row.get("following_count")));
        item.put("dynamicsCount", num(row.get("dynamics_count")));
        item.put("goodsCount", num(row.get("goods_count")));
        item.put("servicesCount", num(row.get("services_count")));
        return item;
    }

    public Map<String, Object> categoryItem(Map<String, Object> row) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", str(row.get("id")));
        item.put("name", str(row.get("name")));
        item.put("type", emptyTo(str(row.get("type")), "service"));
        item.put("status", emptyTo(str(row.get("status")), "normal"));
        item.put("order", num(row.get("sort_order")));
        item.put("subCount", 0);
        return item;
    }

    public <T> List<T> mapQueryList(String sql, Function<Map<String, Object>, T> mapper) {
        return jdbcTemplate.queryForList(sql).stream().map(mapper).toList();
    }

    public void ensureDefaultCategories() {
        try {
            Long count = jdbcTemplate.queryForObject("SELECT COUNT(1) FROM t_category", Long.class);
            if (count != null && count > 0) return;
            jdbcTemplate.update("INSERT INTO t_category(name, icon, type, status, sort_order) VALUES(?,?,?,?,?)", "\u751f\u6d3b\u670d\u52a1", "category", "service", "normal", 10);
            jdbcTemplate.update("INSERT INTO t_category(name, icon, type, status, sort_order) VALUES(?,?,?,?,?)", "\u95f2\u7f6e\u7269\u54c1", "category", "goods", "normal", 20);
            jdbcTemplate.update("INSERT INTO t_category(name, icon, type, status, sort_order) VALUES(?,?,?,?,?)", "\u52a8\u6001\u5185\u5bb9", "category", "dynamic", "normal", 30);
        } catch (Exception ignored) {
        }
    }

    private boolean isReadOnlyRole(String role) {
        return ROLE_READONLY_ADMIN.equals(normalizeAdminRole(role));
    }

    private boolean isAdminRoleEnabled(AdminRoleConfig roleConfig) {
        return roleConfig.status() == null || !"disabled".equalsIgnoreCase(roleConfig.status());
    }

    public Map<Long, List<Map<String, Object>>> commentsForNewsBatch(List<Long> newsIds) {
        if (newsIds == null || newsIds.isEmpty()) {
            return Map.of();
        }
        String placeholders = String.join(",", Collections.nCopies(newsIds.size(), "?"));
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                SELECT c.*, u.tag author_tag
                FROM t_comment c
                LEFT JOIN t_user u ON c.user_id COLLATE utf8mb4_unicode_ci = u.id
                WHERE c.news_id IN (%s)
                ORDER BY c.news_id ASC, c.create_time DESC
                """.formatted(placeholders), newsIds.toArray());
        Map<Long, List<Map<String, Object>>> result = new HashMap<>();
        for (Map<String, Object> row : rows) {
            Long newsId = longVal(row.get("news_id"));
            List<Map<String, Object>> comments = result.computeIfAbsent(newsId, ignored -> new ArrayList<>());
            if (comments.size() >= 20) {
                continue;
            }
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", str(row.get("id")));
            item.put("author", str(row.get("user_name")));
            item.put("avatar", str(row.get("user_avatar")));
            item.put("authorTag", str(row.get("author_tag")));
            item.put("text", str(row.get("content")));
            item.put("time", time(row.get("create_time")));
            comments.add(item);
        }
        return result;
    }

    public void collectImages(Map<String, Map<String, Object>> target, String category, String sql) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
        Map<String, String> statusMap = loadImageStatusMap(rows);
        for (Map<String, Object> row : rows) {
            for (String url : parseImages(row.get("images"))) {
                if (target.containsKey(url)) {
                    continue;
                }
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", url);
                item.put("url", url);
                item.put("name", url.substring(url.lastIndexOf('/') + 1));
                item.put("size", "-");
                item.put("category", category);
                item.put("uploader", emptyTo(str(row.get("uploader")), "\u672a\u77e5\u7528\u6237"));
                item.put("uploaderTag", str(row.get("uploader_tag")));
                item.put("uploadedAt", time(row.get("create_time")));
                item.put("status", statusMap.getOrDefault(url, "approved"));
                target.put(url, item);
            }
        }
    }

    private Map<String, String> loadImageStatusMap(List<Map<String, Object>> rows) {
        Set<String> urls = new LinkedHashSet<>();
        for (Map<String, Object> row : rows) {
            urls.addAll(parseImages(row.get("images")));
        }
        return adminImageStatusService.loadStatusMap(urls);
    }

    public void evictNewsRelated(Long newsId) {
        if (newsId != null && newsId > 0) {
            cacheService.evictNews(newsId);
        } else {
            cacheService.evictNewsList();
        }
        cacheService.evictHomeIndex();
    }

    public void evictMarketRelated(Long itemId) {
        if (itemId != null && itemId > 0) {
            cacheService.evictMarketItem(itemId);
        }
        cacheService.evictMarketList();
        cacheService.evictHomeIndex();
    }

    public Map<String, Object> goodsItem(Map<String, Object> row) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", str(row.get("id")));
        item.put("title", str(row.get("title")));
        item.put("price", decimal(row.get("price")));
        item.put("category", normalizeGoodsCategory(str(row.get("category"))));
        item.put("condition", str(row.get("item_condition")));
        item.put("sellerName", emptyTo(str(row.get("seller_name")), "未知用户"));
        item.put("sellerId", str(row.get("seller_id")));
        item.put("sellerAvatar", str(row.get("seller_avatar")));
        item.put("sellerTag", str(row.get("seller_tag")));
        item.put("sellerRating", decimal(row.get("seller_rating")));
        item.put("location", str(row.get("location")));
        item.put("distance", "");
        item.put("images", parseImages(row.get("images")));
        item.put("description", str(row.get("description")));
        item.put("time", time(row.get("created_at")));
        item.put("status", emptyTo(str(row.get("status")), "active"));
        item.put("rejectReason", str(row.get("reject_reason")));
        return item;
    }

    public Map<String, Object> serviceItem(Map<String, Object> row) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", str(row.get("id")));
        item.put("title", str(row.get("title")));
        item.put("category", str(row.get("category")));
        item.put("providerName", emptyTo(str(row.get("provider_name")), "未知商家"));
        item.put("providerAvatar", str(row.get("provider_avatar")));
        item.put("providerTag", str(row.get("provider_tag")));
        item.put("isVerifiedProvider", bool(row.get("provider_verified")));
        item.put("price", decimal(row.get("price")));
        item.put("unit", str(row.get("unit")));
        item.put("rating", decimal(row.get("rating")));
        item.put("reviewCount", num(row.get("reviews")));
        item.put("time", time(row.get("created_at")));
        item.put("status", emptyTo(str(row.get("status")), "active"));
        item.put("area", emptyTo(str(row.get("area")), str(row.get("distance"))));
        item.put("phone", str(row.get("phone")));
        item.put("description", str(row.get("description")));
        item.put("rejectReason", str(row.get("reject_reason")));
        return item;
    }

    public Map<String, Object> notificationItem(Map<String, Object> row) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", str(row.get("id")));
        item.put("title", str(row.get("title")));
        item.put("content", str(row.get("content")));
        item.put("target", "specific");
        item.put("time", time(row.get("time")));
        item.put("status", "sent");
        item.put("read", bool(row.get("is_read")));
        return item;
    }

    public Map<String, Object> messageItem(Map<String, Object> row) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", str(row.get("id")));
        item.put("senderId", str(row.get("sender_id")));
        item.put("senderName", emptyTo(str(row.get("sender_name")), str(row.get("sender_id"))));
        item.put("senderAvatar", str(row.get("sender_avatar")));
        item.put("senderTag", str(row.get("sender_tag")));
        item.put("receiverId", str(row.get("receiver_id")));
        item.put("receiverName", emptyTo(str(row.get("receiver_name")), str(row.get("receiver_id"))));
        item.put("receiverAvatar", str(row.get("receiver_avatar")));
        item.put("receiverTag", str(row.get("receiver_tag")));
        item.put("content", str(row.get("content")));
        item.put("messageType", emptyTo(str(row.get("message_type")), "text"));
        item.put("mediaUrl", str(row.get("media_url")));
        item.put("isRead", bool(row.get("is_read")));
        item.put("createTime", time(row.get("create_time")));
        return item;
    }
    public void evictServiceRelated(Long serviceId) {
        if (serviceId != null && serviceId > 0) {
            cacheService.evictService(serviceId);
        }
        cacheService.evictHomeIndex();
    }

    public void recalcNewsCommentCount(Long newsId) {
        if (newsId == null || newsId <= 0) {
            return;
        }
        Long commentsCount = commentMapper.selectCount(new LambdaQueryWrapper<Comment>()
                .eq(Comment::getNewsId, newsId)
                .eq(Comment::getStatus, "normal"));
        newsMapper.update(null, new LambdaUpdateWrapper<News>()
                .eq(News::getId, newsId)
                .set(News::getCommentsCount, commentsCount == null ? 0 : commentsCount.intValue()));
    }

    public void recalcServiceReviewStats(Long serviceId) {
        if (serviceId == null || serviceId <= 0) {
            return;
        }
        Long reviews = serviceReviewMapper.selectCount(new LambdaQueryWrapper<ServiceReview>()
                .eq(ServiceReview::getServiceId, serviceId)
                .eq(ServiceReview::getStatus, "normal"));
        Double rating = jdbcTemplate.queryForObject(
                "SELECT COALESCE(AVG(rating), 0) FROM t_service_review WHERE service_id = ? AND status = 'normal'",
                Double.class,
                serviceId
        );
        serviceMapper.update(null, new LambdaUpdateWrapper<ServiceEntity>()
                .eq(ServiceEntity::getId, serviceId)
                .set(ServiceEntity::getReviews, reviews == null ? 0 : reviews.intValue())
                .set(ServiceEntity::getRating, rating == null ? 0D : rating));
    }

    public Long queryLong(String sql, Object... args) {
        try {
            return jdbcTemplate.queryForObject(sql, Long.class, args);
        } catch (Exception e) {
            return null;
        }
    }

    private void saveLoginLog(String userId, String username, String ip, String device, String status, String failReason) {
        adminLogDispatchService.dispatchLoginLog(userId, username, ip, device, status, failReason);
    }

    public List<Map<String, Object>> defaultMenus() {
        return List.of(
                menu("dir-users", null, MENU_GROUP_USER, "", "admin_panel_settings", 10, "directory", null),
                menu("menu-users", "dir-users", "\u7528\u6237\u7ba1\u7406", "/admin/users", "group", 11, "menu", "user:view"),
                menu("menu-blacklist", "dir-users", "\u98ce\u63a7\u9ed1\u540d\u5355", "/admin/blacklist", "gavel", 12, "menu", "blacklist:edit"),
                menu("dir-content", null, MENU_GROUP_CONTENT, "", "forum", 20, "directory", null),
                menu("menu-posts", "dir-content", "\u52a8\u6001\u7ba1\u7406", "/admin/posts", "explore", 21, "menu", "posts:audit"),
                menu("menu-comments", "dir-content", "\u8bc4\u8bba\u7ba1\u7406", "/admin/comments", "chat_bubble", 22, "menu", "comments:view"),
                menu("menu-images", "dir-content", "\u56fe\u7247\u7ba1\u7406", "/admin/images", "photo_library", 23, "menu", "images:audit"),
                menu("menu-messages", "dir-content", "\u6d88\u606f\u7ba1\u7406", "/admin/messages", "mail", 24, "menu", "messages:view"),
                menu("dir-services", null, MENU_GROUP_SERVICE, "", "storefront", 30, "directory", null),
                menu("menu-market", "dir-services", "\u95f2\u7f6e\u5546\u54c1\u7ba1\u7406", "/admin/market", "shopping_bag", 31, "menu", "goods:view"),
                menu("menu-services", "dir-services", "\u751f\u6d3b\u670d\u52a1\u7ba1\u7406", "/admin/services", "home_repair_service", 32, "menu", "services:view"),
                menu("menu-orders", "dir-services", "\u8ba2\u5355\u7ba1\u7406", "/admin/orders", "receipt_long", 33, "menu", "orders:view"),
                menu("dir-system", null, MENU_GROUP_SYSTEM, "", "settings_suggest", 40, "directory", null),
                menu("menu-notifications", "dir-system", "\u901a\u77e5\u7ba1\u7406", "/admin/notifications", "campaign", 41, "menu", "notifications:view"),
                menu("menu-categories", "dir-system", "\u5206\u7c7b\u7ba1\u7406", "/admin/categories", "category", 42, "menu", "categories:view"),
                menu("menu-menus", "dir-system", "\u83dc\u5355\u914d\u7f6e", "/admin/menus", "table_rows", 43, "menu", "menus:view"),
                menu("menu-roles", "dir-system", "\u89d2\u8272\u6743\u9650", "/admin/roles", "shield", 44, "menu", "roles:view"),
                menu("menu-permissions", "dir-system", "\u6743\u9650\u6e05\u5355", "/admin/permissions", "lock", 45, "menu", "permissions:view"),
                menu("dir-logs", null, MENU_GROUP_SECURITY, "", "security", 50, "directory", null),
                menu("menu-login-logs", "dir-logs", "\u767b\u5f55\u65e5\u5fd7", "/admin/login-logs", "fingerprint", 51, "menu", "logs:login"),
                menu("menu-op-logs", "dir-logs", "\u64cd\u4f5c\u65e5\u5fd7", "/admin/op-logs", "receipt_long", 52, "menu", "logs:operation")
        );
    }

    public List<Map<String, Object>> defaultPermissions() {
        return List.of(
                permission("perm-user-view", "\u7528\u6237\u5217\u8868\u67e5\u770b", "user:view", MENU_GROUP_USER),
                permission("perm-user-ban", "\u7528\u6237\u5c01\u7981\u4e0e\u542f\u7528", "user:ban", MENU_GROUP_USER),
                permission("perm-user-verify", "\u7528\u6237\u8ba4\u8bc1\u7ba1\u7406", "user:verify", MENU_GROUP_USER),
                permission("perm-user-role", "\u7528\u6237\u89d2\u8272\u5206\u914d", "user:role", MENU_GROUP_USER),
                permission("perm-blacklist", "\u9ed1\u540d\u5355\u7ef4\u62a4", "blacklist:edit", MENU_GROUP_USER),
                permission("perm-blacklist-view", "\u9ed1\u540d\u5355\u67e5\u770b", "blacklist:view", MENU_GROUP_USER),
                permission("perm-posts-view", "\u52a8\u6001\u5217\u8868\u67e5\u770b", "posts:view", MENU_GROUP_CONTENT),
                permission("perm-posts", "\u52a8\u6001\u5ba1\u6838", "posts:audit", MENU_GROUP_CONTENT),
                permission("perm-comments-view", "\u8bc4\u8bba\u5217\u8868\u67e5\u770b", "comments:view", MENU_GROUP_CONTENT),
                permission("perm-comments", "\u8bc4\u8bba\u6cbb\u7406", "comments:manage", MENU_GROUP_CONTENT),
                permission("perm-images", "\u56fe\u7247\u5ba1\u6838", "images:audit", MENU_GROUP_CONTENT),
                permission("perm-images-view", "\u56fe\u7247\u5217\u8868\u67e5\u770b", "images:view", MENU_GROUP_CONTENT),
                permission("perm-goods-view", "\u5546\u54c1\u5217\u8868\u67e5\u770b", "goods:view", MENU_GROUP_SERVICE),
                permission("perm-goods", "\u5546\u54c1\u5ba1\u6838", "goods:audit", MENU_GROUP_SERVICE),
                permission("perm-services-view", "\u670d\u52a1\u5217\u8868\u67e5\u770b", "services:view", MENU_GROUP_SERVICE),
                permission("perm-services", "\u670d\u52a1\u7ba1\u7406", "services:manage", MENU_GROUP_SERVICE),
                permission("perm-orders-view", "\u8ba2\u5355\u5217\u8868\u67e5\u770b", "orders:view", MENU_GROUP_SERVICE),
                permission("perm-orders", "\u8ba2\u5355\u5f3a\u5236\u53d6\u6d88", "orders:cancel", MENU_GROUP_SERVICE),
                permission("perm-notice-view", "\u901a\u77e5\u67e5\u770b", "notifications:view", MENU_GROUP_SYSTEM),
                permission("perm-notice", "\u901a\u77e5\u53d1\u5e03", "notifications:create", MENU_GROUP_SYSTEM),
                permission("perm-category-view", "\u5206\u7c7b\u67e5\u770b", "categories:view", MENU_GROUP_SYSTEM),
                permission("perm-category", "\u5206\u7c7b\u7ef4\u62a4", "categories:edit", MENU_GROUP_SYSTEM),
                permission("perm-menu-view", "\u83dc\u5355\u67e5\u770b", "menus:view", MENU_GROUP_SYSTEM),
                permission("perm-role-view", "\u89d2\u8272\u67e5\u770b", "roles:view", MENU_GROUP_SYSTEM),
                permission("perm-role-manage", "\u89d2\u8272\u914d\u7f6e", "roles:manage", MENU_GROUP_SYSTEM),
                permission("perm-permission-view", "\u6743\u9650\u67e5\u770b", "permissions:view", MENU_GROUP_SYSTEM),
                permission("perm-message-view", "\u6d88\u606f\u67e5\u770b", "messages:view", MENU_GROUP_SYSTEM),
                permission("perm-message-manage", "\u6d88\u606f\u7ba1\u7406", "messages:manage", MENU_GROUP_SYSTEM),
                permission("perm-login-log", "\u767b\u5f55\u65e5\u5fd7\u67e5\u770b", "logs:login", MENU_GROUP_SECURITY),
                permission("perm-op-log", "\u64cd\u4f5c\u65e5\u5fd7\u67e5\u770b", "logs:operation", MENU_GROUP_SECURITY),
                permission("perm-logs", "\u65e5\u5fd7\u7559\u5b58\u7b56\u7565", "logs:retention", MENU_GROUP_SYSTEM)
        );
    }

    public List<Map<String, Object>> systemRoles() {
        ensureDefaultAdminRoles();
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                SELECT *
                FROM t_admin_role
                ORDER BY CASE code
                    WHEN 'SUPER_ADMIN' THEN 1
                    WHEN 'ADMIN' THEN 2
                    WHEN 'READONLY_ADMIN' THEN 3
                    ELSE 4
                END, create_time ASC
                """);
        return rows.stream().map(row -> role(
                str(row.get("id")),
                str(row.get("name")),
                str(row.get("code")),
                str(row.get("description")),
                parseStringArray(str(row.get("menu_ids"))),
                parseStringArray(str(row.get("permission_codes"))),
                emptyTo(str(row.get("status")), "active"),
                countAdminMembers(str(row.get("code"))),
                time(row.get("create_time"))
        )).toList();
    }

    private void ensureDefaultAdminRoles() {
        builtInRoleSeeds().forEach(this::upsertSystemRole);
    }

    private List<RoleSeed> builtInRoleSeeds() {
        return List.of(
                new RoleSeed("role-super", "\u8d85\u7ea7\u7ba1\u7406\u5458", ROLE_SUPER_ADMIN, "\u62e5\u6709\u7ba1\u7406\u7aef\u5168\u90e8\u9875\u9762\u4e0e\u5168\u90e8\u64cd\u4f5c\u6743\u9650", defaultMenuIdsFor(ROLE_SUPER_ADMIN), defaultPermissionCodesFor(ROLE_SUPER_ADMIN), "active"),
                new RoleSeed("role-admin", "\u7ba1\u7406\u5458", ROLE_ADMIN, "\u53ef\u8bbf\u95ee\u5168\u90e8\u7ba1\u7406\u9875\u9762\uff0c\u8d1f\u8d23\u65e5\u5e38\u5ba1\u6838\u4e0e\u8fd0\u8425\u64cd\u4f5c", defaultMenuIdsFor(ROLE_ADMIN), defaultPermissionCodesFor(ROLE_ADMIN), "active"),
                new RoleSeed("role-readonly", "\u53ea\u8bfb\u7ba1\u7406\u5458", ROLE_READONLY_ADMIN, "\u53ef\u8bbf\u95ee\u5168\u90e8\u7ba1\u7406\u9875\u9762\uff0c\u4f46\u4e0d\u53ef\u6267\u884c\u5199\u64cd\u4f5c", defaultMenuIdsFor(ROLE_READONLY_ADMIN), defaultPermissionCodesFor(ROLE_READONLY_ADMIN), "active"),
                new RoleSeed("role-user", "\u666e\u901a\u7528\u6237", ROLE_USER, "\u524d\u53f0\u666e\u901a\u8d26\u53f7\uff0c\u4e0d\u5177\u5907\u7ba1\u7406\u7aef\u6743\u9650", List.of(), List.of(), "active")
        );
    }

    private void upsertSystemRole(RoleSeed seed) {
        adminRoleConfigService.upsertSystemRole(
                seed.id(),
                seed.name(),
                seed.code(),
                seed.description(),
                seed.status(),
                stringifyArray(seed.menuIds()),
                stringifyArray(seed.permissionCodes())
        );
    }

    private long countAdminMembers(String code) {
        return adminRoleConfigService.countAdminMembers(code);
    }

    private AdminRoleConfig loadAdminRoleConfig(String roleCode) {
        if (ROLE_USER.equals(roleCode)) {
            return new AdminRoleConfig("disabled", List.of(), List.of());
        }
        List<String> defaultMenuIds = defaultMenuIdsFor(roleCode);
        List<String> defaultPermissionCodes = defaultPermissionCodesFor(roleCode);
        try {
            AdminRole role = adminRoleConfigService.findByCode(roleCode);
            if (role == null) {
                return new AdminRoleConfig("active", defaultMenuIds, defaultPermissionCodes);
            }
            List<String> menuIds = parseStringArray(str(role.getMenuIds()));
            List<String> permissionCodes = parseStringArray(str(role.getPermissionCodes()));
            return new AdminRoleConfig(
                    emptyTo(str(role.getStatus()), "active"),
                    menuIds.isEmpty() ? defaultMenuIds : menuIds,
                    permissionCodes.isEmpty() ? defaultPermissionCodes : permissionCodes
            );
        } catch (Exception ignored) {
            return new AdminRoleConfig("active", defaultMenuIds, defaultPermissionCodes);
        }
    }

    private List<String> defaultMenuIdsFor(String roleCode) {
        return switch (roleCode) {
            case ROLE_SUPER_ADMIN, ROLE_ADMIN, ROLE_READONLY_ADMIN -> allMenuIds();
            default -> List.of();
        };
    }

    private List<String> defaultPermissionCodesFor(String roleCode) {
        return switch (roleCode) {
            case ROLE_SUPER_ADMIN -> allPermissionCodes();
            case ROLE_ADMIN -> adminPermissionCodes();
            case ROLE_READONLY_ADMIN -> readonlyPermissionCodes();
            default -> List.of();
        };
    }

    private List<String> allMenuIds() {
        return defaultMenus().stream()
                .filter(menu -> "menu".equals(str(menu.get("type"))))
                .map(menu -> str(menu.get("id")))
                .toList();
    }

    private List<String> allPermissionCodes() {
        return defaultPermissions().stream().map(item -> str(item.get("code"))).toList();
    }

    private List<String> adminPermissionCodes() {
        return allPermissionCodes().stream()
                .filter(code -> !ADMIN_RESTRICTED_PERMISSION_CODES.contains(code))
                .toList();
    }

    private List<String> readonlyPermissionCodes() {
        return READONLY_PERMISSION_CODES;
    }

    private Map<String, Object> menu(String id, String parentId, String name, String path, String icon, int order, String type, String permission) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("parentId", parentId);
        m.put("name", name);
        m.put("path", path);
        m.put("icon", icon);
        m.put("order", order);
        m.put("status", "active");
        m.put("type", type);
        m.put("permissionCode", permission);
        return m;
    }

    private Map<String, Object> role(String id, String name, String code, String description, List<String> menuIds, List<String> permissionCodes, String status, long memberCount, String createTime) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("id", id);
        r.put("name", name);
        r.put("code", code);
        r.put("description", description);
        r.put("status", status);
        r.put("createTime", createTime);
        r.put("memberCount", memberCount);
        r.put("menuIds", menuIds);
        r.put("permissionCodes", permissionCodes);
        return r;
    }

    private Map<String, Object> permission(String id, String name, String code, String category) {
        Map<String, Object> p = new LinkedHashMap<>();
        p.put("id", id);
        p.put("name", name);
        p.put("code", code);
        p.put("category", category);
        p.put("description", name);
        p.put("status", "active");
        p.put("createTime", now());
        return p;
    }

    private List<String> parseStringArray(String raw) {
        return CollectionStringUtil.parseStringArray(raw);
    }

    public String stringifyArray(Object value) {
        return CollectionStringUtil.stringifyArray(value);
    }

    private void executeQuietly(String sql) {
        try {
            jdbcTemplate.execute(sql);
        } catch (Exception ignored) {
        }
    }

    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }

    public String empty(String value) {
        return value == null ? "" : value;
    }

    public String requestStatus(StatusRequest body, String fallback) {
        return emptyTo(body == null ? null : body.status(), fallback);
    }

    public String requestRejectReason(StatusRequest body) {
        return body == null ? "" : empty(body.rejectReason());
    }

    public String escapeSql(String value) {
        return empty(value).replace("'", "''");
    }

    private String requestIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null || forwarded.isBlank() ? request.getRemoteAddr() : forwarded.split(",")[0].trim();
    }

    public String str(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    public String emptyTo(String value, String fallback) {
        return StringValueUtil.emptyTo(value, fallback);
    }

    public int num(Object value) {
        if (value instanceof Number number) return number.intValue();
        try {
            return Integer.parseInt(str(value));
        } catch (Exception e) {
            return 0;
        }
    }

    public long longVal(Object value) {
        if (value instanceof Number number) return number.longValue();
        try {
            return Long.parseLong(str(value));
        } catch (Exception e) {
            return 0L;
        }
    }

    public BigDecimal decimal(Object value) {
        if (value instanceof BigDecimal decimal) return decimal;
        try {
            return new BigDecimal(str(value));
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    public boolean bool(Object value) {
        if (value instanceof Boolean b) return b;
        if (value instanceof Number n) return n.intValue() != 0;
        return Boolean.parseBoolean(str(value));
    }

    public String time(Object value) {
        if (value == null) return "";
        if (value instanceof LocalDateTime ldt) return ldt.format(FORMATTER);
        return str(value).replace("T", " ");
    }

    private String now() {
        return LocalDateTime.now().format(FORMATTER);
    }

    public String firstText(String content) {
        if (content == null || content.isBlank()) return "\u672a\u547d\u540d";
        return content.length() > 24 ? content.substring(0, 24) + "..." : content;
    }

    public String normalizeDynamicCategory(String category) {
        if (category == null || category.isBlank()) return "life";
        String lower = category.toLowerCase(Locale.ROOT);
        if (lower.contains("help") || lower.contains("assist")) return "help";
        if (lower.contains("activity") || lower.contains("event")) return "activity";
        if (lower.contains("food") || lower.contains("shop") || lower.contains("eat")) return "food";
        return "life";
    }

    public String normalizeGoodsCategory(String category) {
        if (category == null) return "other";
        String lower = category.toLowerCase(Locale.ROOT);
        if (lower.contains("elect")) return "electronics";
        if (lower.contains("furn")) return "furniture";
        if (lower.contains("cloth")) return "clothing";
        if (lower.contains("book")) return "books";
        return "other";
    }

    public String normalizeOrderStatus(String status) {
        return switch (status) {
            case "pending" -> "pending_payment";
            case "confirmed", "in_progress" -> "pending_execution";
            case "completed" -> "completed";
            case "cancelled", "canceled" -> "canceled";
            default -> "abnormal";
        };
    }

    public List<String> parseImages(Object value) {
        return CollectionStringUtil.parseStringArray(str(value));
    }
}
