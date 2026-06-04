package com.neighborhood.app.controller.client;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.common.ResultUtils;
import com.neighborhood.app.dto.message.SendMessageRequest;
import com.neighborhood.app.entity.message.Message;
import com.neighborhood.app.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/message")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    /** 获取当前用户的全部会话。 */
    @GetMapping("/conversations")
    public Result<List<Message>> conversations(@RequestAttribute String userId) {
        return Result.ok(messageService.getConversations(userId));
    }

    /** 获取与指定用户的会话消息。 */
    @GetMapping("/conversation/{partnerId}")
    public Result<List<Message>> conversation(
            @RequestAttribute String userId,
            @PathVariable String partnerId) {
        return Result.ok(messageService.getConversation(userId, partnerId));
    }

    /** 发送聊天消息。 */
    @PostMapping("/send")
    public Result<Message> send(
            @RequestAttribute String userId,
            @RequestBody SendMessageRequest request) {
        Message message = messageService.sendMessage(
                userId,
                request.getReceiverId(),
                request.getContent(),
                request.getMessageType(),
                request.getMediaUrl()
        );
        return Result.ok(message);
    }

    /** 标记单条消息为已读。 */
    @PostMapping("/read/{id}")
    public Result<Boolean> markRead(@PathVariable Long id) {
        return ResultUtils.bool(messageService.markRead(id));
    }

    /** 标记与指定用户的整段会话为已读。 */
    @PostMapping("/read-conversation/{partnerId}")
    public Result<Boolean> markConversationRead(
            @RequestAttribute String userId,
            @PathVariable String partnerId) {
        return ResultUtils.bool(messageService.markConversationRead(userId, partnerId));
    }
}
