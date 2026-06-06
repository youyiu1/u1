package com.neighborhood.app.config;

import jakarta.annotation.PostConstruct;
import java.util.Arrays;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/** 文件作用：生产安全配置校验。 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SecurityStartupValidator {

    private static final String DEFAULT_JWT_SECRET = "change-this-jwt-secret-before-production";
    private static final String DEFAULT_DB_USERNAME = "root";
    private static final String DEFAULT_DB_PASSWORD = "root";
    private static final String DEFAULT_RABBIT_USERNAME = "guest";
    private static final String DEFAULT_RABBIT_PASSWORD = "guest";
    private static final String DEFAULT_RUSTFS_ACCESS_KEY = "local-rustfs-access-key";
    private static final String DEFAULT_RUSTFS_SECRET_KEY = "local-rustfs-secret-key";

    private final Environment environment;

    @Value("${jwt.secret:" + DEFAULT_JWT_SECRET + "}")
    private String jwtSecret;

    @Value("${spring.datasource.username:" + DEFAULT_DB_USERNAME + "}")
    private String dbUsername;

    @Value("${spring.datasource.password:" + DEFAULT_DB_PASSWORD + "}")
    private String dbPassword;

    @Value("${spring.rabbitmq.username:" + DEFAULT_RABBIT_USERNAME + "}")
    private String rabbitUsername;

    @Value("${spring.rabbitmq.password:" + DEFAULT_RABBIT_PASSWORD + "}")
    private String rabbitPassword;

    @Value("${rustfs.access-key:" + DEFAULT_RUSTFS_ACCESS_KEY + "}")
    private String rustfsAccessKey;

    @Value("${rustfs.secret-key:" + DEFAULT_RUSTFS_SECRET_KEY + "}")
    private String rustfsSecretKey;

    @PostConstruct
    public void validate() {
        if (isProductionMode()) {
            requireSafeValue(jwtSecret, DEFAULT_JWT_SECRET, "JWT_SECRET");
            requireSafeValue(dbUsername, DEFAULT_DB_USERNAME, "DB_USERNAME");
            requireSafeValue(dbPassword, DEFAULT_DB_PASSWORD, "DB_PASSWORD");
            requireSafeValue(rabbitUsername, DEFAULT_RABBIT_USERNAME, "RABBITMQ_USERNAME");
            requireSafeValue(rabbitPassword, DEFAULT_RABBIT_PASSWORD, "RABBITMQ_PASSWORD");
            requireSafeValue(rustfsAccessKey, DEFAULT_RUSTFS_ACCESS_KEY, "RUSTFS_ACCESS_KEY");
            requireSafeValue(rustfsSecretKey, DEFAULT_RUSTFS_SECRET_KEY, "RUSTFS_SECRET_KEY");
            return;
        }
        warnIfUnsafe(jwtSecret, DEFAULT_JWT_SECRET, "JWT_SECRET");
        warnIfUnsafe(dbUsername, DEFAULT_DB_USERNAME, "DB_USERNAME");
        warnIfUnsafe(dbPassword, DEFAULT_DB_PASSWORD, "DB_PASSWORD");
        warnIfUnsafe(rabbitUsername, DEFAULT_RABBIT_USERNAME, "RABBITMQ_USERNAME");
        warnIfUnsafe(rabbitPassword, DEFAULT_RABBIT_PASSWORD, "RABBITMQ_PASSWORD");
        warnIfUnsafe(rustfsAccessKey, DEFAULT_RUSTFS_ACCESS_KEY, "RUSTFS_ACCESS_KEY");
        warnIfUnsafe(rustfsSecretKey, DEFAULT_RUSTFS_SECRET_KEY, "RUSTFS_SECRET_KEY");
    }

    private boolean isProductionMode() {
        String appEnv = environment.getProperty("APP_ENV", "");
        if ("prod".equalsIgnoreCase(appEnv) || "production".equalsIgnoreCase(appEnv)) {
            return true;
        }
        return Arrays.stream(environment.getActiveProfiles())
                .map(profile -> profile.toLowerCase(Locale.ROOT))
                .anyMatch(profile -> profile.equals("prod") || profile.equals("production"));
    }

    private void requireSafeValue(String actual, String dangerousDefault, String key) {
        if (isUnsafe(actual, dangerousDefault)) {
            throw new IllegalStateException("生产环境必须配置安全的 " + key);
        }
    }

    private void warnIfUnsafe(String actual, String dangerousDefault, String key) {
        if (isUnsafe(actual, dangerousDefault)) {
            log.warn("{} 仍在使用默认或空值，生产部署前请替换", key);
        }
    }

    private boolean isUnsafe(String actual, String dangerousDefault) {
        return actual == null || actual.isBlank() || dangerousDefault.equals(actual);
    }
}
