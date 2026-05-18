/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.neighborhood.app.entity.Follow;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface FollowMapper extends BaseMapper<Follow> {
}