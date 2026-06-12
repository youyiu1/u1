package com.neighborhood.app.realtime;

import java.security.Principal;

/** WebSocket 用户身份，名称直接使用系统 userId，便于 convertAndSendToUser 精准推送。 */
public record RealtimeUserPrincipal(String name) implements Principal {
    @Override
    public String getName() {
        return name;
    }
}
