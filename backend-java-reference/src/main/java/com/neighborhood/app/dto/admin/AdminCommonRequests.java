package com.neighborhood.app.dto.admin;

public final class AdminCommonRequests {

    private AdminCommonRequests() {
    }

    public record StatusRequest(
            String status,
            String rejectReason
    ) {
    }
}