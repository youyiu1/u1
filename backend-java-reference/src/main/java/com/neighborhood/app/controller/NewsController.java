/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.dto.CommentRequest;
import com.neighborhood.app.entity.News;
import com.neighborhood.app.vo.NewsVO;
import com.neighborhood.app.entity.Comment;
import com.neighborhood.app.service.NewsService;
import com.neighborhood.app.service.CommentLikeService;
import com.neighborhood.app.utils.RequestUserUtil;
import com.neighborhood.app.common.Result;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    @Autowired
    private NewsService newsService;
    @Autowired
    private CommentLikeService commentLikeService;
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    /**
     * 获取动态列表（带作者信息和当前用户点赞/收藏状态）
     */
    @GetMapping("/list")
    public Result<List<NewsVO>> list(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return Result.ok(newsService.listDescVO(userId));
    }

    /**
     * 获取用户动态列表
     */
    @GetMapping("/user/{userId}")
    public Result<List<NewsVO>> listByUserId(@PathVariable String userId) {
        return Result.ok(newsService.listByUserId(userId));
    }

    /**
     * 创建动态 - 需要登录，自动设置authorId
     */
    @PostMapping("/create")
    public Result<Boolean> create(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        News news = new News();
        String userId = (String) request.getAttribute("userId");
        news.setAuthorId(userId);
        news.setTitle(str(body.get("title")));
        news.setContent(str(body.get("content")));
        news.setLocation(str(body.get("location")));
        news.setCategory(str(body.get("category")));
        news.setImages(normalizeImages(body.get("images")));
        if (news.getCategory() == null || news.getCategory().isEmpty()) {
            news.setCategory("生活记录");
        }
        return Result.ok(newsService.save(news));
    }

    /**
     * 获取动态详情（带作者信息和当前用户点赞/收藏状态）
     */
    @GetMapping("/{id}")
    public Result<NewsVO> getById(@PathVariable Long id, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return Result.ok(newsService.getNewsVOById(id, userId));
    }

    /**
     * 点赞动态（已点则取消，未点则点赞）
     */
    @PostMapping("/{id}/like")
    public Result<Boolean> like(@PathVariable Long id, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        // 查询当前点赞状态
        if (newsService.isLiked(id, userId)) {
            // 已点赞，取消
            return Result.ok(newsService.unlike(id, userId));
        } else {
            // 未点赞，点赞
            return Result.ok(newsService.like(id, userId));
        }
    }

    /**
     * 取消点赞
     */
    @PostMapping("/{id}/unlike")
    public Result<Boolean> unlike(@PathVariable Long id, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return Result.ok(newsService.unlike(id, userId));
    }

    @GetMapping("/{id}/comments")
    public Result<List<Comment>> getComments(
            @PathVariable Long id,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(required = false) String userId,
            HttpServletRequest request) {
        String effectiveUserId = RequestUserUtil.getEffectiveUserId(request, userId);
        return Result.ok(newsService.getCommentsByNewsId(id, limit, offset, effectiveUserId));
    }

    /**
     * 评论点赞/取消点赞
     */
    @PostMapping("/comment/{id}/like")
    public Result<Boolean> likeComment(
            @PathVariable Long id,
            @RequestParam(required = false) String userId,
            HttpServletRequest request) {
        String effectiveUserId = RequestUserUtil.getEffectiveUserId(request, userId);
        if (effectiveUserId == null || effectiveUserId.isBlank()) {
            return Result.fail("请先登录");
        }

        if (commentLikeService.isLiked(id, effectiveUserId)) {
            boolean success = commentLikeService.unlike(id, effectiveUserId);
            if (!success) {
                return Result.fail("取消点赞失败");
            }
            return Result.ok(false);
        }
        boolean success = commentLikeService.like(id, effectiveUserId);
        if (!success) {
            return Result.fail("点赞失败");
        }
        return Result.ok(true);
    }

    /**
     * 发布评论/回复（支持 parentId 和 parent_id）
     */
    @PostMapping("/{id}/comment")
    public Result<Void> addComment(@PathVariable Long id, @RequestBody CommentRequest request) {
        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setUserId(request.getUserId());
        comment.setUserName(request.getUserName());
        comment.setUserAvatar(request.getUserAvatar());
        comment.setParentId(request.getParentId());
        newsService.addComment(id, comment);
        return Result.ok();
    }

    /**
     * 获取热门动态（按评论数排序）
     */
    @GetMapping("/trending")
    public Result<List<NewsVO>> trending(@RequestParam(defaultValue = "5") int limit) {
        return Result.ok(newsService.listTrending(limit));
    }

    /**
     * 删除动态（仅作者可删除）
     */
    @PostMapping("/{id}/delete")
    public Result<Boolean> delete(@PathVariable Long id, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return Result.ok(newsService.deleteById(id, userId));
    }

    private String str(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private String normalizeImages(Object value) {
        if (value == null) {
            return "[]";
        }
        if (value instanceof String stringVal) {
            return stringVal.isBlank() ? "[]" : stringVal;
        }
        try {
            return OBJECT_MAPPER.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }
}

