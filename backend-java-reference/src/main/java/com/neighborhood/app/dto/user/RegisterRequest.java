/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.dto.user;

import lombok.Data;

/** 文件作用：Register请求参数。 */
@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String code;
}
