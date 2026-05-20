/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.Message;
import com.neighborhood.app.mapper.MessageMapper;
import com.neighborhood.app.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl extends ServiceImpl<MessageMapper, Message> implements MessageService {

    @Override
    public List<Message> getConversation(String userId1, String userId2) {
        return lambdaQuery()
                .and(w -> w
                        .eq(Message::getSenderId, userId1).eq(Message::getReceiverId, userId2)
                        .or()
                        .eq(Message::getSenderId, userId2).eq(Message::getReceiverId, userId1)
                )
                .orderByAsc(Message::getCreateTime)
                .list();
    }

    @Override
    public List<Message> getConversations(String userId) {
        // 查询用户发送或接收的所有消息，按时间倒序
        return lambdaQuery()
                .and(w -> w
                        .eq(Message::getSenderId, userId)
                        .or()
                        .eq(Message::getReceiverId, userId)
                )
                .orderByDesc(Message::getCreateTime)
                .list();
    }

    @Override
    public Message sendMessage(String senderId, String receiverId, String content) {
        Message message = new Message();
        message.setSenderId(senderId);
        message.setReceiverId(receiverId);
        message.setContent(content);
        message.setIsRead(false);
        message.setCreateTime(LocalDateTime.now());
        save(message);
        return message;
    }

    @Override
    public boolean markRead(Long messageId) {
        return lambdaUpdate()
                .eq(Message::getId, messageId)
                .set(Message::getIsRead, true)
                .update();
    }

    @Override
    public boolean markConversationRead(String userId, String partnerId) {
        // 标记用户收到的来自partner的消息为已读
        return lambdaUpdate()
                .eq(Message::getSenderId, partnerId)
                .eq(Message::getReceiverId, userId)
                .eq(Message::getIsRead, false)
                .set(Message::getIsRead, true)
                .update();
    }
}