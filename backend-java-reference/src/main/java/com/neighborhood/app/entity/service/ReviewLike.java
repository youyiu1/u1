/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity.service;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("t_review_like")
public class ReviewLike {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private Long reviewId;
    private String userId;
}