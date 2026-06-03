/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.neighborhood.app.entity.system.SearchResult;

public interface SearchService {
    SearchResult search(String keyword);
}