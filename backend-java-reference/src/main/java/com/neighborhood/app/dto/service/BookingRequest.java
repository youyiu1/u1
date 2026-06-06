/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.dto.service;

import lombok.Data;

/** 文件作用：预约请求参数。 */
@Data
public class BookingRequest {
    private String serviceId;
    private String buyerId;
    private String sellerId;
    private String bookingDate;
    private String bookingTime;
    private Integer duration;
}
