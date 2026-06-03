/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.mapper.content;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.neighborhood.app.entity.content.News;
import org.apache.ibatis.annotations.Mapper;

/**
 * NewsMapper 接口
 * 继承 MyBatis-Plus 的 BaseMapper 即可获得所有基础 CRUD 能力
 */
@Mapper
public interface NewsMapper extends BaseMapper<News> {
}
