/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.entity.News;
import com.neighborhood.app.entity.NewsVO;
import com.neighborhood.app.entity.Comment;
import com.neighborhood.app.service.NewsService;
import com.neighborhood.app.common.Result;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/news")
public class NewsController {

    @Autowired
    private NewsService newsService;

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
            @RequestParam(defaultValue = "0") int offset) {
        return Result.ok(newsService.getCommentsByNewsId(id, limit, offset));
    }

    @PostMapping("/{id}/comment")
    public Result<Void> addComment(@PathVariable Long id, @RequestBody Comment comment) {
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
}