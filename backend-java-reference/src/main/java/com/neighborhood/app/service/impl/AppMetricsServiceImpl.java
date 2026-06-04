package com.neighborhood.app.service.impl;

import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.neighborhood.app.service.AppMetricsService;

@Service
@RequiredArgsConstructor
public class AppMetricsServiceImpl implements AppMetricsService {

    private final MeterRegistry meterRegistry;

    @Override
    public void recordHomeAccess(boolean cacheHit) {
        increment("app.home.access.count", cacheHitTag(cacheHit));
    }

    @Override
    public void recordSearch(boolean cacheHit) {
        increment("app.search.access.count", cacheHitTag(cacheHit));
    }

    @Override
    public void recordNotificationList(boolean cacheHit) {
        increment("app.notification.list.count", cacheHitTag(cacheHit));
    }

    @Override
    public void recordFileAccess(String action, String outcome) {
        meterRegistry.counter(
                "app.file.access.count",
                "action", normalize(action, "unknown"),
                "outcome", normalize(outcome, "unknown")
        ).increment();
    }

    private void increment(String metricName, String cacheHit) {
        meterRegistry.counter(metricName, "cache_hit", cacheHit).increment();
    }

    private String cacheHitTag(boolean cacheHit) {
        return cacheHit ? "true" : "false";
    }

    private String normalize(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
