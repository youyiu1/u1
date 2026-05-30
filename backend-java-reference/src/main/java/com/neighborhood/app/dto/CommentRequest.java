/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

@Data
public class CommentRequest {
    private String content;
    private String userId;
    private String userName;
    private String userAvatar;
    @JsonAlias("parent_id")
    private Long parentId;
}
