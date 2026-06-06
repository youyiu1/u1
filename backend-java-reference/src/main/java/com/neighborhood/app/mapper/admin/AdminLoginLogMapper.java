package com.neighborhood.app.mapper.admin;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.neighborhood.app.entity.admin.AdminLoginLog;
import org.apache.ibatis.annotations.Mapper;

/** 文件作用：管理端登录Log数据访问。 */
@Mapper
public interface AdminLoginLogMapper extends BaseMapper<AdminLoginLog> {
}
