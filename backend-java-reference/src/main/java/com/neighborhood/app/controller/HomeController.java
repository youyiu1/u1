/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.neighborhood.app.common.Result;
import com.neighborhood.app.entity.Comment;
import com.neighborhood.app.entity.NewsVO;
import com.neighborhood.app.mapper.CommentMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.NewsService;
import com.neighborhood.app.service.MarketService;
import com.neighborhood.app.service.ServiceModuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeController {

    private final NewsService newsService;
    private final MarketService marketService;
    private final ServiceModuleService serviceModuleService;
    private final CacheService cacheService;
    private final CommentMapper commentMapper;

    @GetMapping("/index")
    public Result<Map<String, Object>> index() {
        // 先查缓存
        @SuppressWarnings("unchecked")
        Map<String, Object> cached = (Map<String, Object>) cacheService.getCachedHomeIndex();
        if (cached != null) {
            return Result.ok(cached);
        }

        // 缓存未命中，查询数据
        Map<String, Object> data = new HashMap<>();

        // 获取热门动态（带评论头像）
        List<NewsVO> hotNews = newsService.list().stream().limit(2).map(news -> {
            NewsVO vo = newsService.getNewsVOById(news.getId());
            if (vo != null) {
                // 获取点赞最多的3条评论头像
                List<Comment> topComments = commentMapper.selectList(
                    new QueryWrapper<Comment>()
                        .eq("news_id", news.getId())
                        .orderByDesc("likes")
                        .last("LIMIT 3")
                );
                vo.setComments(topComments.stream()
                    .filter(c -> c.getUserAvatar() != null && !c.getUserAvatar().isEmpty())
                    .collect(Collectors.toList()));
            }
            return vo;
        }).collect(Collectors.toList());
        data.put("hotNews", hotNews);

        data.put("hotMarket", marketService.list().stream().limit(4).toList());
        data.put("hotServices", serviceModuleService.list().stream().limit(4).toList());

        // 存入缓存
        cacheService.cacheHomeIndex(data);

        return Result.ok(data);
    }
}