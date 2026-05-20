/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.Comment;
import com.neighborhood.app.entity.News;
import java.util.List;

public interface NewsService extends IService<News> {
    List<News> listDesc();
    News getById(Long id);
    boolean save(News news);
    boolean updateById(News news);
    void addComment(Long newsId, Comment comment);
    boolean like(Long newsId);
    List<Comment> getCommentsByNewsId(Long newsId, int limit, int offset);
}