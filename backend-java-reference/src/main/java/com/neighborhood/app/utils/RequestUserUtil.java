package com.neighborhood.app.utils;

import jakarta.servlet.http.HttpServletRequest;

public final class RequestUserUtil {

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
}
