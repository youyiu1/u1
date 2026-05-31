/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.Comment;
import com.neighborhood.app.entity.Follow;
import com.neighborhood.app.entity.News;
import com.neighborhood.app.vo.NewsVO;
import com.neighborhood.app.entity.User;
import com.neighborhood.app.mapper.CommentMapper;
import com.neighborhood.app.mapper.FollowMapper;
import com.neighborhood.app.mapper.NewsMapper;
import com.neighborhood.app.mapper.UserMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.CommentLikeService;
import com.neighborhood.app.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
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
    private final FollowMapper followMapper;
    private final CommentLikeService commentLikeService;
    private final JdbcTemplate jdbcTemplate;

    /**
     * 设置当前用户点赞/收藏状态
     */
    private void setUserInteractionStatus(NewsVO vo, String userId) {
        if (vo == null) return;
        if (userId != null) {
            vo.setIsLiked(cacheService.isNewsLiked(vo.getId(), userId));
            vo.setIsFavorited(cacheService.isFavorited(userId, "news", vo.getId()));
            vo.setIsFollowing(isFollowing(userId, vo.getAuthorId()));
        }
    }

    /**
     * 检查用户A是否关注用户B
     */
    private boolean isFollowing(String followerId, String followingId) {
        if (followerId == null || followingId == null) return false;
        return followMapper.selectCount(
                new QueryWrapper<Follow>()
                        .eq("follower_id", followerId)
                        .eq("following_id", followingId)
        ) > 0;
    }

    @Override
    public List<News> listDesc() {
        return lambdaQuery()
                .eq(News::getStatus, "normal")
                .orderByDesc(News::getCreateTime)
                .list();
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
        if (news == null || !"normal".equals(emptyTo(news.getStatus(), "normal"))) {
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
        news.setStatus("pending");
        news.setRejectReason("");
        news.setLikes(news.getLikes() == null ? 0 : news.getLikes());
        news.setCommentsCount(news.getCommentsCount() == null ? 0 : news.getCommentsCount());
        news.setShares(news.getShares() == null ? 0 : news.getShares());
        news.setCollections(news.getCollections() == null ? 0 : news.getCollections());
        news.setCreateTime(news.getCreateTime() == null ? java.time.LocalDateTime.now() : news.getCreateTime());
        news.setUpdateTime(java.time.LocalDateTime.now());
        boolean result = super.save(news);
        if (result) {
            cacheService.evictNewsList();
            cacheService.evictHomeIndex();
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
        ensureCommentParentColumnExists();
        ensureCommentStatusColumnExists();
        comment.setNewsId(newsId);
        comment.setCreateTime(java.time.LocalDateTime.now());
        comment.setLikes(comment.getLikes() == null ? 0 : comment.getLikes());
        comment.setStatus("pending");
        Long parentId = comment.getParentId();
        if (parentId == null || parentId <= 0) {
            comment.setParentId(0L);
        } else {
            Comment parentComment = commentMapper.selectById(parentId);
            if (parentComment == null || !newsId.equals(parentComment.getNewsId())) {
                comment.setParentId(0L);
            }
        }
        commentMapper.insert(comment);
        cacheService.evictNews(newsId);
        cacheService.evictHomeIndex();
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

    public List<Comment> getCommentsByNewsId(Long newsId, int limit, int offset, String userId) {
        ensureCommentParentColumnExists();
        ensureCommentStatusColumnExists();
        int safeLimit = Math.max(1, Math.min(limit, 200));
        int safeOffset = Math.max(0, offset);
        List<Comment> comments = commentMapper.selectList(
                new QueryWrapper<Comment>()
                        .eq("news_id", newsId)
                        .eq("status", "normal")
                        .orderByAsc("create_time")
                        .last("LIMIT " + safeLimit + " OFFSET " + safeOffset)
        );
        comments.forEach(c -> {
            if (c.getId() == null) {
                c.setLikes(0);
                c.setIsLiked(false);
                return;
            }
            try {
                c.setLikes((int) commentLikeService.countLikes(c.getId()));
            } catch (Exception e) {
                c.setLikes(c.getLikes() == null ? 0 : c.getLikes());
            }
            if (userId != null && !userId.isEmpty()) {
                try {
                    c.setIsLiked(commentLikeService.isLiked(c.getId(), userId));
                } catch (Exception e) {
                    c.setIsLiked(false);
                }
            } else {
                c.setIsLiked(false);
            }
        });
        return comments;
    }

    private void ensureCommentParentColumnExists() {
        try {
            jdbcTemplate.execute("ALTER TABLE t_comment ADD COLUMN parent_id BIGINT DEFAULT 0 COMMENT '父评论ID'");
        } catch (Exception ignored) {
        }
        try {
            jdbcTemplate.execute("CREATE INDEX idx_parent_id ON t_comment(parent_id)");
        } catch (Exception ignored) {
        }
    }

    private void ensureCommentStatusColumnExists() {
        try {
            jdbcTemplate.execute("ALTER TABLE t_comment ADD COLUMN status VARCHAR(20) DEFAULT 'normal'");
        } catch (Exception ignored) {
        }
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

    @Override
    public List<NewsVO> listTrending(int limit) {
        List<News> newsList = lambdaQuery()
                .eq(News::getStatus, "normal")
                .orderByDesc(News::getCommentsCount)
                .last("LIMIT " + limit)
                .list();
        if (newsList.isEmpty()) {
            return List.of();
        }
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
    @Transactional
    public boolean deleteById(Long id, String userId) {
        News news = super.getById(id);
        if (news == null) {
            return false;
        }
        // 仅作者可删除
        if (!news.getAuthorId().equals(userId)) {
            return false;
        }
        boolean result = super.removeById(id);
        if (result) {
            cacheService.evictNews(id);
            cacheService.evictNewsList();
        }
        return result;
    }

    private String emptyTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}

