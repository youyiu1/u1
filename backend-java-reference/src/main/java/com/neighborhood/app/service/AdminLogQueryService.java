package com.neighborhood.app.service;

import java.util.List;
import java.util.Map;

public interface AdminLogQueryService {
    List<Map<String, Object>> listLoginLogs();
    List<Map<String, Object>> listOperationLogs();
    int deleteOperationLogsOlderThan(int days);
}