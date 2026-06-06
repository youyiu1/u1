/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.mapper.system;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.neighborhood.app.entity.system.Category;
import org.apache.ibatis.annotations.Mapper;

/** 文件作用：分类数据访问。 */
@Mapper
public interface CategoryMapper extends BaseMapper<Category> {
}
