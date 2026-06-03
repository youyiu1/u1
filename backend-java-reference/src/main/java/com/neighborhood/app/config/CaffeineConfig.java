package com.neighborhood.app.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class CaffeineConfig {

    @Bean
    public CacheManager cacheManager(
            @Value("${app.cache.caffeine.initial-capacity:256}") int initialCapacity,
            @Value("${app.cache.caffeine.maximum-size:5000}") long maximumSize,
            @Value("${app.cache.caffeine.expire-after-write-seconds:45}") long expireAfterWriteSeconds) {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("hotData", "stateData");
        cacheManager.setAllowNullValues(false);
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .initialCapacity(initialCapacity)
                .maximumSize(maximumSize)
                .expireAfterWrite(Duration.ofSeconds(expireAfterWriteSeconds))
                .recordStats());
        return cacheManager;
    }
}
