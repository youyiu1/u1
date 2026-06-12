/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.neighborhood.app.entity.system.SearchResult;

/** 文件作用：搜索服务接口。 */
public interface SearchService {
    SearchResult search(String keyword);
}
