/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.dto.interaction;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

/** 文件作用：评论请求参数。 */
@Data
public class CommentRequest {
    private String content;
    private String userId;
    private String userName;
    private String userAvatar;
    @JsonAlias("parent_id")
    private Long parentId;
}
