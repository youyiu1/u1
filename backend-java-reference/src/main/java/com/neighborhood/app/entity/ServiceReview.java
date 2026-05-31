/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("t_service_review")
public class ServiceReview {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long serviceId;
    private String userId;
    private String userName;
    private String userAvatar;
    private Integer rating;
    private String content;
    private Integer likes;
    private String status;
    private LocalDateTime createTime;
}
