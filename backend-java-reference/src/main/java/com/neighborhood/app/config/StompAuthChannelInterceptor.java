package com.neighborhood.app.config;

import com.neighborhood.app.realtime.RealtimeUserPrincipal;
import com.neighborhood.app.util.JwtUtil;
import com.neighborhood.app.utils.AuthTokenStore;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

/** STOMP CONNECT 认证拦截器：在连接消息头中校验 JWT，不在地址栏传 token。 */
@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;
    private final AuthTokenStore authTokenStore;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() != StompCommand.CONNECT) {
            return message;
        }

        String token = resolveToken(accessor.getFirstNativeHeader("Authorization"));
        if (token == null || !jwtUtil.validateToken(token)) {
            throw new IllegalArgumentException("Token无效");
        }
        String userId = jwtUtil.getUserIdFromToken(token);
        if (!authTokenStore.isTokenActive(userId, token, jwtUtil.getExpiration())) {
            throw new IllegalArgumentException("Token已过期");
        }

        accessor.setUser(new RealtimeUserPrincipal(userId));
        if (accessor.getSessionAttributes() != null) {
            accessor.getSessionAttributes().put("userId", userId);
        }
        return message;
    }

    private String resolveToken(String authorization) {
        if (authorization == null || authorization.isBlank()) {
            return null;
        }
        return authorization.startsWith(BEARER_PREFIX) ? authorization.substring(BEARER_PREFIX.length()) : authorization;
    }
}