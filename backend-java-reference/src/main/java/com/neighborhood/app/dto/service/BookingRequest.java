/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.dto.service;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/** 文件作用：预约请求参数。 */
@Data
public class BookingRequest {
    @NotBlank(message = "服务不能为空")
    @Pattern(regexp = "\\d+", message = "服务参数无效")
    private String serviceId;
    private String buyerId;
    private String sellerId;

    @NotBlank(message = "预约日期不能为空")
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "预约日期格式不正确")
    private String bookingDate;

    @NotBlank(message = "预约时间不能为空")
    private String bookingTime;

    @NotNull(message = "预约时长不能为空")
    @Min(value = 1, message = "预约时长至少为1")
    private Integer duration;
}
