package com.neighborhood.app.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Spring AI 配置。 */
@Configuration
public class SpringAiConfig {

    /** 校验 AI 启用时必须提供智谱密钥。 */
    @Bean
    @ConditionalOnProperty(prefix = "app.ai", name = "enabled", havingValue = "true")
    public AiConfigValidator aiConfigValidator(
            @Value("${spring.ai.zhipuai.api-key:}") String apiKey,
            @Value("${spring.ai.zhipuai.chat.options.model:glm-4.7-flash}") String model) {
        return new AiConfigValidator(apiKey, model);
    }

    /** 创建聊天客户端构建器。 */
    @Bean
    @ConditionalOnBean(ChatModel.class)
    public ChatClient.Builder chatClientBuilder(ChatModel chatModel) {
        return ChatClient.builder(chatModel);
    }

    /** AI 配置校验。 */
    public record AiConfigValidator(String apiKey, String model) {

        public AiConfigValidator {
            if (apiKey == null || apiKey.isBlank()) {
                throw new IllegalStateException("已启用 Spring AI，但未配置 ZHIPUAI_API_KEY");
            }
            if (model == null || model.isBlank()) {
                throw new IllegalStateException("已启用 Spring AI，但未配置智谱聊天模型");
            }
        }
    }
}
