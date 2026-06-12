package com.neighborhood.app.messaging;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 通知消息体。 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationMessage {
    private String userId;
    private String title;
    private String content;
    private String serviceName;
    private Long bookingId;
    private String relatedUserId;
    private Long marketItemId;
}
