/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.dto;

import lombok.Data;

@Data
public class SendNotificationRequest {
    private String userId;
    private String title;
    private String content;
    private String serviceName;
}
