/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.common;

import java.util.List;

public class ResultUtils {

    public static <T> Result<T> ok() {
        return Result.ok();
    }

    public static <T> Result<T> ok(T data) {
        return Result.ok(data);
    }

    public static <T> Result<List<T>> ok(List<T> data, Long total) {
        return Result.ok(data, total);
    }

    public static <T> Result<T> fail(String message) {
        return Result.fail(message);
    }

    public static <T> Result<T> fail(int code, String message) {
        Result<T> result = Result.fail(message);
        return result;
    }
}