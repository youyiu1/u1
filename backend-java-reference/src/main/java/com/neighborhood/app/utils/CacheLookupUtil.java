package com.neighborhood.app.utils;

import com.neighborhood.app.service.AppMetricsService;
import java.util.function.Consumer;
import java.util.function.Supplier;

/** 文件作用：缓存查询工具。 */
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

    public static <T> T getOrLoadWithMetrics(
            Supplier<T> cacheGetter,
            Supplier<T> loader,
            Consumer<T> cacheWriter,
            AppMetricsService metricsService,
            String module,
            String operation
    ) {
        T cached = cacheGetter.get();
        if (cached != null) {
            metricsService.recordContentAccess(module, operation, true);
            return cached;
        }
        T loaded = loader.get();
        if (loaded != null) {
            cacheWriter.accept(loaded);
        }
        metricsService.recordContentAccess(module, operation, false);
        return loaded;
    }

    public static <T> T getOrLoadAndTrack(
            Supplier<T> cacheGetter,
            Supplier<T> loader,
            Consumer<T> cacheWriter,
            Consumer<Boolean> hitTracker
    ) {
        T cached = cacheGetter.get();
        if (cached != null) {
            hitTracker.accept(true);
            return cached;
        }
        T loaded = loader.get();
        if (loaded != null) {
            cacheWriter.accept(loaded);
        }
        hitTracker.accept(false);
        return loaded;
    }
}
