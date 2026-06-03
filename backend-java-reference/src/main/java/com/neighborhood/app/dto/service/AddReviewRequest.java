/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.dto.service;

import lombok.Data;

@Data
public class AddReviewRequest {
    private String userId;
    private String userName;
    private String userAvatar;
    private Integer rating;
    private String content;
}
