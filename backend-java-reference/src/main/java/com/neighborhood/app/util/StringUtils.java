/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.util;

import java.util.UUID;

/** 文件作用：字符串工具。 */
public class StringUtils {

    public static boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    public static boolean isNotEmpty(String str) {
        return !isEmpty(str);
    }

    public static String generateId() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    public static String truncate(String str, int maxLength) {
        if (isEmpty(str) || str.length() <= maxLength) {
            return str;
        }
        return str.substring(0, maxLength) + "...";
    }

    public static String defaultIfEmpty(String str, String defaultStr) {
        return isEmpty(str) ? defaultStr : str;
    }

    public static boolean isValidEmail(String email) {
        if (isEmpty(email)) return false;
        return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    }

    public static String maskEmail(String email) {
        if (isEmpty(email) || !email.contains("@")) return email;
        int atIndex = email.indexOf("@");
        if (atIndex <= 1) return email;
        return email.substring(0, 1) + "***" + email.substring(atIndex);
    }
}
