/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.entity.News;
import com.neighborhood.app.entity.Comment;
import com.neighborhood.app.service.NewsService;
import com.neighborhood.app.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    @Autowired
    private NewsService newsService;

    @GetMapping("/list")
    public Result<List<News>> list() {
        return Result.ok(newsService.listDesc());
    }

    @PostMapping("/create")
    public Result<Boolean> create(@RequestBody News news) {
        return Result.ok(newsService.save(news));
    }

    @GetMapping("/{id}")
    public Result<News> getById(@PathVariable Long id) {
        return Result.ok(newsService.getById(id));
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