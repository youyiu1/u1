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
import java.time.LocalDateTime;
import lombok.Data;

/** 通知实体。 */
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
    private Boolean isProcessed;

    @JsonSerialize(using = ToStringSerializer.class)
    private Long orderId;

    @JsonSerialize(using = ToStringSerializer.class)
    private Long relatedBookingId;

    private String relatedUserId;

    @JsonSerialize(using = ToStringSerializer.class)
    private Long relatedMarketItemId;
}
