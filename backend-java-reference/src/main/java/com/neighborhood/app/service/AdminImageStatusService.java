package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.admin.AdminImageStatus;

import java.util.Collection;
import java.util.Map;

public interface AdminImageStatusService extends IService<AdminImageStatus> {
    void saveStatus(String imageUrl, String status);
    void deleteStatus(String imageUrl);
    Map<String, String> loadStatusMap(Collection<String> imageUrls);
}