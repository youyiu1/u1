/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("t_follow")
public class Follow {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private String followerId;
    private String followingId;

    public Follow() {}

    public Follow(String followerId, String followingId) {
        this.followerId = followerId;
        this.followingId = followingId;
    }
}