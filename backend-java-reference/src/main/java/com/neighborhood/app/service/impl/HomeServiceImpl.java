package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.neighborhood.app.dto.home.HomeIndexData;
import com.neighborhood.app.entity.content.Comment;
import com.neighborhood.app.entity.content.News;
import com.neighborhood.app.entity.market.MarketItem;
import com.neighborhood.app.entity.service.ServiceEntity;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.mapper.content.CommentMapper;
import com.neighborhood.app.mapper.user.UserMapper;
import com.neighborhood.app.service.AppMetricsService;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.HomeService;
import com.neighborhood.app.service.MarketService;
import com.neighborhood.app.service.NewsService;
import com.neighborhood.app.service.ServiceModuleService;
import com.neighborhood.app.utils.CacheLookupUtil;
import com.neighborhood.app.utils.UserLookupUtil;
import com.neighborhood.app.vo.content.NewsVO;
import com.neighborhood.app.vo.market.MarketItemVO;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** 鏂囦欢浣滅敤锛氶椤垫湇鍔″疄鐜般€?*/
@Service
@RequiredArgsConstructor
public class HomeServiceImpl implements HomeService {

    private static final String NEWS_STATUS = "normal";
    private static final String ACTIVE_STATUS = "active";
    private static final int HOT_NEWS_LIMIT = 2;
    private static final int HOT_MARKET_LIMIT = 4;
    private static final int HOT_SERVICE_LIMIT = 4;
    private static final int TOP_COMMENT_LIMIT = 3;

    private final NewsService newsService;
    private final MarketService marketService;
    private final ServiceModuleService serviceModuleService;
    private final CacheService cacheService;
    private final CommentMapper commentMapper;
    private final UserMapper userMapper;
    private final AppMetricsService appMetricsService;

    @Override
    public HomeIndexData getHomeIndex() {
        return CacheLookupUtil.getOrLoadAndTrack(
                cacheService::getCachedHomeIndex,
                this::buildHomeIndex,
                cacheService::cacheHomeIndex,
                appMetricsService::recordHomeAccess
        );
    }

    private HomeIndexData buildHomeIndex() {
        HomeIndexData data = new HomeIndexData();
        data.setHotNews(loadHotNews());
        data.setHotMarket(loadHotMarket());
        data.setHotServices(loadHotServices());
        return data;
    }

    private List<NewsVO> loadHotNews() {
        List<News> latestNews = newsService.lambdaQuery()
                .eq(News::getStatus, NEWS_STATUS)
                .orderByDesc(News::getCreateTime)
                .last("LIMIT " + HOT_NEWS_LIMIT)
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
                .eq(MarketItem::getStatus, ACTIVE_STATUS)
                .orderByDesc(MarketItem::getId)
                .last("LIMIT " + HOT_MARKET_LIMIT)
                .list();
        Map<String, User> sellerMap = UserLookupUtil.mapByExtractor(cacheService, userMapper, latestMarket, MarketItem::getSellerId);
        return latestMarket.stream()
                .map(item -> MarketItemVO.fromMarketItem(item, sellerMap.get(item.getSellerId())))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private List<ServiceEntity> loadHotServices() {
        return serviceModuleService.lambdaQuery()
                .eq(ServiceEntity::getStatus, ACTIVE_STATUS)
                .orderByDesc(ServiceEntity::getId)
                .last("LIMIT " + HOT_SERVICE_LIMIT)
                .list();
    }

    private List<Comment> loadTopCommentsByNewsId(Long newsId) {
        if (newsId == null) {
            return List.of();
        }
        return commentMapper.selectList(new LambdaQueryWrapper<Comment>()
                .eq(Comment::getNewsId, newsId)
                .eq(Comment::getStatus, NEWS_STATUS)
                .isNotNull(Comment::getUserAvatar)
                .ne(Comment::getUserAvatar, "")
                .orderByDesc(Comment::getLikes)
                .orderByDesc(Comment::getCreateTime)
                .last("LIMIT " + TOP_COMMENT_LIMIT));
    }
}
