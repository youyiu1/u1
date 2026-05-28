/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.utils;

import jakarta.servlet.http.HttpServletRequest;

public final class RequestUserUtil {

    private RequestUserUtil() {
    }

    /**
     * 优先使用 AuthInterceptor 写入的登录用户 ID，未登录时回退到请求参数。
     */
    public static String getEffectiveUserId(HttpServletRequest request, String fallbackUserId) {
        Object loginUserId = request.getAttribute("userId");
        if (loginUserId instanceof String userId && !userId.isBlank()) {
            return userId;
        }
        return fallbackUserId;
    }
}
