/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.dto.user;

import lombok.Data;

/** 文件作用：关注请求参数。 */
@Data
public class FollowRequest {
    private String followerId;
    private String followingId;
}
