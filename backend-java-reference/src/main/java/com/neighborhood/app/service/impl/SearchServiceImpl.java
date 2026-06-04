package com.neighborhood.app.service.impl;

import com.neighborhood.app.entity.system.SearchResult;
import com.neighborhood.app.service.AppMetricsService;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.MarketService;
import com.neighborhood.app.service.NewsService;
import com.neighborhood.app.service.SearchService;
import com.neighborhood.app.service.ServiceModuleService;
import com.neighborhood.app.utils.CacheLookupUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final NewsService newsService;
    private final MarketService marketService;
    private final ServiceModuleService serviceModuleService;
    private final CacheService cacheService;
    private final AppMetricsService appMetricsService;

    @Override
    public SearchResult search(String keyword) {
        return CacheLookupUtil.getOrLoadAndTrack(
                () -> cacheService.getCachedSearchResult(keyword),
                this::buildSearchResult,
                result -> cacheService.cacheSearchResult(keyword, result),
                appMetricsService::recordSearch
        );
    }

    private SearchResult buildSearchResult() {
        SearchResult result = new SearchResult();
        result.setPosts(newsService.list());
        result.setItems(marketService.list());
        result.setServices(serviceModuleService.list());
        return result;
    }
}
