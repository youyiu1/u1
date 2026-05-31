package com.neighborhood.app.dto;

import lombok.Data;

@Data
public class SendMessageRequest {
    private String receiverId;
    private String content;
    private String messageType;
    private String mediaUrl;
}
