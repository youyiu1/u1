/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result<T> {
    private Boolean success;
    private String errorMsg;
    private String message;
    private T data;
    private Long total;

    public static <T> Result<T> ok() {
        return new Result<>(true, null, "success", null, null);
    }

    public static <T> Result<T> ok(T data) {
        return new Result<>(true, null, "success", data, null);
    }

    public static <T> Result<List<T>> ok(List<T> data, Long total) {
        return new Result<>(true, null, "success", data, total);
    }

    public static <T> Result<T> fail(String errorMsg) {
        return new Result<>(false, errorMsg, null, null, null);
    }

    public static <T> Result<T> error(String errorMsg) {
        return new Result<>(false, errorMsg, null, null, null);
    }
}