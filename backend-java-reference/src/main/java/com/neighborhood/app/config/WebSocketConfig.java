package com.neighborhood.app.config;

import com.neighborhood.app.realtime.RealtimeHandshakeHandler;
import com.neighborhood.app.realtime.RealtimeHandshakeInterceptor;
import java.util.Arrays;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/** WebSocket/STOMP 实时通信配置，用于私信和通知实时推送。 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final RealtimeHandshakeInterceptor realtimeHandshakeInterceptor;
    private final RealtimeHandshakeHandler realtimeHandshakeHandler;

    @Value("#{'${app.security.cors.allowed-origin-patterns:http://localhost:5173,http://localhost:8080}'.split(',')}")
    private String[] allowedOriginPatterns;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(normalizedAllowedOrigins())
                .addInterceptors(realtimeHandshakeInterceptor)
                .setHandshakeHandler(realtimeHandshakeHandler);
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setUserDestinationPrefix("/user");
    }

    private String[] normalizedAllowedOrigins() {
        return Arrays.stream(allowedOriginPatterns)
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toArray(String[]::new);
    }
}
