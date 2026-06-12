/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.mapper.user;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.neighborhood.app.entity.user.User;
import org.apache.ibatis.annotations.Mapper;

/** 文件作用：用户数据访问。 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
}
