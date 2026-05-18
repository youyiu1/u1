/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.News;
import com.neighborhood.app.entity.Comment;
import com.neighborhood.app.mapper.NewsMapper;
import com.neighborhood.app.mapper.CommentMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class NewsService extends ServiceImpl<NewsMapper, News> {

    private final CommentMapper commentMapper;

    public NewsService(CommentMapper commentMapper) {
        super();
        this.commentMapper = commentMapper;
    }

    public List<News> listDesc() {
        return lambdaQuery().orderByDesc(News::getCreateTime).list();
    }

    public List<Comment> getCommentsByNewsId(Long newsId, int limit, int offset) {
        return commentMapper.selectList(
            new QueryWrapper<Comment>()
                .eq("news_id", newsId)
                .orderByDesc("create_time")
                .last("LIMIT " + limit + " OFFSET " + offset)
        );
    }

    @Transactional
    public void addComment(Long newsId, Comment comment) {
        comment.setNewsId(newsId);
        comment.setCreateTime(java.time.LocalDateTime.now());
        commentMapper.insert(comment);
        lambdaUpdate().eq(News::getId, newsId)
            .set(News::getCommentsCount, getById(newsId).getCommentsCount() + 1)
            .update();
    }

    @Transactional
    public boolean like(Long newsId) {
        News news = getById(newsId);
        if (news == null) return false;
        return lambdaUpdate().eq(News::getId, newsId)
            .set(News::getLikes, news.getLikes() + 1)
            .update();
    }
}