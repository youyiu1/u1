package com.neighborhood.app.mapper.admin;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.neighborhood.app.entity.admin.AdminBlacklist;
import org.apache.ibatis.annotations.Mapper;

/** 文件作用：管理端黑名单数据访问。 */
@Mapper
public interface AdminBlacklistMapper extends BaseMapper<AdminBlacklist> {
}
