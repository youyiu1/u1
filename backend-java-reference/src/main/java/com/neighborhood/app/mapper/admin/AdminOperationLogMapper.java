package com.neighborhood.app.mapper.admin;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.neighborhood.app.entity.admin.AdminOperationLog;
import org.apache.ibatis.annotations.Mapper;

/** 文件作用：管理端操作Log数据访问。 */
@Mapper
public interface AdminOperationLogMapper extends BaseMapper<AdminOperationLog> {
}
