package com.neighborhood.app.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class RequestValueUtil {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private RequestValueUtil() {
    }

    public static String str(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    public static BigDecimal toBigDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        if (value instanceof BigDecimal decimal) {
            return decimal;
        }
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        try {
            return new BigDecimal(str(value).trim());
        } catch (Exception ignored) {
            return BigDecimal.ZERO;
        }
    }

    public static Double toDouble(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        try {
            return Double.valueOf(str(value).trim());
        } catch (Exception ignored) {
            return null;
        }
    }

    public static String normalizeJsonArray(Object value) {
        if (value == null) {
            return "[]";
        }
        if (value instanceof String stringVal) {
            String trimmed = stringVal.trim();
            if (trimmed.isEmpty()) {
                return "[]";
            }
            if (trimmed.startsWith("[")) {
                return trimmed;
            }
            return "[\"" + trimmed.replace("\"", "\\\"") + "\"]";
        }
        try {
            return OBJECT_MAPPER.writeValueAsString(value);
        } catch (JsonProcessingException ignored) {
            return "[]";
        }
    }

    public static List<String> toStringList(Object value) {
        if (value == null) {
            return Collections.emptyList();
        }
        if (value instanceof List<?> listVal) {
            List<String> list = new ArrayList<>();
            for (Object item : listVal) {
                if (item == null) {
                    continue;
                }
                String current = str(item).trim();
                if (!current.isEmpty()) {
                    list.add(current);
                }
            }
            return list;
        }
        String stringVal = str(value).trim();
        if (stringVal.isEmpty()) {
            return Collections.emptyList();
        }
        if (stringVal.startsWith("[")) {
            try {
                List<String> parsed = OBJECT_MAPPER.readValue(stringVal, new TypeReference<List<String>>() {
                });
                return parsed == null ? Collections.emptyList() : parsed;
            } catch (Exception ignored) {
            }
        }
        return List.of(stringVal);
    }
}
