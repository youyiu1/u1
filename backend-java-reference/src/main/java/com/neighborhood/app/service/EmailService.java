/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

public interface EmailService {
    void sendVerificationCode(String to);
    boolean verifyCode(String email, String code);
}