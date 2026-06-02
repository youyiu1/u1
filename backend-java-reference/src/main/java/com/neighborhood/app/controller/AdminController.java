/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.entity.User;
import com.neighborhood.app.mapper.UserMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.util.JwtUtil;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private static final String TOKEN_PREFIX = "token:";
    private static final String ROLE_USER = "USER";
    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_READONLY_ADMIN = "READONLY_ADMIN";
    private static final String ROLE_SUPER_ADMIN = "SUPER_ADMIN";
    private static final String MENU_GROUP_USER = "用户风控";
    private static final String MENU_GROUP_CONTENT = "内容运营";
    private static final String MENU_GROUP_SERVICE = "生活服务";
    private static final String MENU_GROUP_SYSTEM = "系统设置";
    private static final String MENU_GROUP_SECURITY = "系统安全";
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final JdbcTemplate jdbcTemplate;
    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;
    private final CacheService cacheService;

    private record RoleSeed(
            String id,
            String name,
            String code,
            String description,
            List<String> menuIds,
            List<String> permissionCodes,
            String status
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

    // 绠＄悊绔櫥褰曪紝浣跨敤鐪熷疄鐢ㄦ埛琛ㄨ处鍙风鍙?JWT
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String account = body.getOrDefault("username", "").trim();
        String password = body.getOrDefault("password", "");
        User user = findUserByAccount(account);
        if (user == null || !Objects.equals(user.getPassword(), password)) {
            saveLoginLog("", account, requestIp(request), request.getHeader("User-Agent"), "failed", "账号或密码错误");
            return Result.fail("账号或密码错误");
        }
        String adminRole = normalizeAdminRole(user.getAdminRole());
        if (ROLE_USER.equals(adminRole)) {
            saveLoginLog(user.getId(), user.getName(), requestIp(request), request.getHeader("User-Agent"), "failed", "鏅€氱敤鎴蜂笉鑳借闂鐞嗙");
            return Result.fail("鏅€氱敤鎴蜂笉鑳借闂鐞嗙");
        }
        if (!isAdminRoleEnabled(adminRole)) {
            saveLoginLog(user.getId(), user.getName(), requestIp(request), request.getHeader("User-Agent"), "failed", "褰撳墠绠＄悊鍛樿鑹插凡鍋滅敤");
            return Result.fail("褰撳墠绠＄悊鍛樿鑹插凡鍋滅敤");
        }
        String token = jwtUtil.generateToken(user.getId());
        redisTemplate.opsForValue().set(TOKEN_PREFIX + user.getId(), token, jwtUtil.getExpiration(), TimeUnit.MILLISECONDS);
        saveLoginLog(user.getId(), user.getName(), requestIp(request), request.getHeader("User-Agent"), "success", "");
        return Result.ok(Map.of(
                "token", token,
                "username", user.getName(),
                "adminRole", adminRole,
                "readonly", String.valueOf(isReadOnlyRole(adminRole)),
                "permissionCodes", rolePermissionCodes(adminRole),
                "menuIds", roleMenuIds(adminRole)
        ));
    }

    // 鑾峰彇褰撳墠绠＄悊鍛樹俊鎭?
    @GetMapping("/me")
    public Result<Map<String, Object>> me(@RequestAttribute String userId) {
        User user = userMapper.selectById(userId);
        String adminRole = normalizeAdminRole(user == null ? "" : user.getAdminRole());
        if (ROLE_USER.equals(adminRole)) {
            return Result.fail("鏅€氱敤鎴蜂笉鑳借闂鐞嗙");
        }
        if (!isAdminRoleEnabled(adminRole)) {
            return Result.fail("褰撳墠绠＄悊鍛樿鑹插凡鍋滅敤");
        }
        return Result.ok(Map.of(
                "username", user == null ? "admin" : user.getName(),
                "adminRole", adminRole,
                "readonly", String.valueOf(isReadOnlyRole(adminRole)),
                "permissionCodes", rolePermissionCodes(adminRole),
                "menuIds", roleMenuIds(adminRole)
        ));
    }

    // 绠＄悊绔椤电粺璁?
    @GetMapping("/dashboard/stats")
    public Result<Map<String, Object>> stats() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalUsers", count("t_user"));
        data.put("totalUsersTrend", 0);
        data.put("newPosts", countWhere("t_news", "status <> 'removed'"));
        data.put("newPostsTrend", 0);
        data.put("activeGoods", countWhere("t_market_item", "status = 'active'"));
        data.put("activeGoodsTrend", 0);
        data.put("activeServices", countWhere("t_service", "status = 'active'"));
        data.put("activeServicesTrend", 0);
        data.put("monthlyOrders", countWhere("t_order", "create_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)"));
        data.put("monthlyOrdersTrend", 0);
        return Result.ok(data);
    }

    // 绠＄悊绔敤鎴峰垪琛?
    @GetMapping("/users")
    public Result<List<Map<String, Object>>> users() {
        String sql = """
                SELECT u.*,
                       COALESCE(n.dynamics_count, 0) dynamics_count,
                       COALESCE(m.goods_count, 0) goods_count,
                       COALESCE(s.services_count, 0) services_count
                FROM t_user u
                LEFT JOIN (
                    SELECT author_id, COUNT(1) dynamics_count
                    FROM t_news
                    GROUP BY author_id
                ) n ON n.author_id = u.id
                LEFT JOIN (
                    SELECT seller_id, COUNT(1) goods_count
                    FROM t_market_item
                    GROUP BY seller_id
                ) m ON m.seller_id = u.id
                LEFT JOIN (
                    SELECT seller_id, COUNT(1) services_count
                    FROM t_service
                    GROUP BY seller_id
                ) s ON s.seller_id = u.id
                ORDER BY u.created_at DESC
                """;
        return Result.ok(jdbcTemplate.queryForList(sql).stream().map(row -> {
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
        }).toList());
    }

    // 鏇存柊鐢ㄦ埛鐘舵€?
    @PostMapping("/users/{id}/status")
    public Result<Void> updateUserStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        jdbcTemplate.update("UPDATE t_user SET status = ? WHERE id = ?", body.getOrDefault("status", "normal"), id);
        return Result.ok();
    }

    // 鏇存柊鐢ㄦ埛璁よ瘉鐘舵€?
    @PostMapping("/users/{id}/verified")
    public Result<Void> updateUserVerified(@PathVariable String id, @RequestBody Map<String, String> body) {
        boolean verified = "verified".equals(body.get("verified"));
        jdbcTemplate.update("UPDATE t_user SET is_verified = ? WHERE id = ?", verified ? 1 : 0, id);
        return Result.ok();
    }

    // 鏇存柊鐢ㄦ埛绠＄悊瑙掕壊锛堜粎瓒呯骇绠＄悊鍛橈級
    @PostMapping("/users/{id}/admin-role")
    public Result<Void> updateUserAdminRole(@PathVariable String id, @RequestBody Map<String, String> body, @RequestAttribute String userId) {
        User operator = userMapper.selectById(userId);
        if (operator == null || !ROLE_SUPER_ADMIN.equals(normalizeAdminRole(operator.getAdminRole()))) {
            return Result.fail("仅超级管理员可设置角色");
        }
        String nextRole = normalizeAdminRole(body.getOrDefault("adminRole", ROLE_USER));
        User targetUser = userMapper.selectById(id);
        if (targetUser == null) {
            return Result.fail("用户不存在");
        }
        String currentRole = normalizeAdminRole(targetUser.getAdminRole());
        if (ROLE_SUPER_ADMIN.equals(currentRole) && !ROLE_SUPER_ADMIN.equals(nextRole)) {
            Long count = jdbcTemplate.queryForObject("SELECT COUNT(1) FROM t_user WHERE admin_role = 'SUPER_ADMIN'", Long.class);
            if (count != null && count <= 1) {
                return Result.fail("鑷冲皯淇濈暀涓€涓秴绾х鐞嗗憳");
            }
        }
        jdbcTemplate.update("UPDATE t_user SET admin_role = ? WHERE id = ?", nextRole, id);
        return Result.ok();
    }

    // 绠＄悊绔姩鎬佸垪琛?
    @GetMapping("/dynamics")
    public Result<List<Map<String, Object>>> dynamics() {
        String sql = """
                SELECT n.*, u.name author_name, u.avatar author_avatar, u.tag author_tag, u.is_verified author_verified
                FROM t_news n LEFT JOIN t_user u ON n.author_id = u.id
                ORDER BY n.create_time DESC
                """;
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
        Map<Long, List<Map<String, Object>>> commentsByNews = commentsForNewsBatch(
                rows.stream().map(row -> longVal(row.get("id"))).filter(id -> id > 0).toList()
        );
        return Result.ok(rows.stream().map(row -> {
            Long id = longVal(row.get("id"));
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", str(id));
            item.put("title", emptyTo(str(row.get("title")), firstText(str(row.get("content")))));
            item.put("author", emptyTo(str(row.get("author_name")), "鏈煡鐢ㄦ埛"));
            item.put("authorAvatar", str(row.get("author_avatar")));
            item.put("authorTag", str(row.get("author_tag")));
            item.put("category", normalizeDynamicCategory(str(row.get("category"))));
            item.put("time", time(row.get("create_time")));
            item.put("images", parseImages(row.get("images")));
            item.put("status", emptyTo(str(row.get("status")), "normal"));
            item.put("likes", num(row.get("likes")));
            item.put("commentsCount", num(row.get("comments_count")));
            item.put("comments", commentsByNews.getOrDefault(id, List.of()));
            item.put("rejectReason", str(row.get("reject_reason")));
            item.put("userId", str(row.get("author_id")));
            item.put("verifiedUser", bool(row.get("author_verified")));
            return item;
        }).toList());
    }

    // 鏇存柊鍔ㄦ€佸鏍哥姸鎬?
    @PostMapping("/dynamics/{id}/status")
    public Result<Void> updateDynamicStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        jdbcTemplate.update("UPDATE t_news SET status = ?, reject_reason = ? WHERE id = ?",
                body.getOrDefault("status", "normal"), body.getOrDefault("rejectReason", ""), id);
        evictNewsRelated(id);
        return Result.ok();
    }

    // 绠＄悊绔拷鍔犲姩鎬佽瘎璁?
    @PostMapping("/dynamics/{id}/comments")
    public Result<Void> addComment(@PathVariable Long id, @RequestBody Map<String, String> body, @RequestAttribute String userId) {
        User user = userMapper.selectById(userId);
        String name = body.getOrDefault("commenter", user == null ? "管理员" : user.getName());
        String avatar = user == null ? "" : user.getAvatar();
        jdbcTemplate.update("INSERT INTO t_comment(news_id,parent_id,user_id,user_name,user_avatar,content,likes,status,create_time) VALUES(?,?,?,?,?,?,?,?,NOW())",
                id, 0, userId, name, avatar, body.getOrDefault("text", ""), 0, "normal");
        recalcNewsCommentCount(id);
        evictNewsRelated(id);
        return Result.ok();
    }

    // 绠＄悊绔垹闄ゅ姩鎬佽瘎璁?
    @DeleteMapping("/dynamics/{id}/comments/{commentId}")
    public Result<Void> deleteDynamicComment(@PathVariable Long id, @PathVariable Long commentId) {
        int deleted = jdbcTemplate.update("DELETE FROM t_comment WHERE id = ? AND news_id = ?", commentId, id);
        if (deleted > 0) {
            recalcNewsCommentCount(id);
            evictNewsRelated(id);
        }
        return Result.ok();
    }

    // 绠＄悊绔晢鍝佸垪琛?
    @GetMapping("/goods")
    public Result<List<Map<String, Object>>> goods() {
        String sql = """
                SELECT m.*, u.name seller_name, u.avatar seller_avatar, u.tag seller_tag, u.rating seller_rating
                FROM t_market_item m LEFT JOIN t_user u ON m.seller_id = u.id
                ORDER BY m.created_at DESC
                """;
        return Result.ok(jdbcTemplate.queryForList(sql).stream().map(row -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", str(row.get("id")));
            item.put("title", str(row.get("title")));
            item.put("price", decimal(row.get("price")));
            item.put("category", normalizeGoodsCategory(str(row.get("category"))));
            item.put("condition", str(row.get("item_condition")));
            item.put("sellerName", emptyTo(str(row.get("seller_name")), "鏈煡鐢ㄦ埛"));
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
        }).toList());
    }

    // 鏇存柊鍟嗗搧瀹℃牳鐘舵€?
    @PostMapping("/goods/{id}/status")
    public Result<Void> updateGoodsStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        jdbcTemplate.update("UPDATE t_market_item SET status = ?, reject_reason = ? WHERE id = ?",
                body.getOrDefault("status", "active"), body.getOrDefault("rejectReason", ""), id);
        cacheService.evictMarketItem(id);
        cacheService.evictMarketList();
        cacheService.evictHomeIndex();
        return Result.ok();
    }

    // 绠＄悊绔湇鍔″垪琛?
    @GetMapping("/services")
    public Result<List<Map<String, Object>>> services() {
        String sql = """
                SELECT s.*, u.name provider_name, u.avatar provider_avatar, u.tag provider_tag, u.is_verified provider_verified
                FROM t_service s LEFT JOIN t_user u ON s.seller_id = u.id
                ORDER BY s.created_at DESC
                """;
        return Result.ok(jdbcTemplate.queryForList(sql).stream().map(row -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", str(row.get("id")));
            item.put("title", str(row.get("title")));
            item.put("category", str(row.get("category")));
            item.put("providerName", emptyTo(str(row.get("provider_name")), "鏈煡鍟嗗"));
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
        }).toList());
    }

    // 鏂板鏈嶅姟
    @PostMapping("/services")
    public Result<Void> addService(@RequestBody Map<String, Object> body, @RequestAttribute String userId) {
        jdbcTemplate.update("""
                INSERT INTO t_service(title,description,category,price,seller_id,rating,reviews,distance,unit,status,area,phone,created_at,updated_at)
                VALUES(?,?,?,?,?,0,0,'',?,?,?,?,NOW(),NOW())
                """,
                str(body.get("title")), str(body.get("description")), str(body.get("category")),
                decimal(body.get("price")), userId, str(body.get("unit")),
                emptyTo(str(body.get("status")), "pending"), str(body.get("area")), str(body.get("phone")));
        return Result.ok();
    }

    // 鏇存柊鏈嶅姟瀹℃牳鐘舵€?
    @PostMapping("/services/{id}/status")
    public Result<Void> updateServiceStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        jdbcTemplate.update("UPDATE t_service SET status = ?, reject_reason = ? WHERE id = ?",
                body.getOrDefault("status", "active"), body.getOrDefault("rejectReason", ""), id);
        cacheService.evictService(id);
        cacheService.evictHomeIndex();
        return Result.ok();
    }

    // 绠＄悊绔鍗曞垪琛?
    // 绠＄悊绔鍗曞垪琛?
    @GetMapping("/orders")
    public Result<List<Map<String, Object>>> orders() {
        try {
            String sql = """
                    SELECT o.*, bu.name buyer_name, bu.tag buyer_tag, su.name seller_name, su.tag seller_tag, s.title service_name
                    FROM t_order o
                    LEFT JOIN t_user bu ON o.buyer_id = bu.id
                    LEFT JOIN t_user su ON o.seller_id = su.id
                    LEFT JOIN t_service s ON o.service_id = s.id
                    ORDER BY o.create_time DESC
                    """;
            return Result.ok(jdbcTemplate.queryForList(sql).stream().map(this::orderItem).toList());
        } catch (Exception ignored) {
            return Result.ok(jdbcTemplate.queryForList("SELECT * FROM t_order ORDER BY create_time DESC").stream().map(this::orderItem).toList());
        }
    }

    // 寮哄埗鍙栨秷璁㈠崟
    @PostMapping("/orders/{id}/cancel")
    public Result<Void> cancelOrder(@PathVariable Long id, @RequestBody Map<String, String> body) {
        jdbcTemplate.update("UPDATE t_order SET status = 'cancelled', cancel_reason = ?, update_time = NOW() WHERE id = ?",
                body.getOrDefault("reason", "管理员强制取消"), id);
        return Result.ok();
    }

    @GetMapping("/categories")
    public Result<List<Map<String, Object>>> categories() {
        ensureDefaultCategories();
        String sql = "SELECT * FROM t_category ORDER BY sort_order ASC, id ASC";
        return Result.ok(jdbcTemplate.queryForList(sql).stream().map(this::categoryItem).toList());
    }

    // 鏂板鍒嗙被
    @PostMapping("/categories")
    public Result<Void> addCategory(@RequestBody Map<String, String> body) {
        ensureDefaultCategories();
        Integer nextOrder = jdbcTemplate.queryForObject("SELECT COALESCE(MAX(sort_order),0)+1 FROM t_category WHERE type = ?", Integer.class, body.getOrDefault("type", "service"));
        jdbcTemplate.update("INSERT INTO t_category(name, icon, type, status, sort_order) VALUES(?,?,?,?,?)",
                body.getOrDefault("name", ""), "category", body.getOrDefault("type", "service"), "normal", nextOrder == null ? 1 : nextOrder);
        return Result.ok();
    }

    @PostMapping("/categories/{id}/toggle")
    public Result<Void> toggleCategory(@PathVariable Long id) {
        jdbcTemplate.update("UPDATE t_category SET status = IF(status='normal','disabled','normal') WHERE id = ?", id);
        return Result.ok();
    }

    // 绠＄悊绔€氱煡鍒楄〃
    @GetMapping("/notifications")
    public Result<List<Map<String, Object>>> notifications() {
        String sql = "SELECT * FROM t_notification ORDER BY time DESC";
        return Result.ok(jdbcTemplate.queryForList(sql).stream().map(row -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", str(row.get("id")));
            item.put("title", str(row.get("title")));
            item.put("content", str(row.get("content")));
            item.put("target", "specific");
            item.put("time", time(row.get("time")));
            item.put("status", "sent");
            item.put("read", bool(row.get("is_read")));
            return item;
        }).toList());
    }

    // 鏂板閫氱煡
    @PostMapping("/notifications")
    public Result<Void> addNotification(@RequestBody Map<String, Object> body) {
        String target = str(body.get("target"));
        List<String> userIds = "all".equals(target)
                ? jdbcTemplate.queryForList("SELECT id FROM t_user", String.class)
                : jdbcTemplate.queryForList("SELECT id FROM t_user ORDER BY created_at DESC LIMIT 1", String.class);
        for (String userId : userIds) {
            jdbcTemplate.update("INSERT INTO t_notification(id,user_id,title,content,service_name,time,is_read,is_processed) VALUES(?,?,?,?,?,NOW(),0,0)",
                    System.currentTimeMillis() + Math.abs(Objects.hash(userId, body.get("title"))), userId,
                    str(body.get("title")), str(body.get("content")), "骞冲彴鍏憡");
        }
        return Result.ok();
    }

    // 鍒囨崲閫氱煡宸茶
    @PostMapping("/notifications/{id}/toggle")
    public Result<Void> toggleNotification(@PathVariable Long id) {
        jdbcTemplate.update("UPDATE t_notification SET is_read = IF(is_read=1,0,1) WHERE id = ?", id);
        return Result.ok();
    }
    // 绠＄悊绔秷鎭垪琛?
    @GetMapping("/messages")
    public Result<List<Map<String, Object>>> messages() {
        String sql = """
                SELECT m.*, 
                       su.name sender_name, su.avatar sender_avatar, su.tag sender_tag,
                       ru.name receiver_name, ru.avatar receiver_avatar, ru.tag receiver_tag
                FROM t_message m
                LEFT JOIN t_user su ON m.sender_id COLLATE utf8mb4_unicode_ci = su.id
                LEFT JOIN t_user ru ON m.receiver_id COLLATE utf8mb4_unicode_ci = ru.id
                ORDER BY m.create_time DESC
                LIMIT 300
                """;
        return Result.ok(jdbcTemplate.queryForList(sql).stream().map(row -> {
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
        }).toList());
    }

    // 鏍囪娑堟伅宸茶
    @PostMapping("/messages/{id}/read")
    public Result<Void> markMessageRead(@PathVariable Long id) {
        jdbcTemplate.update("UPDATE t_message SET is_read = 1 WHERE id = ?", id);
        return Result.ok();
    }

    // 鍒犻櫎娑堟伅
    @DeleteMapping("/messages/{id}")
    public Result<Void> deleteMessage(@PathVariable Long id) {
        jdbcTemplate.update("DELETE FROM t_message WHERE id = ?", id);
        return Result.ok();
    }


    // 绠＄悊绔瘎璁哄垪琛?
    @GetMapping("/comments")
    public Result<List<Map<String, Object>>> managedComments() {
        String sql = """
                SELECT c.*, n.title target_title, u.tag author_tag
                FROM t_comment c
                LEFT JOIN t_news n ON c.news_id = n.id
                LEFT JOIN t_user u ON c.user_id COLLATE utf8mb4_unicode_ci = u.id
                ORDER BY c.create_time DESC
                """;
        List<Map<String, Object>> comments = new ArrayList<>(jdbcTemplate.queryForList(sql).stream().map(row -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", str(row.get("id")));
            item.put("targetType", "dynamic");
            item.put("targetId", str(row.get("news_id")));
            item.put("targetTitle", emptyTo(str(row.get("target_title")), "动态评论"));
            item.put("authorName", str(row.get("user_name")));
            item.put("authorTag", str(row.get("author_tag")));
            item.put("authorAvatar", str(row.get("user_avatar")));
            item.put("content", str(row.get("content")));
            item.put("time", time(row.get("create_time")));
            item.put("status", emptyTo(str(row.get("status")), "normal"));
            return item;
        }).toList());
        try {
            String reviewSql = """
                    SELECT r.*, s.title target_title, u.tag author_tag
                    FROM t_service_review r
                    LEFT JOIN t_service s ON r.service_id = s.id
                    LEFT JOIN t_user u ON r.user_id COLLATE utf8mb4_unicode_ci = u.id
                    ORDER BY r.create_time DESC
                    """;
            comments.addAll(jdbcTemplate.queryForList(reviewSql).stream().map(row -> {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", "service-" + str(row.get("id")));
                item.put("targetType", "service");
                item.put("targetId", str(row.get("service_id")));
                item.put("targetTitle", emptyTo(str(row.get("target_title")), "鏈嶅姟璇勪环"));
                item.put("authorName", str(row.get("user_name")));
                item.put("authorTag", str(row.get("author_tag")));
                item.put("authorAvatar", str(row.get("user_avatar")));
                item.put("content", str(row.get("content")));
                item.put("time", time(row.get("create_time")));
                item.put("status", emptyTo(str(row.get("status")), "normal"));
                return item;
            }).toList());
        } catch (Exception ignored) {
        }
        comments.sort((a, b) -> str(b.get("time")).compareTo(str(a.get("time"))));
        return Result.ok(comments);
    }

    // 鏇存柊璇勮鐘舵€?
    @PostMapping("/comments/{id}/status")
    public Result<Void> updateCommentStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "normal");
        if (id.startsWith("service-")) {
            Long reviewId = longVal(id.substring("service-".length()));
            Long serviceId = queryLong("SELECT service_id FROM t_service_review WHERE id = ?", reviewId);
            jdbcTemplate.update("UPDATE t_service_review SET status = ? WHERE id = ?", status, reviewId);
            recalcServiceReviewStats(serviceId);
            if (serviceId != null) {
                cacheService.evictService(serviceId);
            }
        } else {
            Long commentId = longVal(id);
            Long newsId = queryLong("SELECT news_id FROM t_comment WHERE id = ?", commentId);
            jdbcTemplate.update("UPDATE t_comment SET status = ? WHERE id = ?", status, commentId);
            recalcNewsCommentCount(newsId);
            evictNewsRelated(newsId);
        }
        cacheService.evictHomeIndex();
        return Result.ok();
    }

    // 鍒犻櫎璇勮
    @DeleteMapping("/comments/{id}")
    public Result<Void> deleteComment(@PathVariable String id) {
        if (id.startsWith("service-")) {
            Long reviewId = longVal(id.substring("service-".length()));
            Long serviceId = queryLong("SELECT service_id FROM t_service_review WHERE id = ?", reviewId);
            jdbcTemplate.update("DELETE FROM t_service_review WHERE id = ?", reviewId);
            recalcServiceReviewStats(serviceId);
            if (serviceId != null) {
                cacheService.evictService(serviceId);
            }
        } else {
            Long commentId = longVal(id);
            Long newsId = queryLong("SELECT news_id FROM t_comment WHERE id = ?", commentId);
            jdbcTemplate.update("DELETE FROM t_comment WHERE id = ?", commentId);
            recalcNewsCommentCount(newsId);
            evictNewsRelated(newsId);
        }
        cacheService.evictHomeIndex();
        return Result.ok();
    }

    // 绠＄悊绔粦鍚嶅崟鍒楄〃
    @GetMapping("/blacklist")
    public Result<List<Map<String, Object>>> blacklist() {
        return Result.ok(jdbcTemplate.queryForList("SELECT * FROM t_admin_blacklist ORDER BY create_time DESC").stream().map(row -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", str(row.get("id")));
            item.put("targetType", str(row.get("target_type")));
            item.put("targetValue", str(row.get("target_value")));
            item.put("reason", str(row.get("reason")));
            item.put("creator", str(row.get("creator")));
            item.put("time", time(row.get("create_time")));
            return item;
        }).toList());
    }

    // 鏂板榛戝悕鍗?
    @PostMapping("/blacklist")
    public Result<Void> addBlacklist(@RequestBody Map<String, String> body) {
        jdbcTemplate.update("INSERT INTO t_admin_blacklist(target_type,target_value,reason,creator) VALUES(?,?,?,?)",
                body.get("targetType"), body.get("targetValue"), body.getOrDefault("reason", ""), body.getOrDefault("creator", ""));
        return Result.ok();
    }

    // 鍒犻櫎榛戝悕鍗?
    @DeleteMapping("/blacklist/{id}")
    public Result<Void> deleteBlacklist(@PathVariable Long id) {
        jdbcTemplate.update("DELETE FROM t_admin_blacklist WHERE id = ?", id);
        return Result.ok();
    }

    // 绠＄悊绔浘鐗囧垪琛紝鏉ヨ嚜鐪熷疄涓氬姟鍥剧墖瀛楁
    @GetMapping("/images")
    public Result<List<Map<String, Object>>> images() {
        Map<String, Map<String, Object>> images = new LinkedHashMap<>();
        collectImages(images, "dynamic", "SELECT n.id, n.images, u.name uploader, u.tag uploader_tag, n.create_time FROM t_news n LEFT JOIN t_user u ON n.author_id=u.id");
        collectImages(images, "goods", "SELECT m.id, m.images, u.name uploader, u.tag uploader_tag, m.created_at create_time FROM t_market_item m LEFT JOIN t_user u ON m.seller_id=u.id");
        collectImages(images, "banner", "SELECT s.id, s.images, u.name uploader, u.tag uploader_tag, s.created_at create_time FROM t_service s LEFT JOIN t_user u ON s.seller_id=u.id");
        return Result.ok(new ArrayList<>(images.values()));
    }

    // 鏇存柊鍥剧墖鐘舵€?
    @PostMapping("/images/{id}/status")
    public Result<Void> updateImageStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        jdbcTemplate.update("INSERT INTO t_admin_image_status(image_url,status) VALUES(?,?) ON DUPLICATE KEY UPDATE status=VALUES(status)",
                id, body.getOrDefault("status", "approved"));
        return Result.ok();
    }

    // 鍒犻櫎鍥剧墖鐘舵€佽褰?
    @DeleteMapping("/images/{id}")
    public Result<Void> deleteImage(@PathVariable String id) {
        jdbcTemplate.update("DELETE FROM t_admin_image_status WHERE image_url = ?", id);
        return Result.ok();
    }

    // 绠＄悊绔櫥褰曟棩蹇?
    @GetMapping("/login-logs")
    public Result<List<Map<String, Object>>> loginLogs() {
        return Result.ok(jdbcTemplate.queryForList("SELECT * FROM t_admin_login_log ORDER BY create_time DESC LIMIT 200").stream().map(row -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", str(row.get("id")));
            item.put("userId", str(row.get("user_id")));
            item.put("username", str(row.get("username")));
            item.put("ip", str(row.get("ip")));
            item.put("device", str(row.get("device")));
            item.put("location", str(row.get("location")));
            item.put("time", time(row.get("create_time")));
            item.put("status", str(row.get("status")));
            item.put("failReason", str(row.get("fail_reason")));
            return item;
        }).toList());
    }

    // 绠＄悊绔搷浣滄棩蹇?
    @GetMapping("/operation-logs")
    public Result<List<Map<String, Object>>> operationLogs() {
        return Result.ok(operationLogList());
    }

    // 鏂板鎿嶄綔鏃ュ織
    @PostMapping("/operation-logs")
    public Result<Void> addOperationLog(@RequestBody Map<String, String> body) {
        jdbcTemplate.update("INSERT INTO t_admin_operation_log(operator,role_name,action_name,target,ip,status,details) VALUES(?,?,?,?,?,?,?)",
                body.getOrDefault("operator", ""), body.getOrDefault("role", ""), body.getOrDefault("action", ""),
                body.getOrDefault("target", ""), body.getOrDefault("ip", ""), body.getOrDefault("status", "success"),
                body.getOrDefault("details", ""));
        return Result.ok();
    }

    // 鏇存柊鎿嶄綔鏃ュ織淇濈暀绛栫暐
    @PostMapping("/operation-logs/retention")
    public Result<Map<String, Object>> operationLogRetention(@RequestBody Map<String, String> body) {
        String policy = body.getOrDefault("policy", "all");
        int deleted = 0;
        if (!"all".equals(policy)) {
            int days = Integer.parseInt(policy);
            deleted = jdbcTemplate.update("DELETE FROM t_admin_operation_log WHERE create_time < DATE_SUB(NOW(), INTERVAL ? DAY)", days);
        }
        return Result.ok(Map.of("cleanedCount", deleted, "logs", operationLogList()));
    }

    // 绯荤粺鑿滃崟閰嶇疆
    @GetMapping("/menus")
    public Result<List<Map<String, Object>>> menus() {
        return Result.ok(defaultMenus());
    }

    // 绯荤粺瑙掕壊閰嶇疆
    @GetMapping("/roles")
    public Result<List<Map<String, Object>>> roles() {
        return Result.ok(systemRoles());
    }

    // 绯荤粺鏉冮檺閰嶇疆
    @GetMapping("/permissions")
    public Result<List<Map<String, Object>>> permissions() {
        return Result.ok(defaultPermissions());
    }

    // 鏇存柊瑙掕壊閰嶇疆
    @PostMapping("/roles/{id}")
    public Result<Void> updateRole(@PathVariable String id, @RequestBody Map<String, Object> body, @RequestAttribute String userId) {
        User operator = userMapper.selectById(userId);
        if (operator == null || !ROLE_SUPER_ADMIN.equals(normalizeAdminRole(operator.getAdminRole()))) {
            return Result.fail("仅超级管理员可设置角色");
        }
        Map<String, Object> current = systemRoles().stream()
                .filter(role -> id.equals(str(role.get("id"))))
                .findFirst()
                .orElse(null);
        if (current == null) {
            return Result.fail("角色不存在");
        }
        String code = str(current.get("code"));
        String name = emptyTo(str(body.get("name")), str(current.get("name")));
        String description = emptyTo(str(body.get("description")), str(current.get("description")));
        String status = emptyTo(str(body.get("status")), str(current.get("status")));
        if (ROLE_SUPER_ADMIN.equals(code)) {
            status = "active";
        }
        jdbcTemplate.update("""
                UPDATE t_admin_role
                SET name = ?, description = ?, status = ?, menu_ids = ?, permission_codes = ?, update_time = NOW()
                WHERE id = ?
                """,
                name,
                description,
                status,
                stringifyArray(body.get("menuIds")),
                stringifyArray(body.get("permissionCodes")),
                id
        );
        return Result.ok();
    }

    private User findUserByAccount(String account) {
        List<User> users = userMapper.selectList(new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<User>()
                .eq("email", account).or().eq("name", account));
        return users.isEmpty() ? null : users.get(0);
    }

    private String normalizeAdminRole(String role) {
        if (ROLE_SUPER_ADMIN.equals(role)) return ROLE_SUPER_ADMIN;
        if (ROLE_ADMIN.equals(role)) return ROLE_ADMIN;
        if (ROLE_READONLY_ADMIN.equals(role)) return ROLE_READONLY_ADMIN;
        return ROLE_USER;
    }

    private Map<String, Object> orderItem(Map<String, Object> row) {
        String status = normalizeOrderStatus(str(row.get("status")));
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", str(row.get("id")));
        item.put("buyerName", emptyTo(str(row.get("buyer_name")), str(row.get("buyer_id"))));
        item.put("buyerTag", str(row.get("buyer_tag")));
        item.put("buyerPhone", "");
        item.put("buyerAddress", "");
        item.put("sellerName", emptyTo(str(row.get("seller_name")), str(row.get("seller_id"))));
        item.put("sellerTag", str(row.get("seller_tag")));
        item.put("sellerPhone", "");
        item.put("sellerRating", "");
        item.put("serviceName", emptyTo(str(row.get("service_title")), str(row.get("service_name"))));
        item.put("price", decimal(row.get("price")));
        item.put("paymentPrice", decimal(row.get("price")));
        item.put("scheduleTime", time(row.get("booking_date")) + " " + str(row.get("booking_time")));
        item.put("buildTime", time(row.get("create_time")));
        item.put("status", status);
        item.put("cancelReason", str(row.get("cancel_reason")));
        item.put("steps", List.of(Map.of("name", "璁㈠崟鍒涘缓", "time", time(row.get("create_time")))));
        item.put("remark", "");
        item.put("feeBreakdown", List.of(Map.of("name", "鏈嶅姟璐圭敤", "value", decimal(row.get("price")))));
        return item;
    }

    private Map<String, Object> categoryItem(Map<String, Object> row) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", str(row.get("id")));
        item.put("name", str(row.get("name")));
        item.put("type", emptyTo(str(row.get("type")), "service"));
        item.put("status", emptyTo(str(row.get("status")), "normal"));
        item.put("order", num(row.get("sort_order")));
        item.put("subCount", 0);
        return item;
    }

    private void ensureDefaultCategories() {
        try {
            Long count = jdbcTemplate.queryForObject("SELECT COUNT(1) FROM t_category", Long.class);
            if (count != null && count > 0) return;
            jdbcTemplate.update("INSERT INTO t_category(name, icon, type, status, sort_order) VALUES(?,?,?,?,?)", "鐢熸椿鏈嶅姟", "category", "service", "normal", 10);
            jdbcTemplate.update("INSERT INTO t_category(name, icon, type, status, sort_order) VALUES(?,?,?,?,?)", "闂茬疆鐗╁搧", "category", "goods", "normal", 20);
            jdbcTemplate.update("INSERT INTO t_category(name, icon, type, status, sort_order) VALUES(?,?,?,?,?)", "动态内容", "category", "dynamic", "normal", 30);
        } catch (Exception ignored) {
        }
    }

    private boolean isReadOnlyRole(String role) {
        return ROLE_READONLY_ADMIN.equals(normalizeAdminRole(role));
    }

    private boolean isAdminRoleEnabled(String role) {
        if (ROLE_USER.equals(role)) {
            return false;
        }
        try {
            String status = jdbcTemplate.queryForObject("SELECT status FROM t_admin_role WHERE code = ?", String.class, role);
            return status == null || !"disabled".equalsIgnoreCase(status);
        } catch (Exception ignored) {
            return true;
        }
    }

    private List<Map<String, Object>> commentsForNews(Long newsId) {
        return jdbcTemplate.queryForList("""
                SELECT c.*, u.tag author_tag
                FROM t_comment c
                LEFT JOIN t_user u ON c.user_id COLLATE utf8mb4_unicode_ci = u.id
                WHERE c.news_id = ?
                ORDER BY c.create_time DESC
                LIMIT 20
                """, newsId).stream().map(row -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", str(row.get("id")));
            item.put("author", str(row.get("user_name")));
            item.put("avatar", str(row.get("user_avatar")));
            item.put("authorTag", str(row.get("author_tag")));
            item.put("text", str(row.get("content")));
            item.put("time", time(row.get("create_time")));
            return item;
        }).toList();
    }

    private Map<Long, List<Map<String, Object>>> commentsForNewsBatch(List<Long> newsIds) {
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

    private void collectImages(Map<String, Map<String, Object>> target, String category, String sql) {
        for (Map<String, Object> row : jdbcTemplate.queryForList(sql)) {
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
                item.put("uploader", emptyTo(str(row.get("uploader")), "鏈煡鐢ㄦ埛"));
                item.put("uploaderTag", str(row.get("uploader_tag")));
                item.put("uploadedAt", time(row.get("create_time")));
                item.put("status", imageStatus(url));
                target.put(url, item);
            }
        }
    }

    private String imageStatus(String url) {
        try {
            return jdbcTemplate.queryForObject("SELECT status FROM t_admin_image_status WHERE image_url = ?", String.class, url);
        } catch (Exception e) {
            return "approved";
        }
    }

    private void evictNewsRelated(Long newsId) {
        if (newsId != null && newsId > 0) {
            cacheService.evictNews(newsId);
        } else {
            cacheService.evictNewsList();
        }
        cacheService.evictHomeIndex();
    }

    private void recalcNewsCommentCount(Long newsId) {
        if (newsId == null || newsId <= 0) {
            return;
        }
        jdbcTemplate.update("""
                UPDATE t_news
                SET comments_count = (
                    SELECT COUNT(1) FROM t_comment WHERE news_id = ? AND status = 'normal'
                )
                WHERE id = ?
                """, newsId, newsId);
    }

    private void recalcServiceReviewStats(Long serviceId) {
        if (serviceId == null || serviceId <= 0) {
            return;
        }
        jdbcTemplate.update("""
                UPDATE t_service
                SET reviews = (
                    SELECT COUNT(1) FROM t_service_review WHERE service_id = ? AND status = 'normal'
                ),
                rating = COALESCE((
                    SELECT AVG(rating) FROM t_service_review WHERE service_id = ? AND status = 'normal'
                ), 0)
                WHERE id = ?
                """, serviceId, serviceId, serviceId);
    }

    private Long queryLong(String sql, Object... args) {
        try {
            return jdbcTemplate.queryForObject(sql, Long.class, args);
        } catch (Exception e) {
            return null;
        }
    }

    private List<Map<String, Object>> operationLogList() {
        return jdbcTemplate.queryForList("SELECT * FROM t_admin_operation_log ORDER BY create_time DESC LIMIT 200").stream().map(row -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", str(row.get("id")));
            item.put("operator", str(row.get("operator")));
            item.put("role", str(row.get("role_name")));
            item.put("action", str(row.get("action_name")));
            item.put("target", str(row.get("target")));
            item.put("ip", str(row.get("ip")));
            item.put("time", time(row.get("create_time")));
            item.put("status", str(row.get("status")));
            item.put("details", str(row.get("details")));
            return item;
        }).toList();
    }

    private void saveLoginLog(String userId, String username, String ip, String device, String status, String failReason) {
        jdbcTemplate.update("INSERT INTO t_admin_login_log(user_id,username,ip,device,location,status,fail_reason) VALUES(?,?,?,?,?,?,?)",
                userId, username, ip, device == null ? "" : device, "鏈湴缃戠粶", status, failReason);
    }

    private List<Map<String, Object>> defaultMenus() {
        return List.of(
                menu("dir-users", null, MENU_GROUP_USER, "", "admin_panel_settings", 10, "directory", null),
                menu("menu-users", "dir-users", "用户管理", "/admin/users", "group", 11, "menu", "user:view"),
                menu("menu-blacklist", "dir-users", "风控黑名单", "/admin/blacklist", "gavel", 12, "menu", "blacklist:edit"),
                menu("dir-content", null, MENU_GROUP_CONTENT, "", "forum", 20, "directory", null),
                menu("menu-posts", "dir-content", "动态管理", "/admin/posts", "explore", 21, "menu", "posts:audit"),
                menu("menu-comments", "dir-content", "评论管理", "/admin/comments", "chat_bubble", 22, "menu", "comments:view"),
                menu("menu-images", "dir-content", "图片管理", "/admin/images", "photo_library", 23, "menu", "images:audit"),
                menu("menu-messages", "dir-content", "消息管理", "/admin/messages", "mail", 24, "menu", "messages:view"),
                menu("dir-services", null, MENU_GROUP_SERVICE, "", "storefront", 30, "directory", null),
                menu("menu-market", "dir-services", "闲置商品管理", "/admin/market", "shopping_bag", 31, "menu", "goods:view"),
                menu("menu-services", "dir-services", "生活服务管理", "/admin/services", "home_repair_service", 32, "menu", "services:view"),
                menu("menu-orders", "dir-services", "订单管理", "/admin/orders", "receipt_long", 33, "menu", "orders:view"),
                menu("dir-system", null, MENU_GROUP_SYSTEM, "", "settings_suggest", 40, "directory", null),
                menu("menu-notifications", "dir-system", "通知管理", "/admin/notifications", "campaign", 41, "menu", "notifications:view"),
                menu("menu-categories", "dir-system", "分类管理", "/admin/categories", "category", 42, "menu", "categories:view"),
                menu("menu-menus", "dir-system", "菜单配置", "/admin/menus", "table_rows", 43, "menu", "menus:view"),
                menu("menu-roles", "dir-system", "角色权限", "/admin/roles", "shield", 44, "menu", "roles:view"),
                menu("menu-permissions", "dir-system", "权限清单", "/admin/permissions", "lock", 45, "menu", "permissions:view"),
                menu("dir-logs", null, MENU_GROUP_SECURITY, "", "security", 50, "directory", null),
                menu("menu-login-logs", "dir-logs", "登录日志", "/admin/login-logs", "fingerprint", 51, "menu", "logs:login"),
                menu("menu-op-logs", "dir-logs", "操作日志", "/admin/op-logs", "receipt_long", 52, "menu", "logs:operation")
        );
    }

    private List<Map<String, Object>> defaultPermissions() {
        return List.of(
                permission("perm-user-view", "用户列表查看", "user:view", MENU_GROUP_USER),
                permission("perm-user-ban", "用户封禁与启用", "user:ban", MENU_GROUP_USER),
                permission("perm-user-verify", "用户认证管理", "user:verify", MENU_GROUP_USER),
                permission("perm-user-role", "用户角色分配", "user:role", MENU_GROUP_USER),
                permission("perm-blacklist", "黑名单维护", "blacklist:edit", MENU_GROUP_USER),
                permission("perm-blacklist-view", "黑名单查看", "blacklist:view", MENU_GROUP_USER),
                permission("perm-posts-view", "动态列表查看", "posts:view", MENU_GROUP_CONTENT),
                permission("perm-posts", "动态审核", "posts:audit", MENU_GROUP_CONTENT),
                permission("perm-comments-view", "评论列表查看", "comments:view", MENU_GROUP_CONTENT),
                permission("perm-comments", "评论治理", "comments:manage", MENU_GROUP_CONTENT),
                permission("perm-images", "图片审核", "images:audit", MENU_GROUP_CONTENT),
                permission("perm-images-view", "图片列表查看", "images:view", MENU_GROUP_CONTENT),
                permission("perm-goods-view", "商品列表查看", "goods:view", MENU_GROUP_SERVICE),
                permission("perm-goods", "商品审核", "goods:audit", MENU_GROUP_SERVICE),
                permission("perm-services-view", "服务列表查看", "services:view", MENU_GROUP_SERVICE),
                permission("perm-services", "服务管理", "services:manage", MENU_GROUP_SERVICE),
                permission("perm-orders-view", "订单列表查看", "orders:view", MENU_GROUP_SERVICE),
                permission("perm-orders", "订单强制取消", "orders:cancel", MENU_GROUP_SERVICE),
                permission("perm-notice-view", "通知查看", "notifications:view", MENU_GROUP_SYSTEM),
                permission("perm-notice", "通知发布", "notifications:create", MENU_GROUP_SYSTEM),
                permission("perm-category-view", "分类查看", "categories:view", MENU_GROUP_SYSTEM),
                permission("perm-category", "分类维护", "categories:edit", MENU_GROUP_SYSTEM),
                permission("perm-menu-view", "菜单查看", "menus:view", MENU_GROUP_SYSTEM),
                permission("perm-role-view", "角色查看", "roles:view", MENU_GROUP_SYSTEM),
                permission("perm-role-manage", "角色配置", "roles:manage", MENU_GROUP_SYSTEM),
                permission("perm-permission-view", "权限查看", "permissions:view", MENU_GROUP_SYSTEM),
                permission("perm-message-view", "消息查看", "messages:view", MENU_GROUP_SYSTEM),
                permission("perm-message-manage", "消息管理", "messages:manage", MENU_GROUP_SYSTEM),
                permission("perm-login-log", "登录日志查看", "logs:login", MENU_GROUP_SECURITY),
                permission("perm-op-log", "操作日志查看", "logs:operation", MENU_GROUP_SECURITY),
                permission("perm-logs", "日志留存策略", "logs:retention", MENU_GROUP_SYSTEM)
        );
    }

    private List<Map<String, Object>> systemRoles() {
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
                new RoleSeed("role-super", "超级管理员", ROLE_SUPER_ADMIN, "拥有管理端全部页面与全部操作权限", allMenuIds(), allPermissionCodes(), "active"),
                new RoleSeed("role-admin", "管理员", ROLE_ADMIN, "可访问全部管理页面，负责日常审核与运营操作", adminMenuIds(), adminPermissionCodes(), "active"),
                new RoleSeed("role-readonly", "只读管理员", ROLE_READONLY_ADMIN, "可访问全部管理页面，但不可执行写操作", readonlyMenuIds(), readonlyPermissionCodes(), "active"),
                new RoleSeed("role-user", "普通用户", ROLE_USER, "前台普通账号，不具备管理端权限", List.of(), List.of(), "active")
        );
    }

    private void upsertSystemRole(RoleSeed seed) {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(1) FROM t_admin_role WHERE code = ?", Long.class, seed.code());
        if (count != null && count > 0) {
            jdbcTemplate.update("""
                    UPDATE t_admin_role
                    SET name = ?,
                        description = ?,
                        status = COALESCE(NULLIF(status, ''), ?),
                        menu_ids = CASE WHEN menu_ids IS NULL OR menu_ids = '' THEN ? ELSE menu_ids END,
                        permission_codes = CASE WHEN permission_codes IS NULL OR permission_codes = '' THEN ? ELSE permission_codes END,
                        update_time = NOW()
                    WHERE code = ?
                    """,
                    seed.name(),
                    seed.description(),
                    seed.status(),
                    stringifyArray(seed.menuIds()),
                    stringifyArray(seed.permissionCodes()),
                    seed.code());
            return;
        }
        jdbcTemplate.update("""
                INSERT INTO t_admin_role(id, name, code, description, status, menu_ids, permission_codes)
                VALUES(?,?,?,?,?,?,?)
                """,
                seed.id(),
                seed.name(),
                seed.code(),
                seed.description(),
                seed.status(),
                stringifyArray(seed.menuIds()),
                stringifyArray(seed.permissionCodes()));
    }

    private long countAdminMembers(String code) {
        Long value = jdbcTemplate.queryForObject("SELECT COUNT(1) FROM t_user WHERE admin_role = ?", Long.class, code);
        return value == null ? 0 : value;
    }

    private List<String> roleMenuIds(String roleCode) {
        if (ROLE_USER.equals(roleCode)) return List.of();
        try {
            List<String> ids = parseStringArray(jdbcTemplate.queryForObject("SELECT menu_ids FROM t_admin_role WHERE code = ?", String.class, roleCode));
            return ids.isEmpty() ? defaultMenuIdsFor(roleCode) : ids;
        } catch (Exception ignored) {
            return defaultMenuIdsFor(roleCode);
        }
    }

    private List<String> rolePermissionCodes(String roleCode) {
        if (ROLE_USER.equals(roleCode)) return List.of();
        try {
            List<String> codes = parseStringArray(jdbcTemplate.queryForObject("SELECT permission_codes FROM t_admin_role WHERE code = ?", String.class, roleCode));
            return codes.isEmpty() ? defaultPermissionCodesFor(roleCode) : codes;
        } catch (Exception ignored) {
            return defaultPermissionCodesFor(roleCode);
        }
    }

    private List<String> defaultMenuIdsFor(String roleCode) {
        return switch (roleCode) {
            case ROLE_SUPER_ADMIN -> allMenuIds();
            case ROLE_ADMIN -> adminMenuIds();
            case ROLE_READONLY_ADMIN -> readonlyMenuIds();
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

    private List<String> adminMenuIds() {
        return allMenuIds();
    }

    private List<String> readonlyMenuIds() {
        return allMenuIds();
    }

    private List<String> allPermissionCodes() {
        return defaultPermissions().stream().map(item -> str(item.get("code"))).toList();
    }

    private List<String> adminPermissionCodes() {
        return allPermissionCodes().stream()
                .filter(code -> !Set.of("user:role", "roles:manage", "logs:retention").contains(code))
                .toList();
    }

    private List<String> readonlyPermissionCodes() {
        return List.of(
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
        if (raw == null || raw.isBlank() || "[]".equals(raw.trim())) return List.of();
        return Arrays.stream(raw.replace("[", "").replace("]", "").replace("\"", "").split(","))
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .toList();
    }

    private String stringifyArray(Object value) {
        if (value instanceof Collection<?> collection) {
            return collection.stream()
                    .map(this::str)
                    .map(item -> "\"" + item + "\"")
                    .collect(java.util.stream.Collectors.joining(",", "[", "]"));
        }
        return "[]";
    }

    private void executeQuietly(String sql) {
        try {
            jdbcTemplate.execute(sql);
        } catch (Exception ignored) {
        }
    }

    private long count(String table) {
        Long value = jdbcTemplate.queryForObject("SELECT COUNT(1) FROM " + table, Long.class);
        return value == null ? 0 : value;
    }

    private long countWhere(String table, String where) {
        Long value = jdbcTemplate.queryForObject("SELECT COUNT(1) FROM " + table + " WHERE " + where, Long.class);
        return value == null ? 0 : value;
    }

    private String requestIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null || forwarded.isBlank() ? request.getRemoteAddr() : forwarded.split(",")[0].trim();
    }

    private String str(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private String emptyTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private int num(Object value) {
        if (value instanceof Number number) return number.intValue();
        try {
            return Integer.parseInt(str(value));
        } catch (Exception e) {
            return 0;
        }
    }

    private long longVal(Object value) {
        if (value instanceof Number number) return number.longValue();
        try {
            return Long.parseLong(str(value));
        } catch (Exception e) {
            return 0L;
        }
    }

    private BigDecimal decimal(Object value) {
        if (value instanceof BigDecimal decimal) return decimal;
        try {
            return new BigDecimal(str(value));
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private boolean bool(Object value) {
        if (value instanceof Boolean b) return b;
        if (value instanceof Number n) return n.intValue() != 0;
        return Boolean.parseBoolean(str(value));
    }

    private String time(Object value) {
        if (value == null) return "";
        if (value instanceof LocalDateTime ldt) return ldt.format(FORMATTER);
        return str(value).replace("T", " ");
    }

    private String now() {
        return LocalDateTime.now().format(FORMATTER);
    }

    private String firstText(String content) {
        if (content == null || content.isBlank()) return "未命名动态";
        return content.length() > 24 ? content.substring(0, 24) + "..." : content;
    }

    private String normalizeDynamicCategory(String category) {
        if (category == null) return "life";
        if (category.contains("姹傚姪")) return "help";
        if (category.contains("娲诲姩")) return "activity";
        if (category.contains("缇庨")) return "food";
        return "life";
    }

    private String normalizeGoodsCategory(String category) {
        if (category == null) return "other";
        String lower = category.toLowerCase(Locale.ROOT);
        if (lower.contains("elect") || category.contains("鏁扮爜")) return "electronics";
        if (category.contains("瀹跺叿")) return "furniture";
        if (lower.contains("cloth")) return "clothing";
        if (lower.contains("book")) return "books";
        return "other";
    }

    private String normalizeOrderStatus(String status) {
        return switch (status) {
            case "pending" -> "pending_payment";
            case "confirmed", "in_progress" -> "pending_execution";
            case "completed" -> "completed";
            case "cancelled", "canceled" -> "canceled";
            default -> "abnormal";
        };
    }

    private List<String> parseImages(Object value) {
        String raw = str(value).trim();
        if (raw.isEmpty() || "[]".equals(raw)) return List.of();
        raw = raw.replace("[", "").replace("]", "").replace("\"", "");
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
    }
}
