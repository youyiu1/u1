package com.neighborhood.app.utils;

import com.neighborhood.app.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** 请求用户解析器，兼容公开接口中的登录态识别。 */
@Component
@RequiredArgsConstructor
public class RequestUserResolver {

    private final JwtUtil jwtUtil;
    private final AuthTokenStore authTokenStore;

    public String currentUserId(HttpServletRequest request) {
        String requestUserId = RequestUserUtil.currentUserId(request);
        if (requestUserId != null && !requestUserId.isBlank()) {
            return requestUserId;
        }
        String token = RequestUserUtil.currentBearerToken(request);
        if (token == null || token.isBlank() || !jwtUtil.validateToken(token)) {
            return null;
        }
        String userId = jwtUtil.getUserIdFromToken(token);
        if (userId == null || userId.isBlank()) {
            return null;
        }
        if (!authTokenStore.isTokenActive(userId, token, jwtUtil.getExpiration())) {
            return null;
        }
        request.setAttribute("userId", userId);
        return userId;
    }

    public String getEffectiveUserId(HttpServletRequest request, String fallbackUserId) {
        String currentUserId = currentUserId(request);
        if (currentUserId != null && !currentUserId.isBlank()) {
            return currentUserId;
        }
        return fallbackUserId;
    }
}
