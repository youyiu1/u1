/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.dto.user;

import lombok.Data;

/** 文件作用：邮箱重置密码请求参数。 */
@Data
public class ResetPasswordRequest {
    private String email;
    private String code;
    private String newPassword;
}
