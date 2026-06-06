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

/** 文件作用：预约实体。 */
@Data
@TableName("t_booking")
public class Booking {
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long serviceId;
    private String buyerId;
    private String sellerId;
    private LocalDateTime bookingDate;
    private String bookingTime;
    private Integer duration;
    private String status; // pending, confirmed, completed, cancelled
    @JsonSerialize(using = ToStringSerializer.class)
    private Long notificationId; // 关联的通知ID
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
