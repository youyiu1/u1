/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity.message;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Data;

/** 文件作用：消息实体。 */
@Data
@TableName("t_message")
public class Message {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String senderId;
    private String receiverId;
    private String content;
    private String messageType;
    private String mediaUrl;
    private Boolean isRead;
    private LocalDateTime createTime;
}
