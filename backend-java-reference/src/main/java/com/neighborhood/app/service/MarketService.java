/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.MarketItem;
import java.util.List;

public interface MarketService extends IService<MarketItem> {
    List<MarketItem> list();
    MarketItem getById(Long id);
    boolean save(MarketItem item);
    boolean updateById(MarketItem item);
}