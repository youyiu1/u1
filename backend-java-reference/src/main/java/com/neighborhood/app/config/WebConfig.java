package com.neighborhood.app.config;

import com.neighborhood.app.interceptor.AuthInterceptor;
import com.neighborhood.app.interceptor.PerformanceInterceptor;
import java.util.Arrays;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** 文件作用：Web配置。 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;
    private final PerformanceInterceptor performanceInterceptor;

    @Value("#{'${app.security.cors.allowed-origin-patterns:http://localhost:5173,http://localhost:8080}'.split(',')}")
    private String[] allowedOriginPatterns;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**")
                .order(0);
        registry.addInterceptor(performanceInterceptor)
                .addPathPatterns("/api/**")
                .order(1);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(normalizedAllowedOrigins())
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }

    private String[] normalizedAllowedOrigins() {
        return Arrays.stream(allowedOriginPatterns)
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toArray(String[]::new);
    }
}
