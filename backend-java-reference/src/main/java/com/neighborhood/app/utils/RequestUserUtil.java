package com.neighborhood.app.utils;

import jakarta.servlet.http.HttpServletRequest;

/** 文件作用：请求用户工具。 */
public final class RequestUserUtil {

    private static final String HEADER_AUTHORIZATION = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private RequestUserUtil() {
    }

    /**
     * 优先使用登录用户 ID，未登录时回退到请求参数中的用户 ID。
     */
    public static String getEffectiveUserId(HttpServletRequest request, String fallbackUserId) {
        Object loginUserId = request.getAttribute("userId");
        if (loginUserId instanceof String userId && !userId.isBlank()) {
            return userId;
        }
        return fallbackUserId;
    }

    public static String currentUserId(HttpServletRequest request) {
        return getEffectiveUserId(request, null);
    }

    public static String currentBearerToken(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        String authHeader = request.getHeader(HEADER_AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            return null;
        }
        return authHeader.substring(BEARER_PREFIX.length());
    }
}
