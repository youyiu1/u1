package com.neighborhood.app.realtime;

import java.time.LocalDateTime;

/** 统一实时事件载荷，前端可按 type 区分消息、通知等事件。 */
public record RealtimeEvent<T>(
        String type,
        T payload,
        LocalDateTime time
) {
    public static <T> RealtimeEvent<T> of(String type, T payload) {
        return new RealtimeEvent<>(type, payload, LocalDateTime.now());
    }
}
