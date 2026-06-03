package com.neighborhood.app.dto.admin;

public final class AdminCommerceRequests {

    private AdminCommerceRequests() {
    }

    public record CancelOrderRequest(
            String reason
    ) {
    }

    public record ServiceCreateRequest(
            String title,
            String description,
            String category,
            Object price,
            String unit,
            String status,
            String area,
            String phone
    ) {
    }
}