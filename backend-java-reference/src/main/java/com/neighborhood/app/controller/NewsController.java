/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.entity.News;
import com.neighborhood.app.entity.NewsVO;
import com.neighborhood.app.entity.Comment;
import com.neighborhood.app.service.NewsService;
import com.neighborhood.app.service.CommentLikeService;
import com.neighborhood.app.utils.RequestUserUtil;
import com.neighborhood.app.common.Result;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/news")
public class NewsController {

    @Autowired
    private NewsService newsService;
    @Autowired
    private CommentLikeService commentLikeService;

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
    public Result<Boolean> create(@RequestBody News news, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        news.setAuthorId(userId);
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
    public Result<Void> addComment(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Comment comment = new Comment();
        comment.setContent(asString(payload.get("content")));
        comment.setUserId(asString(payload.get("userId")));
        comment.setUserName(asString(payload.get("userName")));
        comment.setUserAvatar(asString(payload.get("userAvatar")));
        Long parentId = parseLongId(payload.get("parentId"));
        if (parentId == null) {
            parentId = parseLongId(payload.get("parent_id"));
        }
        comment.setParentId(parentId);
        newsService.addComment(id, comment);
        return Result.ok();
    }

    private String asString(Object raw) {
        return raw == null ? null : String.valueOf(raw);
    }

    private Long parseLongId(Object raw) {
        if (raw == null) {
            return null;
        }
        if (raw instanceof Number) {
            return ((Number) raw).longValue();
        }
        String value = String.valueOf(raw).trim();
        if (value.isEmpty()) {
            return null;
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException ex) {
            log.warn("评论parentId解析失败: {}", value);
            return null;
        }
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
}
