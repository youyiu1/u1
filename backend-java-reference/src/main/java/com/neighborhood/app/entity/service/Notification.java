/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity.service;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("t_notification")
public class Notification {
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    private String userId;
    private String title;
    private String content;
    private String serviceName;
    private LocalDateTime time;
    private Boolean isRead;
    private Boolean isProcessed; // 是否已处理（同意/拒绝）
    @JsonSerialize(using = ToStringSerializer.class)
    private Long orderId; // 关联的订单ID
    @JsonSerialize(using = ToStringSerializer.class)
    private Long relatedBookingId; // 关联的预约ID
}