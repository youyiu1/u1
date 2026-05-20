/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.config;

import com.neighborhood.app.interceptor.AuthInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/user/register",
                        "/api/user/login",
                        "/api/user/send-code",
                        "/api/user/name/**",
                        "/api/home/**",
                        "/api/news/list",
                        "/api/news/{id}",
                        "/api/news/{id}/comments",
                        "/api/news/create",
                        "/api/market/list",
                        "/api/market/{id}",
                        "/api/market/create",
                        "/api/service/list",
                        "/api/service/{id}",
                        "/api/service/*/reviews",
                        "/api/category/**",
                        "/api/search",
                        "/api/notification/**",
                        "/api/user/{id}"
                );
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}