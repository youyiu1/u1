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
    NewsVO getNewsVOById(Long id);  // 获取带作者信息的动态详情
    List<NewsVO> listDescVO();      // 获取带作者信息的动态列表
    boolean save(News news);
    boolean updateById(News news);
    void addComment(Long newsId, Comment comment);
    boolean like(Long newsId);
    List<Comment> getCommentsByNewsId(Long newsId, int limit, int offset);
}