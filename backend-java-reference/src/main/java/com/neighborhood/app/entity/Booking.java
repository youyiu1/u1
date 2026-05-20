/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("t_booking")
public class Booking {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private Long serviceId;
    private String buyerId;
    private String sellerId;
    private LocalDateTime bookingDate;
    private String bookingTime;
    private Integer duration;
    private String status; // pending, confirmed, completed, cancelled
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}