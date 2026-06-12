/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.dto.notification;

import lombok.Data;

/** 文件作用：发送通知请求参数。 */
@Data
public class SendNotificationRequest {
    private String userId;
    private String title;
    private String content;
    private String serviceName;
}
