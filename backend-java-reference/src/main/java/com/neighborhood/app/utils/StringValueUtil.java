package com.neighborhood.app.utils;

/** 文件作用：String值工具。 */
public final class StringValueUtil {

    private StringValueUtil() {
    }

    public static String emptyTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
