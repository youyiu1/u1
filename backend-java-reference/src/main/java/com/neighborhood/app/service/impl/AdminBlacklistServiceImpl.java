package com.neighborhood.app.service.impl;

import com.neighborhood.app.service.AdminBlacklistService;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.admin.AdminBlacklist;
import com.neighborhood.app.mapper.admin.AdminBlacklistMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminBlacklistServiceImpl extends ServiceImpl<AdminBlacklistMapper, AdminBlacklist> implements AdminBlacklistService {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public List<Map<String, Object>> listItems() {
        return lambdaQuery()
                .orderByDesc(AdminBlacklist::getCreateTime)
                .list()
                .stream()
                .map(this::toItem)
                .toList();
    }

    public void addItem(String targetType, String targetValue, String reason, String creator) {
        AdminBlacklist item = new AdminBlacklist();
        item.setTargetType(targetType);
        item.setTargetValue(targetValue);
        item.setReason(reason);
        item.setCreator(creator);
        save(item);
    }

    public void deleteItem(Long id) {
        removeById(id);
    }

    private Map<String, Object> toItem(AdminBlacklist item) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", item.getId() == null ? "" : String.valueOf(item.getId()));
        row.put("targetType", empty(item.getTargetType()));
        row.put("targetValue", empty(item.getTargetValue()));
        row.put("reason", empty(item.getReason()));
        row.put("creator", empty(item.getCreator()));
        row.put("time", item.getCreateTime() == null ? "" : item.getCreateTime().format(FORMATTER));
        return row;
    }

    private String empty(String value) {
        return value == null ? "" : value;
    }
}
