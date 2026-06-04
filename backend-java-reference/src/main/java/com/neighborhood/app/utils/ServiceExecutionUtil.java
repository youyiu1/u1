package com.neighborhood.app.utils;

import java.util.function.Supplier;

public final class ServiceExecutionUtil {

    private ServiceExecutionUtil() {
    }

    public static <T> T getOrDefault(Supplier<T> supplier, T fallback) {
        try {
            return supplier.get();
        } catch (Exception e) {
            return fallback;
        }
    }
}
