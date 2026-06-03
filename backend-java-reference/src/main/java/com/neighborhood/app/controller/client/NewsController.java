/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller.client;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.dto.interaction.CommentRequest;
import com.neighborhood.app.entity.content.Comment;
import com.neighborhood.app.entity.content.News;
import com.neighborhood.app.service.CommentLikeService;
import com.neighborhood.app.service.NewsService;
import com.neighborhood.app.utils.RequestValueUtil;
import com.neighborhood.app.utils.RequestUserUtil;
import com.neighborhood.app.vo.content.NewsVO;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;
    private final CommentLikeService commentLikeService;

    @GetMapping("/list")
    public Result<List<NewsVO>> list(HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return Result.ok(newsService.listDescVO(userId));
    }

    @GetMapping("/user/{userId}")
    public Result<List<NewsVO>> listByUserId(@PathVariable String userId) {
        return Result.ok(newsService.listByUserId(userId));
    }

    @PostMapping("/create")
    public Result<Boolean> create(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        News news = new News();
        String userId = (String) request.getAttribute("userId");
        news.setAuthorId(userId);
        news.setTitle(RequestValueUtil.str(body.get("title")));
        news.setContent(RequestValueUtil.str(body.get("content")));
        news.setLocation(RequestValueUtil.str(body.get("location")));
        news.setCategory(RequestValueUtil.str(body.get("category")));
        news.setImages(RequestValueUtil.normalizeJsonArray(body.get("images")));
        if (news.getCategory() == null || news.getCategory().isEmpty()) {
            news.setCategory("生活记录");
        }
        return Result.ok(newsService.save(news));
    }

    @GetMapping("/{id}")
    public Result<NewsVO> getById(@PathVariable Long id, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return Result.ok(newsService.getNewsVOById(id, userId));
    }

    @PostMapping("/{id}/like")
    public Result<Boolean> like(@PathVariable Long id, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (newsService.isLiked(id, userId)) {
            return Result.ok(newsService.unlike(id, userId));
        }
        return Result.ok(newsService.like(id, userId));
    }

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

    @PostMapping("/comment/{id}/like")
    public Result<Boolean> likeComment(
            @PathVariable Long id,
            @RequestParam(required = false) String userId,
            HttpServletRequest request) {
        String effectiveUserId = RequestUserUtil.getEffectiveUserId(request, userId);
        if (effectiveUserId == null || effectiveUserId.isBlank()) {
            return Result.fail("请先登录");
        }
        Boolean liked = commentLikeService.toggleLike(id, effectiveUserId);
        if (liked == null) {
            return Result.fail("点赞失败");
        }
        return Result.ok(liked);
    }

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

    @GetMapping("/trending")
    public Result<List<NewsVO>> trending(@RequestParam(defaultValue = "5") int limit) {
        return Result.ok(newsService.listTrending(limit));
    }

    @PostMapping("/{id}/delete")
    public Result<Boolean> delete(@PathVariable Long id, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return Result.ok(newsService.deleteById(id, userId));
    }
}
