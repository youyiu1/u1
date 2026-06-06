/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.dto.service;

import lombok.Data;

/** 文件作用：新增评价请求参数。 */
@Data
public class AddReviewRequest {
    private String userId;
    private String userName;
    private String userAvatar;
    private Integer rating;
    private String content;
}
