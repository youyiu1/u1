package com.neighborhood.app.aspect;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.mapper.user.UserMapper;
import com.neighborhood.app.service.AdminLogDispatchService;
import com.neighborhood.app.utils.RequestClientUtil;
import com.neighborhood.app.utils.UserLookupUtil;
import com.neighborhood.app.service.CacheService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/** 管理端写操作审计切面：复用现有管理日志分发服务，避免控制器重复写日志。 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AdminOperationAuditAspect {

    private static final String SUCCESS = "success";
    private static final String FAILED = "failed";

    private final AdminLogDispatchService adminLogDispatchService;
    private final UserMapper userMapper;
    private final CacheService cacheService;

    @Around("within(com.neighborhood.app.controller.admin..*) && " +
            "(@annotation(org.springframework.web.bind.annotation.PostMapping) || " +
            "@annotation(org.springframework.web.bind.annotation.PutMapping) || " +
            "@annotation(org.springframework.web.bind.annotation.DeleteMapping) || " +
            "@annotation(com.neighborhood.app.aspect.AdminOperationAudit))")
    public Object auditAdminOperation(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = currentRequest();
        if (request == null || isLoginRequest(request)) {
            return joinPoint.proceed();
        }

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        AdminOperationAudit audit = signature.getMethod().getAnnotation(AdminOperationAudit.class);
        long start = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            dispatchLog(request, signature, audit, resolveStatus(result), System.currentTimeMillis() - start, null);
            return result;
        } catch (Throwable throwable) {
            dispatchLog(request, signature, audit, FAILED, System.currentTimeMillis() - start, throwable);
            throw throwable;
        }
    }

    private String resolveStatus(Object result) {
        if (result instanceof Result<?> response && Boolean.FALSE.equals(response.getSuccess())) {
            return FAILED;
        }
        return SUCCESS;
    }

    private void dispatchLog(
            HttpServletRequest request,
            MethodSignature signature,
            AdminOperationAudit audit,
            String status,
            long costMs,
            Throwable throwable
    ) {
        try {
            String userId = currentUserId(request);
            User user = userId == null ? null : UserLookupUtil.getById(cacheService, userMapper, userId);
            String operator = user == null ? safeUser(userId) : nonBlank(user.getName(), user.getEmail(), userId);
            String role = user == null ? "UNKNOWN" : nonBlank(user.getAdminRole(), "UNKNOWN");
            String action = resolveAction(request, signature, audit);
            String target = resolveTarget(request, audit);
            String details = buildDetails(request, signature, costMs, throwable);
            adminLogDispatchService.dispatchOperationLog(
                    operator,
                    role,
                    action,
                    target,
                    RequestClientUtil.clientIp(request),
                    status,
                    details
            );
        } catch (Exception exception) {
            log.warn("admin operation audit dispatch failed", exception);
        }
    }

    private String buildDetails(HttpServletRequest request, MethodSignature signature, long costMs, Throwable throwable) {
        String methodName = signature.getDeclaringType().getSimpleName() + "." + signature.getName();
        String detail = request.getMethod() + " " + request.getRequestURI() + " cost=" + costMs + "ms method=" + methodName;
        if (throwable == null) {
            return detail;
        }
        return detail + " error=" + throwable.getClass().getSimpleName();
    }

    private String resolveAction(HttpServletRequest request, MethodSignature signature, AdminOperationAudit audit) {
        if (audit != null && !audit.action().isBlank()) {
            return audit.action();
        }
        return request.getMethod() + " " + signature.getName();
    }

    private String resolveTarget(HttpServletRequest request, AdminOperationAudit audit) {
        if (audit != null && !audit.target().isBlank()) {
            return audit.target();
        }
        return request.getRequestURI();
    }

    private boolean isLoginRequest(HttpServletRequest request) {
        return "/api/admin/login".equals(request.getRequestURI());
    }

    private String currentUserId(HttpServletRequest request) {
        Object userId = request.getAttribute("userId");
        return userId instanceof String value && !value.isBlank() ? value : null;
    }

    private String safeUser(String userId) {
        return userId == null || userId.isBlank() ? "UNKNOWN" : userId;
    }

    private String nonBlank(String... values) {
        return Arrays.stream(values)
                .filter(value -> value != null && !value.isBlank())
                .findFirst()
                .orElse("UNKNOWN");
    }

    private HttpServletRequest currentRequest() {
        if (!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes)) {
            return null;
        }
        return attributes.getRequest();
    }
}
