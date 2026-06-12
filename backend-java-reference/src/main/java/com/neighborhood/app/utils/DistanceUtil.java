/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.utils;

import java.util.Locale;

/** 文件作用：距离工具。 */
public class DistanceUtil {
    private static final double EARTH_RADIUS = 6371.0; // 地球半径（公里）

    /**
     * 计算两点之间的距离（使用 Haversine 公式）
     * @param lat1 第一个点的纬度
     * @param lng1 第一个点的经度
     * @param lat2 第二个点的纬度
     * @param lng2 第二个点的经度
     * @return 距离（公里）
     */
    public static double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        if (!isValidCoordinate(lat1, lng1) || !isValidCoordinate(lat2, lng2)) {
            return Double.NaN;
        }
        double latDistance = Math.toRadians(lat2 - lat1);
        double lngDistance = Math.toRadians(lng2 - lng1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lngDistance / 2) * Math.sin(lngDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS * c;
    }

    /**
     * 格式化距离为字符串
     * @param distance 距离（公里）
     * @return 格式化后的字符串，如 "1.2km"
     */
    public static String formatDistance(double distance) {
        if (!Double.isFinite(distance) || distance < 0) {
            return "距离未知";
        }
        if (distance < 0.05) {
            return "<50m";
        }
        if (distance < 1) {
            return String.format(Locale.ROOT, "%.0fm", distance * 1000);
        }
        if (distance < 10) {
            return String.format(Locale.ROOT, "%.1fkm", distance);
        }
        return String.format(Locale.ROOT, "%.0fkm", distance);
    }

    private static boolean isValidCoordinate(double lat, double lng) {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }
}
