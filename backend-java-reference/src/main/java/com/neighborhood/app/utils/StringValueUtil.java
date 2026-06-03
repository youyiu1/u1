package com.neighborhood.app.utils;

public final class StringValueUtil {

    private StringValueUtil() {
    }

    public static String emptyTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
