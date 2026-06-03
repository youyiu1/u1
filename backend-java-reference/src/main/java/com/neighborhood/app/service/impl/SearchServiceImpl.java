/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.neighborhood.app.entity.system.SearchResult;
import com.neighborhood.app.service.MarketService;
import com.neighborhood.app.service.NewsService;
import com.neighborhood.app.service.SearchService;
import com.neighborhood.app.service.ServiceModuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final NewsService newsService;
    private final MarketService marketService;
    private final ServiceModuleService serviceModuleService;

    @Override
    public SearchResult search(String keyword) {
        SearchResult result = new SearchResult();
        result.setPosts(newsService.list());
        result.setItems(marketService.list());
        result.setServices(serviceModuleService.list());
        return result;
    }
}
