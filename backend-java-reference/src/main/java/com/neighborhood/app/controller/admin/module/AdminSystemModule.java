package com.neighborhood.app.controller.admin.module;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.neighborhood.app.common.Result;
import com.neighborhood.app.controller.admin.AdminSupport;
import com.neighborhood.app.dto.admin.AdminSystemRequests.CategoryCreateRequest;
import com.neighborhood.app.dto.admin.AdminSystemRequests.NotificationCreateRequest;
import com.neighborhood.app.dto.admin.AdminSystemRequests.RoleUpdateRequest;
import com.neighborhood.app.entity.admin.AdminRole;
import com.neighborhood.app.entity.system.Category;
import com.neighborhood.app.entity.service.Notification;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.mapper.admin.AdminRoleMapper;
import com.neighborhood.app.mapper.system.CategoryMapper;
import com.neighborhood.app.mapper.user.UserMapper;
import com.neighborhood.app.service.CategoryService;
import com.neighborhood.app.service.MessageService;
import com.neighborhood.app.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class AdminSystemModule {

    private static final String PLATFORM_NOTICE = "平台公告";

    private final AdminSupport support;
    private final UserMapper userMapper;
    private final CategoryMapper categoryMapper;
    private final AdminRoleMapper adminRoleMapper;
    private final CategoryService categoryService;
    private final NotificationService notificationService;
    private final MessageService messageService;

    public Result<List<Map<String, Object>>> categories() {
        support.ensureDefaultCategories();
        return Result.ok(support.mapQueryList(
                "SELECT * FROM t_category ORDER BY sort_order ASC, id ASC",
                support::categoryItem
        ));
    }

    public Result<Void> addCategory(CategoryCreateRequest body) {
        support.ensureDefaultCategories();
        String type = body == null ? "service" : support.emptyTo(body.type(), "service");
        Category lastCategory = categoryMapper.selectOne(new LambdaQueryWrapper<Category>()
                .eq(Category::getType, type)
                .orderByDesc(Category::getSortOrder)
                .last("LIMIT 1"));
        Category category = new Category();
        category.setName(body == null ? "" : support.empty(body.name()));
        category.setIcon("category");
        category.setType(type);
        category.setStatus("normal");
        category.setSortOrder(lastCategory == null || lastCategory.getSortOrder() == null ? 1 : lastCategory.getSortOrder() + 1);
        categoryService.save(category);
        return Result.ok();
    }

    public Result<Void> toggleCategory(Long id) {
        Category category = categoryService.getById(id);
        if (category == null) {
            return Result.fail("分类不存在");
        }
        category.setStatus("normal".equals(support.str(category.getStatus())) ? "disabled" : "normal");
        categoryService.updateById(category);
        return Result.ok();
    }

    public Result<List<Map<String, Object>>> notifications() {
        return Result.ok(support.mapQueryList(
                "SELECT * FROM t_notification ORDER BY time DESC",
                support::notificationItem
        ));
    }

    public Result<Void> addNotification(NotificationCreateRequest body) {
        String title = body == null ? "" : support.empty(body.title());
        String content = body == null ? "" : support.empty(body.content());
        resolveTargetUserIds(body).forEach(userId -> notificationService.saveNotification(userId, title, content, PLATFORM_NOTICE));
        return Result.ok();
    }

    public Result<Void> toggleNotification(Long id) {
        Notification notification = notificationService.getById(id);
        if (notification == null) {
            return Result.fail("通知不存在");
        }
        notification.setIsRead(!Boolean.TRUE.equals(notification.getIsRead()));
        notificationService.updateById(notification);
        return Result.ok();
    }

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
        return Result.ok(support.mapQueryList(sql, support::messageItem));
    }

    public Result<Void> markMessageRead(Long id) {
        messageService.markRead(id);
        return Result.ok();
    }

    public Result<Void> deleteMessage(Long id) {
        messageService.removeById(id);
        return Result.ok();
    }

    public Result<List<Map<String, Object>>> menus() {
        return Result.ok(support.defaultMenus());
    }

    public Result<List<Map<String, Object>>> roles() {
        return Result.ok(support.systemRoles());
    }

    public Result<List<Map<String, Object>>> permissions() {
        return Result.ok(support.defaultPermissions());
    }

    public Result<Void> updateRole(String id, RoleUpdateRequest body, String userId) {
        if (!support.isSuperAdmin(userId)) {
            return Result.fail("仅超级管理员可设置角色");
        }
        Map<String, Object> current = support.systemRoles().stream()
                .filter(role -> id.equals(support.str(role.get("id"))))
                .findFirst()
                .orElse(null);
        if (current == null) {
            return Result.fail("角色不存在");
        }
        String code = support.str(current.get("code"));
        String name = support.emptyTo(body == null ? null : body.name(), support.str(current.get("name")));
        String description = support.emptyTo(body == null ? null : body.description(), support.str(current.get("description")));
        String status = support.emptyTo(body == null ? null : body.status(), support.str(current.get("status")));
        if (AdminSupport.ROLE_SUPER_ADMIN.equals(code)) {
            status = "active";
        }
        adminRoleMapper.update(null, new LambdaUpdateWrapper<AdminRole>()
                .eq(AdminRole::getId, id)
                .set(AdminRole::getName, name)
                .set(AdminRole::getDescription, description)
                .set(AdminRole::getStatus, status)
                .set(AdminRole::getMenuIds, support.stringifyArray(body == null ? List.of() : body.menuIds()))
                .set(AdminRole::getPermissionCodes, support.stringifyArray(body == null ? List.of() : body.permissionCodes()))
                .set(AdminRole::getUpdateTime, LocalDateTime.now()));
        return Result.ok();
    }

    private List<String> resolveTargetUserIds(NotificationCreateRequest body) {
        String target = body == null ? "" : support.empty(body.target());
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<User>().select(User::getId);
        if (!"all".equals(target)) {
            wrapper.orderByDesc(User::getCreatedAt).last("LIMIT 1");
        }
        return userMapper.selectObjs(wrapper).stream().map(support::str).toList();
    }
}
