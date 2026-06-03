package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.admin.AdminRole;

public interface AdminRoleConfigService extends IService<AdminRole> {
    void upsertSystemRole(String id, String name, String code, String description, String status, String menuIds, String permissionCodes);
    AdminRole findByCode(String code);
    long countAdminMembers(String code);
}