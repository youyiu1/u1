package com.neighborhood.app.dto.admin;

/** 文件作用：管理端交易请求参数。 */
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
