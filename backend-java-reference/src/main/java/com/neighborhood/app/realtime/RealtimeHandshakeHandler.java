package com.neighborhood.app.realtime;

import java.security.Principal;
import java.util.Map;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

/** 将握手阶段解析出的 userId 绑定为 WebSocket Principal。 */
@Component
public class RealtimeHandshakeHandler extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(
            ServerHttpRequest request,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes
    ) {
        Object userId = attributes.get(RealtimeHandshakeInterceptor.USER_ID_ATTR);
        if (userId instanceof String value && !value.isBlank()) {
            return new RealtimeUserPrincipal(value);
        }
        return super.determineUser(request, wsHandler, attributes);
    }
}
