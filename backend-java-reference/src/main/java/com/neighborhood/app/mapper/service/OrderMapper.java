/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.mapper.service;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.neighborhood.app.entity.service.Order;
import org.apache.ibatis.annotations.Mapper;

/** 文件作用：订单数据访问。 */
@Mapper
public interface OrderMapper extends BaseMapper<Order> {
}
