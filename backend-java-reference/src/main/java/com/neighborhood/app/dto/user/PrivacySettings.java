/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.dto.user;

import lombok.Data;

/** 文件作用：隐私设置参数。 */
@Data
public class PrivacySettings {
    private String profileVisible;
    private String postsVisible;
    private Boolean showLocation;
}
