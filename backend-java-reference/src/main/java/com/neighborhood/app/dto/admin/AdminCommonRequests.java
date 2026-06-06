package com.neighborhood.app.dto.admin;

/** 文件作用：管理端Common请求参数。 */
public final class AdminCommonRequests {

    private AdminCommonRequests() {
    }

    public record StatusRequest(
            String status,
            String rejectReason
    ) {
    }
}
