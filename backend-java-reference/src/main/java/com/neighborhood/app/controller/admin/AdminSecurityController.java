package com.neighborhood.app.controller.admin;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.dto.admin.AdminSecurityRequests.OperationLogCreateRequest;
import com.neighborhood.app.dto.admin.AdminSecurityRequests.OperationLogRetentionRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 文件作用：管理端安全接口。 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminSecurityController {

    private final com.neighborhood.app.controller.admin.module.AdminSecurityModule module;

    @GetMapping("/login-logs")
    public Result<List<Map<String, Object>>> loginLogs() {
        return module.loginLogs();
    }

    @GetMapping("/operation-logs")
    public Result<List<Map<String, Object>>> operationLogs() {
        return module.operationLogs();
    }

    @PostMapping("/operation-logs")
    public Result<Void> addOperationLog(@Valid @RequestBody OperationLogCreateRequest body) {
        return module.addOperationLog(body);
    }

    @PostMapping("/operation-logs/retention")
    public Result<Map<String, Object>> operationLogRetention(@Valid @RequestBody OperationLogRetentionRequest body) {
        return module.operationLogRetention(body);
    }
}
