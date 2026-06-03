/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.dto.user;

import lombok.Data;

@Data
public class PrivacySettings {
    private String profileVisible;
    private String postsVisible;
    private Boolean showLocation;
}
