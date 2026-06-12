/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.mapper.content;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.neighborhood.app.entity.content.Comment;
import org.apache.ibatis.annotations.Mapper;

/** 文件作用：评论数据访问。 */
@Mapper
public interface CommentMapper extends BaseMapper<Comment> {
}
