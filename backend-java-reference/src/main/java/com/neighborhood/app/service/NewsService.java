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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NewsService extends ServiceImpl<NewsMapper, News> {

    private final CommentMapper commentMapper;
    private final CacheService cacheService;

    public List<News> listDesc() {
        // 先查缓存
        List<News> cached = cacheService.getCachedNewsList();
        if (cached != null) {
            return cached;
        }
        // 缓存未命中，查数据库
        List<News> list = lambdaQuery().orderByDesc(News::getCreateTime).list();
        cacheService.cacheNewsList(list);
        return list;
    }

    public News getById(Long id) {
        // 先查缓存
        News cached = (News) cacheService.getCachedNews(id);
        if (cached != null) {
            return cached;
        }
        // 缓存未命中，查数据库
        News news = super.getById(id);
        if (news != null) {
            cacheService.cacheNews(id, news);
        }
        return news;
    }

    @Override
    public boolean save(News news) {
        boolean result = super.save(news);
        if (result) {
            cacheService.evictNewsList();
        }
        return result;
    }

    @Transactional
    public void addComment(Long newsId, Comment comment) {
        comment.setNewsId(newsId);
        comment.setCreateTime(java.time.LocalDateTime.now());
        commentMapper.insert(comment);
        lambdaUpdate().eq(News::getId, newsId)
            .setSql("comments_count = comments_count + 1")
            .update();
        // 清除缓存
        cacheService.evictNews(newsId);
    }

    @Transactional
    public boolean like(Long newsId) {
        boolean result = lambdaUpdate().eq(News::getId, newsId)
            .setSql("likes = likes + 1")
            .update();
        if (result) {
            cacheService.evictNews(newsId);
        }
        return result;
    }

    public List<Comment> getCommentsByNewsId(Long newsId, int limit, int offset) {
        return commentMapper.selectList(
            new QueryWrapper<Comment>()
                .eq("news_id", newsId)
                .orderByDesc("create_time")
                .last("LIMIT " + limit + " OFFSET " + offset)
        );
    }

    @Override
    public boolean updateById(News news) {
        boolean result = super.updateById(news);
        if (result) {
            cacheService.evictNews(news.getId());
        }
        return result;
    }
}