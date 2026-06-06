package com.neighborhood.app.dto.message;

import lombok.Data;

/** 文件作用：发送消息请求参数。 */
@Data
public class SendMessageRequest {
    private String receiverId;
    private String content;
    private String messageType;
    private String mediaUrl;
}
