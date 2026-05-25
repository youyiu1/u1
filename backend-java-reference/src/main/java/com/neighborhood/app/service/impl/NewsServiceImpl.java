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

    /**
     * 设置当前用户点赞/收藏状态
     */
    private void setUserInteractionStatus(NewsVO vo, String userId) {
        if (vo == null || userId == null) return;
        vo.setIsLiked(cacheService.isNewsLiked(vo.getId(), userId));
        vo.setIsFavorited(cacheService.isFavorited(userId, "news", vo.getId()));
    }

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
        return getNewsVOById(id, null);
    }

    @Override
    public NewsVO getNewsVOById(Long id, String userId) {
        News news = getById(id);
        if (news == null) {
            return null;
        }
        User author = userMapper.selectById(news.getAuthorId());
        NewsVO vo = NewsVO.fromNews(news, author);
        setUserInteractionStatus(vo, userId);
        return vo;
    }

    @Override
    public List<NewsVO> listDescVO() {
        return listDescVO(null);
    }

    @Override
    public List<NewsVO> listDescVO(String userId) {
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
                .map(news -> {
                    NewsVO vo = NewsVO.fromNews(news, userMap.get(news.getAuthorId()));
                    setUserInteractionStatus(vo, userId);
                    return vo;
                })
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
    public boolean like(Long newsId, String userId) {
        // 检查是否已点赞，避免重复
        if (cacheService.isNewsLiked(newsId, userId)) {
            return false;
        }
        boolean result = lambdaUpdate().eq(News::getId, newsId)
                .setSql("likes = likes + 1")
                .update();
        if (result) {
            cacheService.evictNews(newsId);
            // Redis 记录用户点赞
            cacheService.addNewsLike(newsId, userId);
        }
        return result;
    }

    @Override
    public boolean unlike(Long newsId, String userId) {
        // 检查是否已点赞
        if (!cacheService.isNewsLiked(newsId, userId)) {
            return false;
        }
        boolean result = lambdaUpdate().eq(News::getId, newsId)
                .setSql("likes = likes - 1")
                .update();
        if (result) {
            cacheService.evictNews(newsId);
            // Redis 删除用户点赞记录
            cacheService.removeNewsLike(newsId, userId);
        }
        return result;
    }

    @Override
    public boolean isLiked(Long newsId, String userId) {
        return cacheService.isNewsLiked(newsId, userId);
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
    public List<NewsVO> listByUserId(String userId) {
        List<News> newsList = lambdaQuery()
                .eq(News::getAuthorId, userId)
                .orderByDesc(News::getCreateTime)
                .list();
        if (newsList.isEmpty()) {
            return List.of();
        }
        User author = userMapper.selectById(userId);
        return newsList.stream()
                .map(news -> NewsVO.fromNews(news, author))
                .collect(Collectors.toList());
    }
}