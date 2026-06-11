package com.neighborhood.app.controller.client;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.common.ResultUtils;
import com.neighborhood.app.dto.ai.AiChatRequest;
import com.neighborhood.app.service.AiChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 用户端 AI 接口。 */
@Slf4j
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiChatService aiChatService;

    /** 发送 AI 对话请求。 */
    @PostMapping("/chat")
    public Result<String> chat(@RequestBody AiChatRequest request) {
        if (request == null || request.message() == null || request.message().isBlank()) {
            return ResultUtils.fail("消息不能为空");
        }
        try {
            return Result.ok(aiChatService.chat(request.message(), request.systemPrompt()));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            return ResultUtils.fail(exception.getMessage());
        } catch (Exception exception) {
            log.warn("AI chat request failed", exception);
            return ResultUtils.fail("AI 服务暂时不可用，请稍后再试");
        }
    }
}
