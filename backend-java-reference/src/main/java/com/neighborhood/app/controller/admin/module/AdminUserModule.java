package com.neighborhood.app.controller.admin.module;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.neighborhood.app.common.Result;
import com.neighborhood.app.controller.admin.AdminSupport;
import com.neighborhood.app.dto.admin.AdminCommonRequests.StatusRequest;
import com.neighborhood.app.dto.admin.AdminUserRequests.BlacklistCreateRequest;
import com.neighborhood.app.dto.admin.AdminUserRequests.UserAdminRoleRequest;
import com.neighborhood.app.dto.admin.AdminUserRequests.UserVerifiedRequest;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.mapper.user.UserMapper;
import com.neighborhood.app.service.AdminBlacklistService;
import com.neighborhood.app.service.UserService;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** 管理端用户模块封装。 */
@Component
@RequiredArgsConstructor
public class AdminUserModule {

    private final AdminSupport support;
    private final UserMapper userMapper;
    private final UserService userService;
    private final AdminBlacklistService adminBlacklistService;

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
        return Result.ok(support.mapQueryList(sql, support::userItem));
    }

    public Result<Void> updateUserStatus(String id, StatusRequest body) {
        String nextStatus = support.requestStatus(body, "normal");
        return updateUser(id, user -> {
            user.setStatus(nextStatus);
            if ("disabled".equalsIgnoreCase(nextStatus)) {
                adminBlacklistService.addUserBanItemIfAbsent(
                        support.emptyTo(user.getName(), user.getId()),
                        "管理端封禁发布账号",
                        "admin-system"
                );
            }
        });
    }

    public Result<Void> updateUserVerified(String id, UserVerifiedRequest body) {
        return updateUser(id, user -> user.setIsVerified("verified".equals(body == null ? null : body.verified())));
    }

    public Result<Void> updateUserAdminRole(String id, UserAdminRoleRequest body, String userId) {
        if (!support.isSuperAdmin(userId)) {
            return Result.fail("仅超级管理员可设置角色");
        }
        String nextRole = support.normalizeAdminRole(body == null ? AdminSupport.ROLE_USER : body.adminRole());
        User user = userService.getById(id);
        if (user == null) {
            return Result.fail("用户不存在");
        }
        String currentRole = support.normalizeAdminRole(user.getAdminRole());
        if (AdminSupport.ROLE_SUPER_ADMIN.equals(currentRole) && !AdminSupport.ROLE_SUPER_ADMIN.equals(nextRole)) {
            Long count = userMapper.selectCount(new LambdaQueryWrapper<User>()
                    .eq(User::getAdminRole, AdminSupport.ROLE_SUPER_ADMIN));
            if (count != null && count <= 1) {
                return Result.fail("至少保留一个超级管理员");
            }
        }
        user.setAdminRole(nextRole);
        if (!userService.updateById(user)) {
            return Result.fail("用户角色更新失败");
        }
        return Result.ok();
    }

    public Result<List<Map<String, Object>>> blacklist() {
        syncDisabledUsersToBlacklist();
        return Result.ok(adminBlacklistService.listItems());
    }

    public Result<Void> addBlacklist(BlacklistCreateRequest body) {
        adminBlacklistService.addItem(
                body == null ? null : body.targetType(),
                body == null ? null : body.targetValue(),
                body == null ? "" : support.empty(body.reason()),
                body == null ? "" : support.empty(body.creator())
        );
        return Result.ok();
    }

    public Result<Void> deleteBlacklist(Long id) {
        adminBlacklistService.deleteItem(id);
        return Result.ok();
    }

    private Result<Void> updateUser(String id, Consumer<User> updater) {
        User user = userService.getById(id);
        if (user == null) {
            return Result.fail("用户不存在");
        }
        updater.accept(user);
        if (!userService.updateById(user)) {
            return Result.fail("用户更新失败");
        }
        return Result.ok();
    }

    private void syncDisabledUsersToBlacklist() {
        userService.lambdaQuery()
                .eq(User::getStatus, "disabled")
                .list()
                .forEach(user -> adminBlacklistService.addUserBanItemIfAbsent(
                        support.emptyTo(user.getName(), user.getId()),
                        "管理端封禁发布账号",
                        "admin-system"
                ));
    }
}
