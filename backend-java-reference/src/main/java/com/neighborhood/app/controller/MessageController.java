/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.entity.Message;
import com.neighborhood.app.service.MessageService;
import com.neighborhood.app.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/message")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    /**
     * 获取当前用户的所有会话
     */
    @GetMapping("/conversations")
    public Result<List<Message>> conversations(@RequestAttribute String userId) {
        return Result.ok(messageService.getConversations(userId));
    }

    /**
     * 获取与某人的对话
     */
    @GetMapping("/conversation/{partnerId}")
    public Result<List<Message>> conversation(
            @RequestAttribute String userId,
            @PathVariable String partnerId) {
        return Result.ok(messageService.getConversation(userId, partnerId));
    }

    /**
     * 发送消息
     */
    @PostMapping("/send")
    public Result<Message> send(
            @RequestAttribute String userId,
            @RequestBody SendMessageRequest request) {
        Message message = messageService.sendMessage(userId, request.getReceiverId(), request.getContent());
        return Result.ok(message);
    }

    /**
     * 标记单条消息已读
     */
    @PostMapping("/read/{id}")
    public Result<Boolean> markRead(@PathVariable Long id) {
        return Result.ok(messageService.markRead(id));
    }

    /**
     * 标记与某人的会话已读
     */
    @PostMapping("/read-conversation/{partnerId}")
    public Result<Boolean> markConversationRead(
            @RequestAttribute String userId,
            @PathVariable String partnerId) {
        return Result.ok(messageService.markConversationRead(userId, partnerId));
    }

    public static class SendMessageRequest {
        private String receiverId;
        private String content;

        public String getReceiverId() { return receiverId; }
        public void setReceiverId(String receiverId) { this.receiverId = receiverId; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}