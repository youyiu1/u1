/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.entity.SearchResult;
import com.neighborhood.app.service.SearchService;
import com.neighborhood.app.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public Result<SearchResult> search(@RequestParam String keyword) {
        return Result.ok(searchService.search(keyword));
    }
}