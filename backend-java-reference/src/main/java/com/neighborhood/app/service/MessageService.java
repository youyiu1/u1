/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.Message;
import java.util.List;

public interface MessageService extends IService<Message> {
    /**
     * 获取与指定用户的对话列表
     */
    List<Message> getConversation(String userId1, String userId2);

    /**
     * 获取用户的所有会话（按最后消息时间排序）
     */
    List<Message> getConversations(String userId);

    /**
     * 发送消息
     */
    Message sendMessage(String senderId, String receiverId, String content);

    /**
     * 标记单条消息已读
     */
    boolean markRead(Long messageId);

    /**
     * 标记与某人的整个会话已读
     */
    boolean markConversationRead(String userId, String partnerId);
}