package com.neighborhood.app.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** 业务方法慢调用切面，用于补充接口拦截器看不到的 service 层耗时。 */
@Slf4j
@Aspect
@Component
public class SlowMethodLogAspect {

    @Value("${app.perf.slow-method-threshold-ms:600}")
    private long slowMethodThresholdMs;

    @Around("within(com.neighborhood.app.service.impl..*) || within(com.neighborhood.app.controller..*)")
    public Object logSlowMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        try {
            return joinPoint.proceed();
        } finally {
            long cost = System.currentTimeMillis() - start;
            if (cost >= slowMethodThresholdMs) {
                log.warn("slow method {}.{} cost={}ms",
                        joinPoint.getSignature().getDeclaringType().getSimpleName(),
                        joinPoint.getSignature().getName(),
                        cost);
            }
        }
    }
}
