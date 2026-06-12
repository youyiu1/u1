package com.neighborhood.app.utils;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

/** 文件作用：SQL集合工具。 */
public final class SqlCollectionUtil {

    private SqlCollectionUtil() {
    }

    public static List<Long> normalizePositiveLongIds(Collection<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return ids.stream()
                .filter(id -> id != null && id > 0)
                .distinct()
                .toList();
    }

    public static String placeholders(int size) {
        return String.join(",", Collections.nCopies(size, "?"));
    }

    public static Object[] prependArg(Object firstArg, List<Long> ids) {
        Object[] args = new Object[ids.size() + 1];
        args[0] = firstArg;
        for (int i = 0; i < ids.size(); i++) {
            args[i + 1] = ids.get(i);
        }
        return args;
    }
}
