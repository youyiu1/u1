package com.neighborhood.app.service.impl;

import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.neighborhood.app.service.AppMetricsService;

@Service
@RequiredArgsConstructor
public class AppMetricsServiceImpl implements AppMetricsService {

    private static final String CACHE_HIT_TAG = "cache_hit";
    private static final String MODULE_TAG = "module";
    private static final String OPERATION_TAG = "operation";
    private static final String CHANNEL_TAG = "channel";
    private static final String MODE_TAG = "mode";
    private static final String SUCCESS_TAG = "success";

    private final MeterRegistry meterRegistry;

    @Override
    public void recordContentAccess(String module, String operation, boolean cacheHit) {
        meterRegistry.counter(
                "app.content.access.count",
                MODULE_TAG, normalize(module, "unknown"),
                OPERATION_TAG, normalize(operation, "unknown"),
                CACHE_HIT_TAG, booleanTag(cacheHit)
        ).increment();
    }

    @Override
    public void recordHomeAccess(boolean cacheHit) {
        increment("app.home.access.count", booleanTag(cacheHit));
    }

    @Override
    public void recordSearch(boolean cacheHit) {
        increment("app.search.access.count", booleanTag(cacheHit));
    }

    @Override
    public void recordNotificationList(boolean cacheHit) {
        increment("app.notification.list.count", booleanTag(cacheHit));
    }

    @Override
    public void recordFileAccess(String action, String outcome) {
        meterRegistry.counter(
                "app.file.access.count",
                "action", normalize(action, "unknown"),
                "outcome", normalize(outcome, "unknown")
        ).increment();
    }

    @Override
    public void recordMessageDispatch(String channel, String mode, boolean success) {
        meterRegistry.counter(
                "app.messaging.dispatch.count",
                CHANNEL_TAG, normalize(channel, "unknown"),
                MODE_TAG, normalize(mode, "unknown"),
                SUCCESS_TAG, booleanTag(success)
        ).increment();
    }

    private void increment(String metricName, String cacheHit) {
        meterRegistry.counter(metricName, CACHE_HIT_TAG, cacheHit).increment();
    }

    private String booleanTag(boolean value) {
        return value ? "true" : "false";
    }

    private String normalize(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
