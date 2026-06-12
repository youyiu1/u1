package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.neighborhood.app.entity.admin.AdminLoginLog;
import com.neighborhood.app.entity.admin.AdminOperationLog;
import com.neighborhood.app.mapper.admin.AdminLoginLogMapper;
import com.neighborhood.app.mapper.admin.AdminOperationLogMapper;
import com.neighborhood.app.service.AdminLogQueryService;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** 文件作用：管理端Log查询服务实现。 */
@Service
@RequiredArgsConstructor
public class AdminLogQueryServiceImpl implements AdminLogQueryService {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final AdminLoginLogMapper adminLoginLogMapper;
    private final AdminOperationLogMapper adminOperationLogMapper;

    public List<Map<String, Object>> listLoginLogs() {
        return adminLoginLogMapper.selectList(new QueryWrapper<AdminLoginLog>()
                        .orderByDesc("create_time")
                        .last("LIMIT 200"))
                .stream()
                .map(this::toLoginItem)
                .toList();
    }

    public List<Map<String, Object>> listOperationLogs() {
        return adminOperationLogMapper.selectList(new QueryWrapper<AdminOperationLog>()
                        .orderByDesc("create_time")
                        .last("LIMIT 200"))
                .stream()
                .map(this::toOperationItem)
                .toList();
    }

    public int deleteOperationLogsOlderThan(int days) {
        if (days <= 0) {
            return 0;
        }
        return adminOperationLogMapper.delete(new LambdaQueryWrapper<AdminOperationLog>()
                .lt(AdminOperationLog::getCreateTime, LocalDateTime.now().minusDays(days)));
    }

    private Map<String, Object> toLoginItem(AdminLoginLog item) {
        Map<String, Object> row = baseLogItem(item.getId(), item.getIp(), item.getCreateTime(), item.getStatus());
        row.put("userId", empty(item.getUserId()));
        row.put("username", empty(item.getUsername()));
        row.put("device", empty(item.getDevice()));
        row.put("location", empty(item.getLocation()));
        row.put("failReason", empty(item.getFailReason()));
        return row;
    }

    private Map<String, Object> toOperationItem(AdminOperationLog item) {
        Map<String, Object> row = baseLogItem(item.getId(), item.getIp(), item.getCreateTime(), item.getStatus());
        row.put("operator", empty(item.getOperator()));
        row.put("role", empty(item.getRoleName()));
        row.put("action", empty(item.getActionName()));
        row.put("target", empty(item.getTarget()));
        row.put("details", empty(item.getDetails()));
        return row;
    }

    private Map<String, Object> baseLogItem(Long id, String ip, LocalDateTime createTime, String status) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", value(id));
        row.put("ip", empty(ip));
        row.put("time", time(createTime));
        row.put("status", empty(status));
        return row;
    }

    private String time(LocalDateTime value) {
        return value == null ? "" : value.format(FORMATTER);
    }

    private String empty(String value) {
        return value == null ? "" : value;
    }

    private String value(Long value) {
        return value == null ? "" : String.valueOf(value);
    }
}
