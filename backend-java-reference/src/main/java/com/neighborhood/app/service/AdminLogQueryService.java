package com.neighborhood.app.service;

import java.util.List;
import java.util.Map;

/** 文件作用：管理端Log查询服务接口。 */
public interface AdminLogQueryService {
    List<Map<String, Object>> listLoginLogs();
    List<Map<String, Object>> listOperationLogs();
    int deleteOperationLogsOlderThan(int days);
}
