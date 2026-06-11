package com.neighborhood.app.utils;

import java.math.BigDecimal;
import java.util.Map;

/** Map 请求体的轻量校验工具，用于兼容前端灵活字段。 */
public final class RequestValidationUtil {

    private RequestValidationUtil() {
    }

    public static String validateText(Map<String, Object> body, String field, String message, int maxLength) {
        String value = RequestValueUtil.str(body == null ? null : body.get(field)).trim();
        if (value.isEmpty()) {
            return message;
        }
        if (maxLength > 0 && value.length() > maxLength) {
            return message + "不能超过" + maxLength + "个字符";
        }
        return null;
    }

    public static String validatePositivePrice(Map<String, Object> body, String field) {
        BigDecimal price = RequestValueUtil.toBigDecimal(body == null ? null : body.get(field));
        if (price.compareTo(BigDecimal.ZERO) <= 0) {
            return "价格必须大于0";
        }
        return null;
    }
}
