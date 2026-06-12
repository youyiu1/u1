/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.mapper.market;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.neighborhood.app.entity.market.MarketItem;
import org.apache.ibatis.annotations.Mapper;

/** 文件作用：闲置商品数据访问。 */
@Mapper
public interface MarketMapper extends BaseMapper<MarketItem> {
}
