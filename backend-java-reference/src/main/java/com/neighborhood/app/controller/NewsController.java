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
     * 获取动态列表（带作者信息）
     */
    @GetMapping("/list")
    public Result<List<NewsVO>> list() {
        return Result.ok(newsService.listDescVO());
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
     * 获取动态详情（带作者信息）
     */
    @GetMapping("/{id}")
    public Result<NewsVO> getById(@PathVariable Long id) {
        return Result.ok(newsService.getNewsVOById(id));
    }

    @PostMapping("/{id}/like")
    public Result<Boolean> like(@PathVariable Long id) {
        return Result.ok(newsService.like(id));
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
}