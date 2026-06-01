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
    private static final String ROLE_READONLY_ADMIN = "READONLY_ADMIN";
    private static final String ROLE_SUPER_ADMIN = "SUPER_ADMIN";
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final JdbcTemplate jdbcTemplate;
    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, Object> redisTemplate;
    private final CacheService cacheService;

    @PostConstruct
    public void ensureAdminSchema() {
        executeQuietly("ALTER TABLE t_user ADD COLUMN phone VARCHAR(32) DEFAULT ''");
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
    }

    // 管理端登录，使用真实用户表账号签发 JWT
    @PostMapping("/login")
    public Result<Map<String, String>> login(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String account = body.getOrDefault("username", "").trim();
        String password = body.getOrDefault("password", "");
        User user = findUserByAccount(account);
        if (user == null || !Objects.equals(user.getPassword(), password)) {
            saveLoginLog("", account, requestIp(request), request.getHeader("User-Agent"), "failed", "账号或密码错误");
            return Result.fail("账号或密码错误");
        }
        String adminRole = normalizeAdminRole(user.getAdminRole());
        if (ROLE_USER.equals(adminRole)) {
            saveLoginLog(user.getId(), user.getName(), requestIp(request), request.getHeader("User-Agent"), "failed", "普通用户不能访问管理端");
            return Result.fail("普通用户不能访问管理端");
        }
        String token = jwtUtil.generateToken(user.getId());
        redisTemplate.opsForValue().set(TOKEN_PREFIX + user.getId(), token, jwtUtil.getExpiration(), TimeUnit.MILLISECONDS);
        saveLoginLog(user.getId(), user.getName(), requestIp(request), request.getHeader("User-Agent"), "success", "");
        return Result.ok(Map.of(
                "token", token,
                "username", user.getName(),
                "adminRole", adminRole,
                "readonly", String.valueOf(isReadOnlyRole(adminRole))
        ));
    }

    // 获取当前管理员信息
    @GetMapping("/me")
    public Result<Map<String, String>> me(@RequestAttribute String userId) {
        User user = userMapper.selectById(userId);
        String adminRole = normalizeAdminRole(user == null ? "" : user.getAdminRole());
        if (ROLE_USER.equals(adminRole)) {
            return Result.fail("普通用户不能访问管理端");
        }
        return Result.ok(Map.of(
                "username", user == null ? "admin" : user.getName(),
                "adminRole", adminRole,
                "readonly", String.valueOf(isReadOnlyRole(adminRole))
        ));
    }

    // 管理端首页统计
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

    // 管理端用户列表
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

    // 更新用户状态
    @PostMapping("/users/{id}/status")
    public Result<Void> updateUserStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        jdbcTemplate.update("UPDATE t_user SET status = ? WHERE id = ?", body.getOrDefault("status", "normal"), id);
        return Result.ok();
    }

    // 更新用户认证状态
    @PostMapping("/users/{id}/verified")
    public Result<Void> updateUserVerified(@PathVariable String id, @RequestBody Map<String, String> body) {
        boolean verified = "verified".equals(body.get("verified"));
        jdbcTemplate.update("UPDATE t_user SET is_verified = ? WHERE id = ?", verified ? 1 : 0, id);
        return Result.ok();
    }

    // 更新用户管理角色（仅超级管理员）
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
                return Result.fail("至少保留一个超级管理员");
            }
        }
        jdbcTemplate.update("UPDATE t_user SET admin_role = ? WHERE id = ?", nextRole, id);
        return Result.ok();
    }

    // 管理端动态列表
    @GetMapping("/dynamics")
    public Result<List<Map<String, Object>>> dynamics() {
        String sql = """
                SELECT n.*, u.name author_name, u.avatar author_avatar, u.is_verified author_verified
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
            item.put("author", emptyTo(str(row.get("author_name")), "未知用户"));
            item.put("authorAvatar", str(row.get("author_avatar")));
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

    // 更新动态审核状态
    @PostMapping("/dynamics/{id}/status")
    public Result<Void> updateDynamicStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        jdbcTemplate.update("UPDATE t_news SET status = ?, reject_reason = ? WHERE id = ?",
                body.getOrDefault("status", "normal"), body.getOrDefault("rejectReason", ""), id);
        evictNewsRelated(id);
        return Result.ok();
    }

    // 管理端追加动态评论
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

    // 管理端删除动态评论
    @DeleteMapping("/dynamics/{id}/comments/{commentId}")
    public Result<Void> deleteDynamicComment(@PathVariable Long id, @PathVariable Long commentId) {
        int deleted = jdbcTemplate.update("DELETE FROM t_comment WHERE id = ? AND news_id = ?", commentId, id);
        if (deleted > 0) {
            recalcNewsCommentCount(id);
            evictNewsRelated(id);
        }
        return Result.ok();
    }

    // 管理端商品列表
    @GetMapping("/goods")
    public Result<List<Map<String, Object>>> goods() {
        String sql = """
                SELECT m.*, u.name seller_name, u.avatar seller_avatar, u.rating seller_rating
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
            item.put("sellerName", emptyTo(str(row.get("seller_name")), "未知用户"));
            item.put("sellerId", str(row.get("seller_id")));
            item.put("sellerAvatar", str(row.get("seller_avatar")));
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

    // 更新商品审核状态
    @PostMapping("/goods/{id}/status")
    public Result<Void> updateGoodsStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        jdbcTemplate.update("UPDATE t_market_item SET status = ?, reject_reason = ? WHERE id = ?",
                body.getOrDefault("status", "active"), body.getOrDefault("rejectReason", ""), id);
        cacheService.evictMarketItem(id);
        cacheService.evictMarketList();
        cacheService.evictHomeIndex();
        return Result.ok();
    }

    // 管理端服务列表
    @GetMapping("/services")
    public Result<List<Map<String, Object>>> services() {
        String sql = """
                SELECT s.*, u.name provider_name, u.avatar provider_avatar, u.is_verified provider_verified
                FROM t_service s LEFT JOIN t_user u ON s.seller_id = u.id
                ORDER BY s.created_at DESC
                """;
        return Result.ok(jdbcTemplate.queryForList(sql).stream().map(row -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", str(row.get("id")));
            item.put("title", str(row.get("title")));
            item.put("category", str(row.get("category")));
            item.put("providerName", emptyTo(str(row.get("provider_name")), "未知商家"));
            item.put("providerAvatar", str(row.get("provider_avatar")));
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

    // 新增服务
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

    // 更新服务审核状态
    @PostMapping("/services/{id}/status")
    public Result<Void> updateServiceStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        jdbcTemplate.update("UPDATE t_service SET status = ?, reject_reason = ? WHERE id = ?",
                body.getOrDefault("status", "active"), body.getOrDefault("rejectReason", ""), id);
        cacheService.evictService(id);
        cacheService.evictHomeIndex();
        return Result.ok();
    }

    // 管理端订单列表
    // 管理端订单列表
    @GetMapping("/orders")
    public Result<List<Map<String, Object>>> orders() {
        try {
            String sql = """
                    SELECT o.*, bu.name buyer_name, su.name seller_name, s.title service_name
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

    // 强制取消订单
    @PostMapping("/orders/{id}/cancel")
    public Result<Void> cancelOrder(@PathVariable Long id, @RequestBody Map<String, String> body) {
        jdbcTemplate.update("UPDATE t_order SET status = 'cancelled', cancel_reason = ?, update_time = NOW() WHERE id = ?",
                body.getOrDefault("reason", "管理者强制取消"), id);
        return Result.ok();
    }

    @GetMapping("/categories")
    public Result<List<Map<String, Object>>> categories() {
        ensureDefaultCategories();
        String sql = "SELECT * FROM t_category ORDER BY sort_order ASC, id ASC";
        return Result.ok(jdbcTemplate.queryForList(sql).stream().map(this::categoryItem).toList());
    }

    // 新增分类
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

    // 管理端通知列表
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

    // 新增通知
    @PostMapping("/notifications")
    public Result<Void> addNotification(@RequestBody Map<String, Object> body) {
        String target = str(body.get("target"));
        List<String> userIds = "all".equals(target)
                ? jdbcTemplate.queryForList("SELECT id FROM t_user", String.class)
                : jdbcTemplate.queryForList("SELECT id FROM t_user ORDER BY created_at DESC LIMIT 1", String.class);
        for (String userId : userIds) {
            jdbcTemplate.update("INSERT INTO t_notification(id,user_id,title,content,service_name,time,is_read,is_processed) VALUES(?,?,?,?,?,NOW(),0,0)",
                    System.currentTimeMillis() + Math.abs(Objects.hash(userId, body.get("title"))), userId,
                    str(body.get("title")), str(body.get("content")), "平台公告");
        }
        return Result.ok();
    }

    // 切换通知已读
    @PostMapping("/notifications/{id}/toggle")
    public Result<Void> toggleNotification(@PathVariable Long id) {
        jdbcTemplate.update("UPDATE t_notification SET is_read = IF(is_read=1,0,1) WHERE id = ?", id);
        return Result.ok();
    }
    // 管理端消息列表
    @GetMapping("/messages")
    public Result<List<Map<String, Object>>> messages() {
        String sql = """
                SELECT m.*, 
                       su.name sender_name, su.avatar sender_avatar,
                       ru.name receiver_name, ru.avatar receiver_avatar
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
            item.put("receiverId", str(row.get("receiver_id")));
            item.put("receiverName", emptyTo(str(row.get("receiver_name")), str(row.get("receiver_id"))));
            item.put("receiverAvatar", str(row.get("receiver_avatar")));
            item.put("content", str(row.get("content")));
            item.put("messageType", emptyTo(str(row.get("message_type")), "text"));
            item.put("mediaUrl", str(row.get("media_url")));
            item.put("isRead", bool(row.get("is_read")));
            item.put("createTime", time(row.get("create_time")));
            return item;
        }).toList());
    }

    // 标记消息已读
    @PostMapping("/messages/{id}/read")
    public Result<Void> markMessageRead(@PathVariable Long id) {
        jdbcTemplate.update("UPDATE t_message SET is_read = 1 WHERE id = ?", id);
        return Result.ok();
    }

    // 删除消息
    @DeleteMapping("/messages/{id}")
    public Result<Void> deleteMessage(@PathVariable Long id) {
        jdbcTemplate.update("DELETE FROM t_message WHERE id = ?", id);
        return Result.ok();
    }


    // 管理端评论列表
    @GetMapping("/comments")
    public Result<List<Map<String, Object>>> managedComments() {
        String sql = """
                SELECT c.*, n.title target_title
                FROM t_comment c LEFT JOIN t_news n ON c.news_id = n.id
                ORDER BY c.create_time DESC
                """;
        List<Map<String, Object>> comments = new ArrayList<>(jdbcTemplate.queryForList(sql).stream().map(row -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", str(row.get("id")));
            item.put("targetType", "dynamic");
            item.put("targetId", str(row.get("news_id")));
            item.put("targetTitle", emptyTo(str(row.get("target_title")), "动态评论"));
            item.put("authorName", str(row.get("user_name")));
            item.put("authorAvatar", str(row.get("user_avatar")));
            item.put("content", str(row.get("content")));
            item.put("time", time(row.get("create_time")));
            item.put("status", emptyTo(str(row.get("status")), "normal"));
            return item;
        }).toList());
        try {
            String reviewSql = """
                    SELECT r.*, s.title target_title
                    FROM t_service_review r LEFT JOIN t_service s ON r.service_id = s.id
                    ORDER BY r.create_time DESC
                    """;
            comments.addAll(jdbcTemplate.queryForList(reviewSql).stream().map(row -> {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", "service-" + str(row.get("id")));
                item.put("targetType", "service");
                item.put("targetId", str(row.get("service_id")));
                item.put("targetTitle", emptyTo(str(row.get("target_title")), "服务评价"));
                item.put("authorName", str(row.get("user_name")));
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

    // 更新评论状态
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

    // 删除评论
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

    // 管理端黑名单列表
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

    // 新增黑名单
    @PostMapping("/blacklist")
    public Result<Void> addBlacklist(@RequestBody Map<String, String> body) {
        jdbcTemplate.update("INSERT INTO t_admin_blacklist(target_type,target_value,reason,creator) VALUES(?,?,?,?)",
                body.get("targetType"), body.get("targetValue"), body.getOrDefault("reason", ""), body.getOrDefault("creator", ""));
        return Result.ok();
    }

    // 删除黑名单
    @DeleteMapping("/blacklist/{id}")
    public Result<Void> deleteBlacklist(@PathVariable Long id) {
        jdbcTemplate.update("DELETE FROM t_admin_blacklist WHERE id = ?", id);
        return Result.ok();
    }

    // 管理端图片列表，来自真实业务图片字段
    @GetMapping("/images")
    public Result<List<Map<String, Object>>> images() {
        Map<String, Map<String, Object>> images = new LinkedHashMap<>();
        collectImages(images, "dynamic", "SELECT n.id, n.images, u.name uploader, n.create_time FROM t_news n LEFT JOIN t_user u ON n.author_id=u.id");
        collectImages(images, "goods", "SELECT m.id, m.images, u.name uploader, m.created_at create_time FROM t_market_item m LEFT JOIN t_user u ON m.seller_id=u.id");
        collectImages(images, "banner", "SELECT s.id, s.images, u.name uploader, s.created_at create_time FROM t_service s LEFT JOIN t_user u ON s.seller_id=u.id");
        return Result.ok(new ArrayList<>(images.values()));
    }

    // 更新图片状态
    @PostMapping("/images/{id}/status")
    public Result<Void> updateImageStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        jdbcTemplate.update("INSERT INTO t_admin_image_status(image_url,status) VALUES(?,?) ON DUPLICATE KEY UPDATE status=VALUES(status)",
                id, body.getOrDefault("status", "approved"));
        return Result.ok();
    }

    // 删除图片状态记录
    @DeleteMapping("/images/{id}")
    public Result<Void> deleteImage(@PathVariable String id) {
        jdbcTemplate.update("DELETE FROM t_admin_image_status WHERE image_url = ?", id);
        return Result.ok();
    }

    // 管理端登录日志
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

    // 管理端操作日志
    @GetMapping("/operation-logs")
    public Result<List<Map<String, Object>>> operationLogs() {
        return Result.ok(operationLogList());
    }

    // 新增操作日志
    @PostMapping("/operation-logs")
    public Result<Void> addOperationLog(@RequestBody Map<String, String> body) {
        jdbcTemplate.update("INSERT INTO t_admin_operation_log(operator,role_name,action_name,target,ip,status,details) VALUES(?,?,?,?,?,?,?)",
                body.getOrDefault("operator", ""), body.getOrDefault("role", ""), body.getOrDefault("action", ""),
                body.getOrDefault("target", ""), body.getOrDefault("ip", ""), body.getOrDefault("status", "success"),
                body.getOrDefault("details", ""));
        return Result.ok();
    }

    // 更新操作日志保留策略
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

    // 系统菜单配置
    @GetMapping("/menus")
    public Result<List<Map<String, Object>>> menus() {
        return Result.ok(defaultMenus());
    }

    // 系统角色配置
    @GetMapping("/roles")
    public Result<List<Map<String, Object>>> roles() {
        return Result.ok(defaultRoles());
    }

    // 系统权限配置
    @GetMapping("/permissions")
    public Result<List<Map<String, Object>>> permissions() {
        return Result.ok(defaultPermissions());
    }

    private User findUserByAccount(String account) {
        List<User> users = userMapper.selectList(new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<User>()
                .eq("email", account).or().eq("name", account));
        return users.isEmpty() ? null : users.get(0);
    }

    private String normalizeAdminRole(String role) {
        if (ROLE_SUPER_ADMIN.equals(role)) return ROLE_SUPER_ADMIN;
        if (ROLE_READONLY_ADMIN.equals(role)) return ROLE_READONLY_ADMIN;
        return ROLE_USER;
    }

    private Map<String, Object> orderItem(Map<String, Object> row) {
        String status = normalizeOrderStatus(str(row.get("status")));
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", str(row.get("id")));
        item.put("buyerName", emptyTo(str(row.get("buyer_name")), str(row.get("buyer_id"))));
        item.put("buyerPhone", "");
        item.put("buyerAddress", "");
        item.put("sellerName", emptyTo(str(row.get("seller_name")), str(row.get("seller_id"))));
        item.put("sellerPhone", "");
        item.put("sellerRating", "");
        item.put("serviceName", emptyTo(str(row.get("service_title")), str(row.get("service_name"))));
        item.put("price", decimal(row.get("price")));
        item.put("paymentPrice", decimal(row.get("price")));
        item.put("scheduleTime", time(row.get("booking_date")) + " " + str(row.get("booking_time")));
        item.put("buildTime", time(row.get("create_time")));
        item.put("status", status);
        item.put("cancelReason", str(row.get("cancel_reason")));
        item.put("steps", List.of(Map.of("name", "订单创建", "time", time(row.get("create_time")))));
        item.put("remark", "");
        item.put("feeBreakdown", List.of(Map.of("name", "服务费用", "value", decimal(row.get("price")))));
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
            jdbcTemplate.update("INSERT INTO t_category(name, icon, type, status, sort_order) VALUES(?,?,?,?,?)", "生活服务", "category", "service", "normal", 10);
            jdbcTemplate.update("INSERT INTO t_category(name, icon, type, status, sort_order) VALUES(?,?,?,?,?)", "闲置物品", "category", "goods", "normal", 20);
            jdbcTemplate.update("INSERT INTO t_category(name, icon, type, status, sort_order) VALUES(?,?,?,?,?)", "动态内容", "category", "dynamic", "normal", 30);
        } catch (Exception ignored) {
        }
    }

    private boolean isReadOnlyRole(String role) {
        return ROLE_READONLY_ADMIN.equals(normalizeAdminRole(role));
    }

    private List<Map<String, Object>> commentsForNews(Long newsId) {
        return jdbcTemplate.queryForList("SELECT * FROM t_comment WHERE news_id = ? ORDER BY create_time DESC LIMIT 20", newsId).stream().map(row -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", str(row.get("id")));
            item.put("author", str(row.get("user_name")));
            item.put("avatar", str(row.get("user_avatar")));
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
                SELECT *
                FROM t_comment
                WHERE news_id IN (%s)
                ORDER BY news_id ASC, create_time DESC
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
                item.put("uploader", emptyTo(str(row.get("uploader")), "未知用户"));
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
                userId, username, ip, device == null ? "" : device, "本地网络", status, failReason);
    }

    private List<Map<String, Object>> defaultMenus() {
        return List.of(
                menu("dir-users", null, "用户风控", "", "admin_panel_settings", 10, "directory", null),
                menu("menu-users", "dir-users", "用户管理", "/admin/users", "group", 11, "menu", "user:view"),
                menu("menu-blacklist", "dir-users", "风控黑名单", "/admin/blacklist", "gavel", 12, "menu", "blacklist:edit"),
                menu("dir-content", null, "内容运营", "", "forum", 20, "directory", null),
                menu("menu-posts", "dir-content", "动态管理", "/admin/posts", "explore", 21, "menu", "posts:audit"),
                menu("menu-comments", "dir-content", "评论管理", "/admin/comments", "chat_bubble", 22, "menu", "comments:delete"),
                menu("menu-images", "dir-content", "图片管理", "/admin/images", "photo_library", 23, "menu", "images:audit"),
                menu("dir-services", null, "生活服务", "", "storefront", 30, "directory", null),
                menu("menu-market", "dir-services", "闲置商品管理", "/admin/market", "shopping_bag", 31, "menu", "goods:audit"),
                menu("menu-services", "dir-services", "服务管理", "/admin/services", "home_repair_service", 32, "menu", "services:create"),
                menu("menu-orders", "dir-services", "订单管理", "/admin/orders", "receipt_long", 33, "menu", "orders:cancel"),
                menu("dir-system", null, "系统设置", "", "settings_suggest", 40, "directory", null),
                menu("menu-notifications", "dir-system", "通知管理", "/admin/notifications", "campaign", 41, "menu", "notifications:create"),
                menu("menu-categories", "dir-system", "分类管理", "/admin/categories", "category", 42, "menu", "categories:edit"),
                menu("dir-logs", null, "系统安全", "", "security", 50, "directory", null),
                menu("menu-login-logs", "dir-logs", "登录日志", "/admin/login-logs", "fingerprint", 51, "menu", "logs:login"),
                menu("menu-op-logs", "dir-logs", "操作日志", "/admin/op-logs", "receipt_long", 52, "menu", "logs:operation")
        );
    }

    private List<Map<String, Object>> defaultRoles() {
        List<String> menuIds = defaultMenus().stream().map(m -> str(m.get("id"))).toList();
        List<String> permissionCodes = defaultPermissions().stream().map(p -> str(p.get("code"))).toList();
        return List.of(role("role-super", "超级管理员", "ROLE_SUPER_ADMIN", "拥有管理端全部菜单和操作权限", menuIds, permissionCodes));
    }

    private List<Map<String, Object>> defaultPermissions() {
        return List.of(
                permission("perm-user-view", "用户列表查看", "user:view", "用户风控"),
                permission("perm-user-ban", "用户封禁解封", "user:ban", "用户风控"),
                permission("perm-user-verify", "用户认证管理", "user:verify", "用户风控"),
                permission("perm-blacklist", "黑名单维护", "blacklist:edit", "用户风控"),
                permission("perm-posts", "动态审核", "posts:audit", "内容运营"),
                permission("perm-comments", "评论治理", "comments:delete", "内容运营"),
                permission("perm-images", "图片审核", "images:audit", "内容运营"),
                permission("perm-goods", "商品审核", "goods:audit", "生活服务"),
                permission("perm-services", "服务管理", "services:create", "生活服务"),
                permission("perm-orders", "订单强制取消", "orders:cancel", "生活服务"),
                permission("perm-notice", "通知发布", "notifications:create", "系统设置"),
                permission("perm-category", "分类维护", "categories:edit", "系统设置"),
                permission("perm-logs", "日志留存策略", "logs:retention", "系统设置")
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

    private Map<String, Object> role(String id, String name, String code, String description, List<String> menuIds, List<String> permissionCodes) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("id", id);
        r.put("name", name);
        r.put("code", code);
        r.put("description", description);
        r.put("status", "active");
        r.put("createTime", now());
        r.put("memberCount", 1);
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
        if (category.contains("求助")) return "help";
        if (category.contains("活动")) return "activity";
        if (category.contains("美食")) return "food";
        return "life";
    }

    private String normalizeGoodsCategory(String category) {
        if (category == null) return "other";
        String lower = category.toLowerCase(Locale.ROOT);
        if (lower.contains("elect") || category.contains("数码")) return "electronics";
        if (category.contains("家具")) return "furniture";
        if (category.contains("服")) return "clothing";
        if (category.contains("书")) return "books";
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
