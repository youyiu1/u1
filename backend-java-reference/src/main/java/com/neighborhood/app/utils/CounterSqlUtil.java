package com.neighborhood.app.utils;

/** 文件作用：计数SQL工具。 */
public final class CounterSqlUtil {

    private CounterSqlUtil() {
    }

    public static String nonNegativeDelta(String column, int delta) {
        return column + " = GREATEST(" + column + " + (" + delta + "), 0)";
    }

    public static String nonNegativeCoalescedDelta(String column, int delta) {
        return column + " = GREATEST(COALESCE(" + column + ", 0) + (" + delta + "), 0)";
    }
}
