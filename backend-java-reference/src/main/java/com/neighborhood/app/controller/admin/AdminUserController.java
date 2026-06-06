package com.neighborhood.app.controller.admin;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.dto.admin.AdminCommonRequests.StatusRequest;
import com.neighborhood.app.dto.admin.AdminUserRequests.BlacklistCreateRequest;
import com.neighborhood.app.dto.admin.AdminUserRequests.UserAdminRoleRequest;
import com.neighborhood.app.dto.admin.AdminUserRequests.UserVerifiedRequest;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 文件作用：管理端用户接口。 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminUserController {

    private final com.neighborhood.app.controller.admin.module.AdminUserModule module;

    @GetMapping("/users")
    public Result<List<Map<String, Object>>> users() {
        return module.users();
    }

    @PostMapping("/users/{id}/status")
    public Result<Void> updateUserStatus(@PathVariable String id, @RequestBody StatusRequest body) {
        return module.updateUserStatus(id, body);
    }

    @PostMapping("/users/{id}/verified")
    public Result<Void> updateUserVerified(@PathVariable String id, @RequestBody UserVerifiedRequest body) {
        return module.updateUserVerified(id, body);
    }

    @PostMapping("/users/{id}/admin-role")
    public Result<Void> updateUserAdminRole(@PathVariable String id, @RequestBody UserAdminRoleRequest body, @RequestAttribute String userId) {
        return module.updateUserAdminRole(id, body, userId);
    }

    @GetMapping("/blacklist")
    public Result<List<Map<String, Object>>> blacklist() {
        return module.blacklist();
    }

    @PostMapping("/blacklist")
    public Result<Void> addBlacklist(@RequestBody BlacklistCreateRequest body) {
        return module.addBlacklist(body);
    }

    @DeleteMapping("/blacklist/{id}")
    public Result<Void> deleteBlacklist(@PathVariable Long id) {
        return module.deleteBlacklist(id);
    }
}
