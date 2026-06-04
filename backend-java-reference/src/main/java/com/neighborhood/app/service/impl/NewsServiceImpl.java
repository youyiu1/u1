package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.content.Comment;
import com.neighborhood.app.entity.content.News;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.mapper.content.CommentMapper;
import com.neighborhood.app.mapper.content.NewsMapper;
import com.neighborhood.app.mapper.user.FollowMapper;
import com.neighborhood.app.mapper.user.UserMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.CommentLikeService;
import com.neighborhood.app.service.NewsService;
import com.neighborhood.app.utils.CacheLookupUtil;
import com.neighborhood.app.utils.CounterSqlUtil;
import com.neighborhood.app.utils.EntityDefaultsUtil;
import com.neighborhood.app.utils.FollowLookupUtil;
import com.neighborhood.app.utils.StringValueUtil;
import com.neighborhood.app.utils.UserLookupUtil;
import com.neighborhood.app.vo.content.NewsVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NewsServiceImpl extends ServiceImpl<NewsMapper, News> implements NewsService {

    private final CommentMapper commentMapper;
    private final CacheService cacheService;
    private final UserMapper userMapper;
    private final FollowMapper followMapper;
    private final CommentLikeService commentLikeService;

    private void setUserInteractionStatus(NewsVO vo, String userId) {
        setUserInteractionStatus(vo, userId, null);
    }

    private void setUserInteractionStatus(NewsVO vo, String userId, Set<String> followedAuthorIds) {
        if (vo == null || userId == null) {
            return;
        }
        vo.setIsLiked(cacheService.isNewsLiked(vo.getId(), userId));
        vo.setIsFavorited(cacheService.isFavorited(userId, "news", vo.getId()));
        vo.setIsFollowing(followedAuthorIds == null
                ? isFollowing(userId, vo.getAuthorId())
                : followedAuthorIds.contains(vo.getAuthorId()));
    }

    private boolean isFollowing(String followerId, String followingId) {
        return FollowLookupUtil.isFollowing(cacheService, followMapper, followerId, followingId);
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
        return CacheLookupUtil.getOrLoad(
                () -> cacheService.getCachedNews(id),
                () -> super.getById(id),
                news -> cacheService.cacheNews(id, news)
        );
    }

    @Override
    public NewsVO getNewsVOById(Long id) {
        return getNewsVOById(id, null);
    }

    @Override
    public NewsVO getNewsVOById(Long id, String userId) {
        News news = getById(id);
        if (news == null || !"normal".equals(StringValueUtil.emptyTo(news.getStatus(), "normal"))) {
            return null;
        }
        User author = UserLookupUtil.getById(cacheService, userMapper, news.getAuthorId());
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
        Map<String, User> userMap = authorMap(newsList);
        Set<String> followedAuthorIds = followedAuthorIds(userId, newsList);
        return newsList.stream()
                .map(news -> {
                    NewsVO vo = NewsVO.fromNews(news, userMap.get(news.getAuthorId()));
                    setUserInteractionStatus(vo, userId, followedAuthorIds);
                    return vo;
                })
                .collect(Collectors.toList());
    }

    @Override
    public boolean save(News news) {
        EntityDefaultsUtil.initPendingNews(news);
        boolean result = super.save(news);
        if (result) {
            evictNewsFeeds();
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
        comment.setLikes(comment.getLikes() == null ? 0 : comment.getLikes());
        comment.setStatus("normal");
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
        evictNewsDetailAndHome(newsId);
    }

    @Override
    @Transactional
    public boolean like(Long newsId, String userId) {
        if (cacheService.isNewsLiked(newsId, userId)) {
            return false;
        }
        return updateLikeStatus(newsId, userId, 1);
    }

    @Override
    public boolean unlike(Long newsId, String userId) {
        if (!cacheService.isNewsLiked(newsId, userId)) {
            return false;
        }
        return updateLikeStatus(newsId, userId, -1);
    }

    @Override
    public boolean isLiked(Long newsId, String userId) {
        return cacheService.isNewsLiked(newsId, userId);
    }

    public List<Comment> getCommentsByNewsId(Long newsId, int limit, int offset, String userId) {
        int safeLimit = Math.max(1, Math.min(limit, 200));
        int safeOffset = Math.max(0, offset);
        List<Comment> comments = commentMapper.selectList(
                new QueryWrapper<Comment>()
                        .eq("news_id", newsId)
                        .eq("status", "normal")
                        .orderByAsc("create_time")
                        .last("LIMIT " + safeLimit + " OFFSET " + safeOffset)
        );
        if (comments.isEmpty()) {
            return comments;
        }
        List<Long> commentIds = comments.stream()
                .map(Comment::getId)
                .filter(id -> id != null && id > 0)
                .toList();
        Map<Long, Long> likeCounts = commentLikeService.countLikesByCommentIds(commentIds);
        Set<Long> likedCommentIds = commentLikeService.likedCommentIds(commentIds, userId);
        comments.forEach(comment -> {
            Long commentId = comment.getId();
            int fallbackLikes = comment.getLikes() == null ? 0 : comment.getLikes();
            comment.setLikes((int) likeCounts.getOrDefault(commentId, (long) fallbackLikes).longValue());
            comment.setIsLiked(commentId != null && likedCommentIds.contains(commentId));
        });
        return comments;
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
        User author = UserLookupUtil.getById(cacheService, userMapper, userId);
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
        Map<String, User> userMap = authorMap(newsList);
        return newsList.stream()
                .map(news -> NewsVO.fromNews(news, userMap.get(news.getAuthorId())))
                .collect(Collectors.toList());
    }

    private Map<String, User> authorMap(List<News> newsList) {
        return UserLookupUtil.mapByExtractor(cacheService, userMapper, newsList, News::getAuthorId);
    }

    private Set<String> followedAuthorIds(String userId, List<News> newsList) {
        if (userId == null || userId.isBlank() || newsList.isEmpty()) {
            return Set.of();
        }
        List<String> authorIds = newsList.stream()
                .map(News::getAuthorId)
                .filter(authorId -> authorId != null && !authorId.isBlank())
                .distinct()
                .toList();
        if (authorIds.isEmpty()) {
            return Set.of();
        }
        return FollowLookupUtil.followedIds(cacheService, followMapper, userId, authorIds);
    }

    private boolean updateLikeStatus(Long newsId, String userId, int delta) {
        boolean result = lambdaUpdate().eq(News::getId, newsId)
                .setSql(CounterSqlUtil.nonNegativeDelta("likes", delta))
                .update();
        if (result) {
            cacheService.evictNews(newsId);
            if (delta > 0) {
                cacheService.addNewsLike(newsId, userId);
            } else {
                cacheService.removeNewsLike(newsId, userId);
            }
        }
        return result;
    }

    private void evictNewsDetailAndHome(Long newsId) {
        cacheService.evictNews(newsId);
        cacheService.evictHomeIndex();
    }

    @Override
    @Transactional
    public boolean deleteById(Long id, String userId) {
        News news = super.getById(id);
        if (news == null) {
            return false;
        }
        if (!news.getAuthorId().equals(userId)) {
            return false;
        }
        boolean result = super.removeById(id);
        if (result) {
            cacheService.evictNews(id);
            evictNewsFeeds();
        }
        return result;
    }

    private void evictNewsFeeds() {
        cacheService.evictNewsList();
        cacheService.evictHomeIndex();
    }
}
