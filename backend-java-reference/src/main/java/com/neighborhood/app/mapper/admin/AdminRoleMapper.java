package com.neighborhood.app.mapper.admin;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.neighborhood.app.entity.admin.AdminRole;
import org.apache.ibatis.annotations.Mapper;

/** 文件作用：管理端角色数据访问。 */
@Mapper
public interface AdminRoleMapper extends BaseMapper<AdminRole> {
}
