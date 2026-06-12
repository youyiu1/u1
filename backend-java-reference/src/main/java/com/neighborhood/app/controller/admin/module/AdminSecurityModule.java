package com.neighborhood.app.controller.admin.module;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.controller.admin.AdminSupport;
import com.neighborhood.app.dto.admin.AdminSecurityRequests.OperationLogCreateRequest;
import com.neighborhood.app.dto.admin.AdminSecurityRequests.OperationLogRetentionRequest;
import com.neighborhood.app.service.AdminLogDispatchService;
import com.neighborhood.app.service.AdminLogQueryService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** 文件作用：管理端安全模块封装。 */
@Component
@RequiredArgsConstructor
public class AdminSecurityModule {

    private final AdminSupport support;
    private final AdminLogDispatchService adminLogDispatchService;
    private final AdminLogQueryService adminLogQueryService;

    public Result<List<Map<String, Object>>> loginLogs() {
        return Result.ok(adminLogQueryService.listLoginLogs());
    }

    public Result<List<Map<String, Object>>> operationLogs() {
        return Result.ok(adminLogQueryService.listOperationLogs());
    }

    public Result<Void> addOperationLog(OperationLogCreateRequest body) {
        adminLogDispatchService.dispatchOperationLog(
                requestValue(body == null ? null : body.operator()),
                requestValue(body == null ? null : body.role()),
                requestValue(body == null ? null : body.action()),
                requestValue(body == null ? null : body.target()),
                requestValue(body == null ? null : body.ip()),
                body == null ? "success" : support.emptyTo(body.status(), "success"),
                requestValue(body == null ? null : body.details())
        );
        return Result.ok();
    }

    public Result<Map<String, Object>> operationLogRetention(OperationLogRetentionRequest body) {
        String policy = body == null ? "all" : support.emptyTo(body.policy(), "all");
        int deleted = 0;
        if (!"all".equals(policy)) {
            deleted = adminLogQueryService.deleteOperationLogsOlderThan(Integer.parseInt(policy));
        }
        return Result.ok(Map.of("cleanedCount", deleted, "logs", adminLogQueryService.listOperationLogs()));
    }

    private String requestValue(String value) {
        return support.empty(value);
    }
}
