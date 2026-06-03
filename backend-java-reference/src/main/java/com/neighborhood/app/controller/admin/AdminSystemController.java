package com.neighborhood.app.controller.admin;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.dto.admin.AdminSystemRequests.CategoryCreateRequest;
import com.neighborhood.app.dto.admin.AdminSystemRequests.NotificationCreateRequest;
import com.neighborhood.app.dto.admin.AdminSystemRequests.RoleUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminSystemController {

    private final com.neighborhood.app.controller.admin.module.AdminSystemModule module;

    @GetMapping("/categories")
    public Result<List<Map<String, Object>>> categories() {
        return module.categories();
    }

    @PostMapping("/categories")
    public Result<Void> addCategory(@RequestBody CategoryCreateRequest body) {
        return module.addCategory(body);
    }

    @PostMapping("/categories/{id}/toggle")
    public Result<Void> toggleCategory(@PathVariable Long id) {
        return module.toggleCategory(id);
    }

    @GetMapping("/notifications")
    public Result<List<Map<String, Object>>> notifications() {
        return module.notifications();
    }

    @PostMapping("/notifications")
    public Result<Void> addNotification(@RequestBody NotificationCreateRequest body) {
        return module.addNotification(body);
    }

    @PostMapping("/notifications/{id}/toggle")
    public Result<Void> toggleNotification(@PathVariable Long id) {
        return module.toggleNotification(id);
    }

    @GetMapping("/messages")
    public Result<List<Map<String, Object>>> messages() {
        return module.messages();
    }

    @PostMapping("/messages/{id}/read")
    public Result<Void> markMessageRead(@PathVariable Long id) {
        return module.markMessageRead(id);
    }

    @DeleteMapping("/messages/{id}")
    public Result<Void> deleteMessage(@PathVariable Long id) {
        return module.deleteMessage(id);
    }

    @GetMapping("/menus")
    public Result<List<Map<String, Object>>> menus() {
        return module.menus();
    }

    @GetMapping("/roles")
    public Result<List<Map<String, Object>>> roles() {
        return module.roles();
    }

    @GetMapping("/permissions")
    public Result<List<Map<String, Object>>> permissions() {
        return module.permissions();
    }

    @PostMapping("/roles/{id}")
    public Result<Void> updateRole(@PathVariable String id, @RequestBody RoleUpdateRequest body, @RequestAttribute String userId) {
        return module.updateRole(id, body, userId);
    }
}