package com.neighborhood.app.service;

/** AI 对话服务。 */
public interface AiChatService {

    String chat(String message, String systemPrompt);
}
