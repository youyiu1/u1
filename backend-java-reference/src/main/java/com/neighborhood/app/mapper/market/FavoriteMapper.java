/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.mapper.market;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.neighborhood.app.entity.market.Favorite;
import org.apache.ibatis.annotations.Mapper;

/** 文件作用：收藏数据访问。 */
@Mapper
public interface FavoriteMapper extends BaseMapper<Favorite> {
}
