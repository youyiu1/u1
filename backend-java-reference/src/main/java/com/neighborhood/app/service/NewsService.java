/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.Comment;
import com.neighborhood.app.entity.News;
import com.neighborhood.app.entity.NewsVO;
import java.util.List;

public interface NewsService extends IService<News> {
    List<News> listDesc();
    News getById(Long id);
    NewsVO getNewsVOById(Long id);
    NewsVO getNewsVOById(Long id, String userId);  // 带用户上下文
    List<NewsVO> listDescVO();
    List<NewsVO> listDescVO(String userId);        // 带用户上下文
    List<NewsVO> listByUserId(String userId);
    boolean save(News news);
    boolean updateById(News news);
    void addComment(Long newsId, Comment comment);
    boolean like(Long newsId, String userId);      // 带用户ID，用于Redis记录
    List<Comment> getCommentsByNewsId(Long newsId, int limit, int offset);
}