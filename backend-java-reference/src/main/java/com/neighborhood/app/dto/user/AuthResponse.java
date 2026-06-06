/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.dto.user;

import com.neighborhood.app.vo.user.UserVO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 文件作用：认证响应参数。 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private UserVO user;
    private String token;
}
