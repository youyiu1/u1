/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.utils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public final class BookingDateTimeUtil {

    private BookingDateTimeUtil() {
    }

    public static LocalDateTime combineDateAndTime(String bookingDate, String bookingTime) {
        return LocalDateTime.of(
                LocalDate.parse(bookingDate, DateTimeFormatter.ISO_LOCAL_DATE),
                LocalTime.parse(bookingTime, DateTimeFormatter.ISO_LOCAL_TIME)
        );
    }
}
