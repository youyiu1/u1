package com.neighborhood.app.dto.ai;

/** AI 对话请求。 */
public record AiChatRequest(
        String message,
        String systemPrompt
) {
}
