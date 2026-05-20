/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.neighborhood.app.entity.ServiceReview;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ServiceReviewMapper extends BaseMapper<ServiceReview> {
}