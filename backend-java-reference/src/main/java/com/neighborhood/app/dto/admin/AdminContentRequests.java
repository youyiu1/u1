package com.neighborhood.app.dto.admin;

public final class AdminContentRequests {

    private AdminContentRequests() {
    }

    public record CommentStatusRequest(
            String status
    ) {
    }

    public record DynamicCommentRequest(
            String text,
            String commenter
    ) {
    }

    public record ImageStatusRequest(
            String status
    ) {
    }
}