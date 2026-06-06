package com.neighborhood.app.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/** 文件作用：性能拦截器。 */
/**
 * 接口性能拦截器：记录慢请求耗时，便于本地定位性能瓶颈。
 */
@Slf4j
@Component
public class PerformanceInterceptor implements HandlerInterceptor {

    private static final String START_TIME_ATTR = "perf_start_time_ms";

    @Value("${app.perf.slow-threshold-ms:400}")
    private long slowThresholdMs;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        request.setAttribute(START_TIME_ATTR, System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        Object rawStart = request.getAttribute(START_TIME_ATTR);
        if (!(rawStart instanceof Long)) {
            return;
        }
        long cost = System.currentTimeMillis() - (Long) rawStart;
        if (cost < slowThresholdMs) {
            return;
        }
        String method = request.getMethod();
        String path = request.getRequestURI();
        int status = response.getStatus();
        if (ex != null) {
            log.warn("慢请求 {} {} -> {}ms status={} ex={}", method, path, cost, status, ex.getClass().getSimpleName());
            return;
        }
        log.warn("慢请求 {} {} -> {}ms status={}", method, path, cost, status);
    }
}
