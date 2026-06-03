package com.neighborhood.app.service.impl;

import com.neighborhood.app.service.AdminRoleConfigService;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.admin.AdminRole;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.mapper.admin.AdminRoleMapper;
import com.neighborhood.app.mapper.user.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminRoleConfigServiceImpl extends ServiceImpl<AdminRoleMapper, AdminRole> implements AdminRoleConfigService {

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
        }
        if (existing.getPermissionCodes() == null || existing.getPermissionCodes().isBlank()) {
            update.set(AdminRole::getPermissionCodes, permissionCodes);
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
}
