package com.neighborhood.app.controller.admin;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.dto.admin.AdminAuthRequests.LoginRequest;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 文件作用：管理端认证接口。 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminSupport support;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody LoginRequest body, HttpServletRequest request) {
        return support.login(body, request);
    }

    @PostMapping("/logout")
    public Result<Boolean> logout(@RequestAttribute String userId, HttpServletRequest request) {
        return support.logout(userId, request);
    }

    @GetMapping("/me")
    public Result<Map<String, Object>> me(@RequestAttribute String userId) {
        return support.me(userId);
    }
}
