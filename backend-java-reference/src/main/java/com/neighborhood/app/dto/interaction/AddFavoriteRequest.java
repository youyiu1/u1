/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.dto.interaction;

import lombok.Data;

/** 文件作用：新增收藏请求参数。 */
@Data
public class AddFavoriteRequest {
    private String userId;
    private String targetType;
    private Long targetId;
}
