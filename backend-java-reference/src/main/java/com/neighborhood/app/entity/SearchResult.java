/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity;

import lombok.Data;
import java.util.List;

@Data
public class SearchResult {
    private List<News> posts = new java.util.ArrayList<>();
    private List<MarketItem> items = new java.util.ArrayList<>();
    private List<ServiceEntity> services = new java.util.ArrayList<>();
}