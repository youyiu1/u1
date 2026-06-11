package com.neighborhood.app.dto.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** AI 对话请求。 */
public record AiChatRequest(
        @NotBlank(message = "消息不能为空")
        @Size(max = 2000, message = "消息不能超过2000个字符")
        String message,

        @Size(max = 2000, message = "系统提示不能超过2000个字符")
        String systemPrompt
) {
}
