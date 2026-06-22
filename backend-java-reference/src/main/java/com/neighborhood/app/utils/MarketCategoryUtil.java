package com.neighborhood.app.utils;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;

/** Market category normalization and legacy alias handling. */
public final class MarketCategoryUtil {

    public static final String ALL = "all";
    public static final String TECH = "tech";
    public static final String HOME = "home";
    public static final String FASHION = "fashion";
    public static final String CLOTHING = "clothing";
    public static final String SPORTS = "sports";
    public static final String OTHERS = "others";

    private MarketCategoryUtil() {
    }

    public static String normalize(String category) {
        if (category == null || category.isBlank()) {
            return OTHERS;
        }
        String normalized = category.trim().toLowerCase(Locale.ROOT);
        if (ALL.equals(normalized)) {
            return ALL;
        }
        if (matchesAny(normalized, "tech", "electronics", "electronic", "digital", "device", "phone", "computer", "pc", "laptop", "camera", "console", "switch")) {
            return TECH;
        }
        if (matchesAny(normalized, "home", "household", "furniture", "furnishing", "appliance", "kitchen")) {
            return HOME;
        }
        if (matchesAny(normalized, "fashion", "beauty", "cosmetic", "cosmetics", "makeup", "skincare")) {
            return FASHION;
        }
        if (matchesAny(normalized, "clothing", "cloth", "apparel", "wear", "outfit")) {
            return CLOTHING;
        }
        if (matchesAny(normalized, "sports", "sport", "outdoor", "fitness", "exercise", "bike")) {
            return SPORTS;
        }
        if (matchesAny(normalized, "other", "others", "misc", "miscellaneous", "market", "goods", "books")) {
            return OTHERS;
        }
        return OTHERS;
    }

    public static List<String> aliasesForQuery(String category) {
        String normalized = normalize(category);
        if (ALL.equals(normalized)) {
            return List.of(ALL);
        }
        LinkedHashSet<String> aliases = new LinkedHashSet<>();
        aliases.add(normalized);
        switch (normalized) {
            case TECH -> aliases.addAll(List.of("electronics", "electronic", "digital"));
            case HOME -> aliases.addAll(List.of("furniture", "furnishing", "household", "appliance"));
            case FASHION -> aliases.addAll(List.of("beauty", "cosmetic", "cosmetics", "makeup", "skincare"));
            case CLOTHING -> aliases.addAll(List.of("cloth", "apparel", "wear", "outfit"));
            case SPORTS -> aliases.addAll(List.of("sport", "outdoor", "fitness", "exercise", "bike"));
            case OTHERS -> aliases.addAll(List.of("other", "market", "goods", "books", "misc", "miscellaneous"));
            default -> {
            }
        }
        return List.copyOf(aliases);
    }

    private static boolean matchesAny(String value, String... candidates) {
        for (String candidate : candidates) {
            if (candidate.equals(value)) {
                return true;
            }
        }
        return false;
    }

}
