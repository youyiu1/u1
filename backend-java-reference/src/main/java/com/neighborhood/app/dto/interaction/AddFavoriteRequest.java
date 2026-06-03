/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.dto.interaction;

import lombok.Data;

@Data
public class AddFavoriteRequest {
    private String userId;
    private String targetType;
    private Long targetId;
}
