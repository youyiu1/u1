package com.neighborhood.app.common;

import java.util.List;

/** 文件作用：返回结果工具。 */
public class ResultUtils {

    private ResultUtils() {
    }

    public static <T> Result<T> ok() {
        return Result.ok();
    }

    public static <T> Result<T> ok(T data) {
        return Result.ok(data);
    }

    public static <T> Result<List<T>> ok(List<T> data, Long total) {
        return Result.ok(data, total);
    }

    public static Result<Boolean> bool(boolean success) {
        return Result.ok(success);
    }

    public static <T> Result<T> fail(String message) {
        return Result.fail(message);
    }

    public static <T> Result<T> fail(int code, String message) {
        Result<T> result = Result.fail(message);
        return result;
    }
}
