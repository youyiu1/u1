package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.baomidou.mybatisplus.extension.conditions.query.LambdaQueryChainWrapper;
import com.neighborhood.app.entity.message.Message;
import com.neighborhood.app.mapper.message.MessageMapper;
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
        return conversationQuery(userId1, userId2)
                .orderByAsc(Message::getCreateTime)
                .list();
    }

    @Override
    public List<Message> getConversations(String userId) {
        return participantQuery(userId)
                .orderByDesc(Message::getCreateTime)
                .list();
    }

    @Override
    public Message sendMessage(String senderId, String receiverId, String content, String messageType, String mediaUrl) {
        Message message = buildMessage(senderId, receiverId, content, messageType, mediaUrl);
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
        return lambdaUpdate()
                .eq(Message::getSenderId, partnerId)
                .eq(Message::getReceiverId, userId)
                .eq(Message::getIsRead, false)
                .set(Message::getIsRead, true)
                .update();
    }

    private LambdaQueryChainWrapper<Message> conversationQuery(String userId1, String userId2) {
        return lambdaQuery()
                .and(w -> w
                        .eq(Message::getSenderId, userId1).eq(Message::getReceiverId, userId2)
                        .or()
                        .eq(Message::getSenderId, userId2).eq(Message::getReceiverId, userId1));
    }

    private LambdaQueryChainWrapper<Message> participantQuery(String userId) {
        return lambdaQuery()
                .and(w -> w
                        .eq(Message::getSenderId, userId)
                        .or()
                        .eq(Message::getReceiverId, userId));
    }

    private Message buildMessage(String senderId, String receiverId, String content, String messageType, String mediaUrl) {
        Message message = new Message();
        message.setSenderId(senderId);
        message.setReceiverId(receiverId);
        message.setContent(content == null ? "" : content);
        message.setMessageType(messageType == null || messageType.isBlank() ? "text" : messageType);
        message.setMediaUrl(mediaUrl == null ? "" : mediaUrl);
        message.setIsRead(false);
        message.setCreateTime(LocalDateTime.now());
        return message;
    }
}
