package com.neighborhood.app.dto.message;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** 文件作用：发送消息请求参数。 */
@Data
public class SendMessageRequest {
    @NotBlank(message = "接收人不能为空")
    private String receiverId;

    @Size(max = 1000, message = "消息内容不能超过1000个字符")
    private String content;

    private String messageType;

    @Size(max = 500, message = "媒体地址不能超过500个字符")
    private String mediaUrl;
}
