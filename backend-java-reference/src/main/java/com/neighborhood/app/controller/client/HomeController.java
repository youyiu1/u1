package com.neighborhood.app.controller.client;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.neighborhood.app.common.Result;
import com.neighborhood.app.entity.content.Comment;
import com.neighborhood.app.entity.content.News;
import com.neighborhood.app.entity.market.MarketItem;
import com.neighborhood.app.entity.service.ServiceEntity;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.mapper.content.CommentMapper;
import com.neighborhood.app.mapper.user.UserMapper;
import com.neighborhood.app.service.AppMetricsService;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.MarketService;
import com.neighborhood.app.service.NewsService;
import com.neighborhood.app.service.ServiceModuleService;
import com.neighborhood.app.utils.UserLookupUtil;
import com.neighborhood.app.vo.content.NewsVO;
import com.neighborhood.app.vo.market.MarketItemVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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
    private final UserMapper userMapper;
    private final AppMetricsService appMetricsService;

    /** 首页聚合数据。 */
    @GetMapping("/index")
    public Result<Map<String, Object>> index() {
        @SuppressWarnings("unchecked")
        Map<String, Object> cached = (Map<String, Object>) cacheService.getCachedHomeIndex();
        if (cached != null) {
            appMetricsService.recordHomeAccess(true);
            return Result.ok(cached);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("hotNews", loadHotNews());
        data.put("hotMarket", loadHotMarket());
        data.put("hotServices", loadHotServices());

        cacheService.cacheHomeIndex(data);
        appMetricsService.recordHomeAccess(false);
        return Result.ok(data);
    }

    private List<NewsVO> loadHotNews() {
        List<News> latestNews = newsService.lambdaQuery()
                .eq(News::getStatus, "normal")
                .orderByDesc(News::getCreateTime)
                .last("LIMIT 2")
                .list();
        Map<String, User> authorMap = UserLookupUtil.mapByExtractor(cacheService, userMapper, latestNews, News::getAuthorId);
        List<NewsVO> hotNews = latestNews.stream()
                .map(news -> NewsVO.fromNews(news, authorMap.get(news.getAuthorId())))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        hotNews.forEach(vo -> vo.setComments(loadTopCommentsByNewsId(vo.getId())));
        return hotNews;
    }

    private List<MarketItemVO> loadHotMarket() {
        List<MarketItem> latestMarket = marketService.lambdaQuery()
                .eq(MarketItem::getStatus, "active")
                .orderByDesc(MarketItem::getId)
                .last("LIMIT 4")
                .list();
        Map<String, User> sellerMap = UserLookupUtil.mapByExtractor(cacheService, userMapper, latestMarket, MarketItem::getSellerId);
        return latestMarket.stream()
                .map(item -> MarketItemVO.fromMarketItem(item, sellerMap.get(item.getSellerId())))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private List<ServiceEntity> loadHotServices() {
        return serviceModuleService.lambdaQuery()
                .eq(ServiceEntity::getStatus, "active")
                .orderByDesc(ServiceEntity::getId)
                .last("LIMIT 4")
                .list();
    }

    private List<Comment> loadTopCommentsByNewsId(Long newsId) {
        if (newsId == null) {
            return List.of();
        }
        return commentMapper.selectList(
                new QueryWrapper<Comment>()
                        .eq("news_id", newsId)
                        .eq("status", "normal")
                        .isNotNull("user_avatar")
                        .ne("user_avatar", "")
                        .orderByDesc("likes")
                        .orderByDesc("create_time")
                        .last("LIMIT 3")
        );
    }
}