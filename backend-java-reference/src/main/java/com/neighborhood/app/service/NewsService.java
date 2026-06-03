/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.content.Comment;
import com.neighborhood.app.entity.content.News;
import com.neighborhood.app.vo.content.NewsVO;

import java.util.List;

public interface NewsService extends IService<News> {
    List<News> listDesc();

    News getById(Long id);

    NewsVO getNewsVOById(Long id);

    NewsVO getNewsVOById(Long id, String userId);

    List<NewsVO> listDescVO();

    List<NewsVO> listDescVO(String userId);

    List<NewsVO> listByUserId(String userId);

    boolean save(News news);

    boolean updateById(News news);

    void addComment(Long newsId, Comment comment);

    boolean like(Long newsId, String userId);

    boolean unlike(Long newsId, String userId);

    boolean isLiked(Long newsId, String userId);

    List<Comment> getCommentsByNewsId(Long newsId, int limit, int offset, String userId);

    List<NewsVO> listTrending(int limit);

    boolean deleteById(Long id, String userId);
}

