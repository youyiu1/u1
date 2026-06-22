package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.admin.AdminRole;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.mapper.admin.AdminRoleMapper;
import com.neighborhood.app.mapper.user.UserMapper;
import com.neighborhood.app.service.AdminRoleConfigService;
import com.neighborhood.app.utils.CollectionStringUtil;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** 文件作用：管理端角色Config服务实现。 */
@Service
@RequiredArgsConstructor
public class AdminRoleConfigServiceImpl extends ServiceImpl<AdminRoleMapper, AdminRole> implements AdminRoleConfigService {

    private static final Set<String> BUILT_IN_ROLE_CODES = Set.of("SUPER_ADMIN", "ADMIN", "READONLY_ADMIN", "USER");

    private final UserMapper userMapper;

    public void upsertSystemRole(String id, String name, String code, String description, String status, String menuIds, String permissionCodes) {
        AdminRole existing = findByCode(code);
        if (existing == null) {
            AdminRole role = new AdminRole();
            role.setId(id);
            role.setName(name);
            role.setCode(code);
            role.setDescription(description);
            role.setStatus(status);
            role.setMenuIds(menuIds);
            role.setPermissionCodes(permissionCodes);
            save(role);
            return;
        }
        LambdaUpdateWrapper<AdminRole> update = new LambdaUpdateWrapper<AdminRole>()
                .eq(AdminRole::getCode, code)
                .set(AdminRole::getName, name)
                .set(AdminRole::getDescription, description);
        if (existing.getStatus() == null || existing.getStatus().isBlank()) {
            update.set(AdminRole::getStatus, status);
        }
        if (existing.getMenuIds() == null || existing.getMenuIds().isBlank()) {
            update.set(AdminRole::getMenuIds, menuIds);
        } else if (isBuiltInRole(code)) {
            String mergedMenuIds = mergeBuiltInArray(existing.getMenuIds(), menuIds);
            if (!mergedMenuIds.equals(existing.getMenuIds())) {
                update.set(AdminRole::getMenuIds, mergedMenuIds);
            }
        }
        if (existing.getPermissionCodes() == null || existing.getPermissionCodes().isBlank()) {
            update.set(AdminRole::getPermissionCodes, permissionCodes);
        } else if (isBuiltInRole(code)) {
            String mergedPermissionCodes = mergeBuiltInArray(existing.getPermissionCodes(), permissionCodes);
            if (!mergedPermissionCodes.equals(existing.getPermissionCodes())) {
                update.set(AdminRole::getPermissionCodes, mergedPermissionCodes);
            }
        }
        update(null, update);
    }

    public AdminRole findByCode(String code) {
        return lambdaQuery()
                .eq(AdminRole::getCode, code)
                .last("LIMIT 1")
                .one();
    }

    public long countAdminMembers(String code) {
        return userMapper.selectCount(new LambdaQueryWrapper<User>()
                .eq(User::getAdminRole, code));
    }

    private boolean isBuiltInRole(String code) {
        return BUILT_IN_ROLE_CODES.contains(code);
    }

    private String mergeBuiltInArray(String currentRaw, String defaultRaw) {
        List<String> currentItems = CollectionStringUtil.parseStringArray(currentRaw);
        List<String> defaultItems = CollectionStringUtil.parseStringArray(defaultRaw);
        if (defaultItems.isEmpty()) {
            return currentRaw;
        }
        LinkedHashSet<String> merged = new LinkedHashSet<>(currentItems);
        merged.addAll(defaultItems);
        if (merged.size() == currentItems.size() && merged.containsAll(currentItems)) {
            return currentRaw;
        }
        return CollectionStringUtil.stringifyArray(merged);
    }
}
