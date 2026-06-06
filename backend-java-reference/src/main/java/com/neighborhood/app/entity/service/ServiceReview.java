/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity.service;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;
import lombok.Data;

/** 文件作用：服务评价实体。 */
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
