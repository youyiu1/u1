/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity.user;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/** 文件作用：关注实体。 */
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
