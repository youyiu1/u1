package com.neighborhood.app.service.impl;

import com.neighborhood.app.messaging.AdminLogMessage;
import com.neighborhood.app.service.AdminLogWriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

/** 文件作用：管理端Log写入服务实现。 */
@Service
@RequiredArgsConstructor
public class AdminLogWriteServiceImpl implements AdminLogWriteService {

    private final JdbcTemplate jdbcTemplate;

    public void saveLoginLog(AdminLogMessage message) {
        jdbcTemplate.update(
                "INSERT INTO t_admin_login_log(user_id,username,ip,device,location,status,fail_reason) VALUES(?,?,?,?,?,?,?)",
                defaultValue(message.getUserId()),
                defaultValue(message.getUsername()),
                defaultValue(message.getIp()),
                defaultValue(message.getDevice()),
                "本地",
                defaultValue(message.getStatus()),
                defaultValue(message.getFailReason())
        );
    }

    public void saveOperationLog(AdminLogMessage message) {
        jdbcTemplate.update(
                "INSERT INTO t_admin_operation_log(operator,role_name,action_name,target,ip,status,details) VALUES(?,?,?,?,?,?,?)",
                defaultValue(message.getOperator()),
                defaultValue(message.getRole()),
                defaultValue(message.getAction()),
                defaultValue(message.getTarget()),
                defaultValue(message.getIp()),
                defaultStatus(message.getStatus()),
                defaultValue(message.getDetails())
        );
    }

    private String defaultValue(String value) {
        return value == null ? "" : value;
    }

    private String defaultStatus(String value) {
        return value == null || value.isBlank() ? "success" : value;
    }
}
