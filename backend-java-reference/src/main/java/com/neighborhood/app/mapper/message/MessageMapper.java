/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.mapper.message;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.neighborhood.app.entity.message.Message;
import org.apache.ibatis.annotations.Mapper;

/** 文件作用：消息数据访问。 */
@Mapper
public interface MessageMapper extends BaseMapper<Message> {
}
