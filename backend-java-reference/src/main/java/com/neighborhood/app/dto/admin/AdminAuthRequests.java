package com.neighborhood.app.dto.admin;

public final class AdminAuthRequests {

    private AdminAuthRequests() {
    }

    public record LoginRequest(
            String username,
            String password
    ) {
    }
}