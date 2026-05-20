/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.MarketItem;
import com.neighborhood.app.entity.MarketItemVO;
import java.util.List;

public interface MarketService extends IService<MarketItem> {
    List<MarketItem> list();
    MarketItem getById(Long id);
    MarketItemVO getMarketItemVOById(Long id);  // 获取带卖家信息的闲置详情
    List<MarketItemVO> listVO();                 // 获取带卖家信息的闲置列表
    boolean save(MarketItem item);
    boolean updateById(MarketItem item);
}