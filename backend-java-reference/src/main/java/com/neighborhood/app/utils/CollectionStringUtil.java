package com.neighborhood.app.utils;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/** 文件作用：集合String工具。 */
public final class CollectionStringUtil {

    private CollectionStringUtil() {
    }

    public static List<String> parseStringArray(String raw) {
        if (raw == null || raw.isBlank() || "[]".equals(raw.trim())) {
            return List.of();
        }
        return Arrays.stream(raw.replace("[", "").replace("]", "").replace("\"", "").split(","))
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .toList();
    }

    public static String stringifyArray(Object value) {
        if (value instanceof Collection<?> collection) {
            return collection.stream()
                    .map(item -> item == null ? "" : String.valueOf(item))
                    .map(item -> "\"" + item + "\"")
                    .collect(Collectors.joining(",", "[", "]"));
        }
        return "[]";
    }
}
