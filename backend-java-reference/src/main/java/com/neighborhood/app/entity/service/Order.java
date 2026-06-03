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
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("t_order")
public class Order {
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long bookingId; // 关联的预约ID
    private String buyerId;
    private String sellerId;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long serviceId;
    private String serviceTitle;
    private BigDecimal price;
    private LocalDateTime bookingDate;
    private String bookingTime;
    private Integer duration;
    private String status; // pending, in_progress, completed, cancelled
    private String cancelReason;
    private LocalDateTime completedTime; // 用户确认完成时间
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
