package com.neighborhood.app.controller.admin;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.dto.admin.AdminAuthRequests.LoginRequest;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminSupport support;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody LoginRequest body, HttpServletRequest request) {
        return support.login(body, request);
    }

    @GetMapping("/me")
    public Result<Map<String, Object>> me(@RequestAttribute String userId) {
        return support.me(userId);
    }
}
