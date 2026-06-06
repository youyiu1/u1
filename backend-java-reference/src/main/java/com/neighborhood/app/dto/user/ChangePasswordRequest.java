/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.dto.user;

import lombok.Data;

/** 文件作用：修改Password请求参数。 */
@Data
public class ChangePasswordRequest {
    private String oldPassword;
    private String newPassword;
}
