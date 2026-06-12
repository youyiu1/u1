/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.market.MarketItem;
import com.neighborhood.app.vo.market.MarketItemVO;
import java.util.List;

/** 文件作用：闲置商品服务接口。 */
public interface MarketService extends IService<MarketItem> {
    List<MarketItem> list();

    MarketItem getById(Long id);

    MarketItemVO getMarketItemVOById(Long id);

    MarketItemVO getMarketItemVOById(Long id, String viewerUserId);

    List<MarketItemVO> listVO();

    IPage<MarketItemVO> listPage(String category, String keyword, long pageNum, long pageSize);

    List<MarketItemVO> listByUserId(String userId);

    boolean save(MarketItem item);

    boolean updateById(MarketItem item);
}
