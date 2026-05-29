/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.neighborhood.app.common.Result;
import com.neighborhood.app.entity.Comment;
import com.neighborhood.app.entity.MarketItem;
import com.neighborhood.app.entity.News;
import com.neighborhood.app.entity.NewsVO;
import com.neighborhood.app.entity.MarketItemVO;
import com.neighborhood.app.entity.ServiceEntity;
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

        // 获取热门动态（避免 N+1：一次拿 VO，再批量查评论）
        List<News> latestNews = newsService.lambdaQuery()
                .orderByDesc(News::getCreateTime)
                .last("LIMIT 2")
                .list();

        List<NewsVO> hotNews = latestNews.stream()
                .map(news -> newsService.getNewsVOById(news.getId()))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (!hotNews.isEmpty()) {
            List<Long> newsIds = hotNews.stream()
                    .map(NewsVO::getId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            List<Comment> allComments = commentMapper.selectList(
                    new QueryWrapper<Comment>()
                            .in("news_id", newsIds)
                            .orderByDesc("likes")
                            .orderByDesc("create_time")
            );

            Map<Long, List<Comment>> commentsByNewsId = allComments.stream()
                    .filter(c -> c.getNewsId() != null)
                    .collect(Collectors.groupingBy(Comment::getNewsId));

            for (NewsVO vo : hotNews) {
                List<Comment> comments = commentsByNewsId.getOrDefault(vo.getId(), List.of()).stream()
                        .filter(c -> c.getUserAvatar() != null && !c.getUserAvatar().isEmpty())
                        .limit(3)
                        .collect(Collectors.toList());
                vo.setComments(comments);
            }
        }
        data.put("hotNews", hotNews);

        List<MarketItemVO> hotMarket = marketService.lambdaQuery()
                .orderByDesc(MarketItem::getId)
                .last("LIMIT 4")
                .list()
                .stream()
                .map(item -> marketService.getMarketItemVOById(item.getId()))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        data.put("hotMarket", hotMarket);

        List<ServiceEntity> hotServices = serviceModuleService.lambdaQuery()
                .orderByDesc(ServiceEntity::getId)
                .last("LIMIT 4")
                .list();
        data.put("hotServices", hotServices);

        // 存入缓存
        cacheService.cacheHomeIndex(data);

        return Result.ok(data);
    }
}
