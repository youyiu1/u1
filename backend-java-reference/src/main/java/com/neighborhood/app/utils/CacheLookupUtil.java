package com.neighborhood.app.utils;

import java.util.function.Consumer;
import java.util.function.Supplier;

public final class CacheLookupUtil {

    private CacheLookupUtil() {
    }

    public static <T> T getOrLoad(Supplier<T> cacheGetter, Supplier<T> loader, Consumer<T> cacheWriter) {
        T cached = cacheGetter.get();
        if (cached != null) {
            return cached;
        }
        T loaded = loader.get();
        if (loaded != null) {
            cacheWriter.accept(loaded);
        }
        return loaded;
    }
}
