package com.neighborhood.app.utils;

import jakarta.servlet.http.HttpServletRequest;

/** 请求客户端信息工具，统一使用可信代理写入的客户端地址。 */
public final class RequestClientUtil {

    private RequestClientUtil() {
    }

    public static String clientIp(HttpServletRequest request) {
        String realIp = trimToNull(request.getHeader("X-Real-IP"));
        if (realIp != null) {
            return realIp;
        }
        return request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
    }

    public static String clientKey(HttpServletRequest request) {
        String userAgent = trimToNull(request.getHeader("User-Agent"));
        return clientIp(request) + "|" + (userAgent == null ? "unknown" : userAgent);
    }

    private static String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
