/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.Comment;
import com.neighborhood.app.entity.News;
import com.neighborhood.app.entity.NewsVO;
import com.neighborhood.app.entity.User;
import com.neighborhood.app.mapper.CommentMapper;
import com.neighborhood.app.mapper.NewsMapper;
import com.neighborhood.app.mapper.UserMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NewsServiceImpl extends ServiceImpl<NewsMapper, News> implements NewsService {

    private final CommentMapper commentMapper;
    private final CacheService cacheService;
    private final UserMapper userMapper;

    @Override
    public List<News> listDesc() {
        return lambdaQuery().orderByDesc(News::getCreateTime).list();
    }

    @Override
    public News getById(Long id) {
        News cached = cacheService.getCachedNews(id);
        if (cached != null) {
            return cached;
        }
        News news = super.getById(id);
        if (news != null) {
            cacheService.cacheNews(id, news);
        }
        return news;
    }

    @Override
    public NewsVO getNewsVOById(Long id) {
        News news = getById(id);
        if (news == null) {
            return null;
        }
        User author = userMapper.selectById(news.getAuthorId());
        return NewsVO.fromNews(news, author);
    }

    @Override
    public List<NewsVO> listDescVO() {
        List<News> newsList = listDesc();
        if (newsList.isEmpty()) {
            return List.of();
        }
        // 批量获取作者信息
        List<String> authorIds = newsList.stream()
                .map(News::getAuthorId)
                .distinct()
                .collect(Collectors.toList());
        Map<String, User> userMap = userMapper.selectBatchIds(authorIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        return newsList.stream()
                .map(news -> NewsVO.fromNews(news, userMap.get(news.getAuthorId())))
                .collect(Collectors.toList());
    }

    @Override
    public boolean save(News news) {
        boolean result = super.save(news);
        if (result) {
            cacheService.evictNewsList();
        }
        return result;
    }

    @Override
    public boolean updateById(News news) {
        boolean result = super.updateById(news);
        if (result) {
            cacheService.evictNews(news.getId());
        }
        return result;
    }

    @Override
    @Transactional
    public void addComment(Long newsId, Comment comment) {
        comment.setNewsId(newsId);
        comment.setCreateTime(java.time.LocalDateTime.now());
        commentMapper.insert(comment);
        lambdaUpdate().eq(News::getId, newsId)
                .setSql("comments_count = comments_count + 1")
                .update();
        cacheService.evictNews(newsId);
    }

    @Override
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
}