/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.mapper.user;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.neighborhood.app.entity.user.Follow;
import org.apache.ibatis.annotations.Mapper;

/** 文件作用：关注数据访问。 */
@Mapper
public interface FollowMapper extends BaseMapper<Follow> {
}
