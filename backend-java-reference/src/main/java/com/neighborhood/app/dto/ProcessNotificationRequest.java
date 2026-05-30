/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.dto;

import lombok.Data;

@Data
public class ProcessNotificationRequest {
    private Long notificationId;
    private boolean accept;
    private String buyerId;
    private String sellerId;
    private Long serviceId;
    private String serviceTitle;
    private String price;
    private String bookingDate;
    private String bookingTime;
    private Integer duration;
}
