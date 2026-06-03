/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.mapper.service;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.neighborhood.app.entity.service.ReviewLike;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ReviewLikeMapper extends BaseMapper<ReviewLike> {
}