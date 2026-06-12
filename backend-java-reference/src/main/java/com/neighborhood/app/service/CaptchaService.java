/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.neighborhood.app.dto.user.CaptchaResponse;

/** 文件作用：图形验证码服务接口。 */
public interface CaptchaService {
    CaptchaResponse generateCaptcha(String clientKey);
    boolean validateCaptcha(String clientKey, String captchaId, String captchaCode);
}
