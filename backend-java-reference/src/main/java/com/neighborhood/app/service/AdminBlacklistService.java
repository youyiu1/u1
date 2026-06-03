package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.admin.AdminBlacklist;

import java.util.List;
import java.util.Map;

public interface AdminBlacklistService extends IService<AdminBlacklist> {
    List<Map<String, Object>> listItems();
    void addItem(String targetType, String targetValue, String reason, String creator);
    void deleteItem(Long id);
}