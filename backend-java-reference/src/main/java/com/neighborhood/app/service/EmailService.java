/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

/** 文件作用：邮件服务接口。 */
public interface EmailService {
    void sendVerificationCode(String to);
    boolean verifyCode(String email, String code);
}
