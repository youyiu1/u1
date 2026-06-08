package com.neighborhood.app.service.impl;

import com.neighborhood.app.service.AiChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/** AI 对话服务实现。 */
@Service
@RequiredArgsConstructor
public class AiChatServiceImpl implements AiChatService {

    private static final String PROJECT_CONTEXT = """
            你正在服务一个“同城生活社区平台”项目，回答时请默认基于以下业务语境：
            1. 平台核心模块包括生活服务、闲置交易、同城动态、消息聊天、通知、个人主页、用户设置和后台管理。
            2. 用户常见需求是写发布文案、整理卖点、生成标题、优化聊天话术、完善服务介绍、补充交易描述和社区动态内容。
            3. 如果用户问题和平台功能有关，优先从这个项目场景出发回答，不要泛泛而谈。
            4. 输出风格要简洁、自然、接地气，适合直接用于前端页面、发布弹窗、聊天消息或运营文案。
            5. 如果用户要求不明确，优先给出能直接复制使用的版本，再补一句简短说明。
            """;

    private final ObjectProvider<ChatClient.Builder> chatClientBuilderProvider;

    @Value("${spring.ai.zhipuai.api-key:}")
    private String apiKey;

    @Value("${app.ai.system-prompt}")
    private String defaultSystemPrompt;

    @Override
    public String chat(String message, String systemPrompt) {
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("消息不能为空");
        }
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("未配置 ZHIPUAI_API_KEY，无法使用 AI 对话");
        }

        ChatClient.Builder chatClientBuilder = chatClientBuilderProvider.getIfAvailable();
        if (chatClientBuilder == null) {
            throw new IllegalStateException("Spring AI 聊天模型未初始化，请检查依赖与配置");
        }

        String content = chatClientBuilder.build()
                .prompt()
                .system(buildSystemPrompt(systemPrompt))
                .user(message.trim())
                .call()
                .content();
        if (content == null || content.isBlank()) {
            throw new IllegalStateException("AI 未返回有效内容");
        }
        return content;
    }

    private String buildSystemPrompt(String systemPrompt) {
        String normalized = normalizedSystemPrompt(systemPrompt);
        return normalized + System.lineSeparator() + System.lineSeparator() + PROJECT_CONTEXT;
    }

    private String normalizedSystemPrompt(String systemPrompt) {
        if (systemPrompt == null || systemPrompt.isBlank()) {
            return defaultSystemPrompt;
        }
        return systemPrompt.trim();
    }
}
