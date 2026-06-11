package com.neighborhood.app.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 管理端内容请求参数。 */
public final class AdminContentRequests {

    private AdminContentRequests() {
    }

    public record CommentStatusRequest(
            @NotBlank(message = "评论状态不能为空")
            String status
    ) {
    }

    public record DynamicCommentRequest(
            @NotBlank(message = "评论内容不能为空")
            @Size(max = 500, message = "评论内容不能超过500个字符")
            String text,

            @Size(max = 30, message = "评论人不能超过30个字符")
            String commenter
    ) {
    }

    public record ImageStatusRequest(
            @NotBlank(message = "图片地址不能为空")
            @Size(max = 500, message = "图片地址不能超过500个字符")
            String imageUrl,

            @NotBlank(message = "图片状态不能为空")
            String status
    ) {
    }

    public record ImageDeleteRequest(
            @NotBlank(message = "图片地址不能为空")
            @Size(max = 500, message = "图片地址不能超过500个字符")
            String imageUrl
    ) {
    }
}
