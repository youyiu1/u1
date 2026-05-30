/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.dto;

import lombok.Data;

@Data
public class BookingRequest {
    private String serviceId;
    private String buyerId;
    private String sellerId;
    private String bookingDate;
    private String bookingTime;
    private Integer duration;
}
