package com.neighborhood.app.realtime;

import com.neighborhood.app.util.JwtUtil;
import com.neighborhood.app.utils.AuthTokenStore;
import java.net.URI;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

/** WebSocket 握手认证：沿用当前 JWT + Redis Token 活跃状态校验。 */
@Component
@RequiredArgsConstructor
public class RealtimeHandshakeInterceptor implements HandshakeInterceptor {

    public static final String USER_ID_ATTR = "userId";

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;
    private final AuthTokenStore authTokenStore;

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes
    ) {
        String token = resolveToken(request);
        if (token == null || !jwtUtil.validateToken(token)) {
            return false;
        }
        String userId = jwtUtil.getUserIdFromToken(token);
        if (!authTokenStore.isTokenActive(userId, token, jwtUtil.getExpiration())) {
            return false;
        }
        attributes.put(USER_ID_ATTR, userId);
        return true;
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception
    ) {
        // no-op
    }

    private String resolveToken(ServerHttpRequest request) {
        String authorization = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authorization != null && authorization.startsWith(BEARER_PREFIX)) {
            return authorization.substring(BEARER_PREFIX.length());
        }
        URI uri = request.getURI();
        Map<String, String> query = UriComponentsBuilder.fromUri(uri).build().getQueryParams().toSingleValueMap();
        String token = query.get("token");
        if (token == null || token.isBlank()) {
            token = query.get("access_token");
        }
        return token == null || token.isBlank() ? null : token;
    }
}
