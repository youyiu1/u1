package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.admin.AdminImageStatus;
import com.neighborhood.app.mapper.admin.AdminImageStatusMapper;
import com.neighborhood.app.service.AdminImageStatusService;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** 文件作用：管理端图片状态服务实现。 */
@Service
@RequiredArgsConstructor
public class AdminImageStatusServiceImpl extends ServiceImpl<AdminImageStatusMapper, AdminImageStatus> implements AdminImageStatusService {

    public void saveStatus(String imageUrl, String status) {
        AdminImageStatus existing = lambdaQuery()
                .eq(AdminImageStatus::getImageUrl, imageUrl)
                .one();
        if (existing == null) {
            AdminImageStatus item = new AdminImageStatus();
            item.setImageUrl(imageUrl);
            item.setStatus(status);
            save(item);
            return;
        }
        lambdaUpdate()
                .eq(AdminImageStatus::getImageUrl, imageUrl)
                .set(AdminImageStatus::getStatus, status)
                .update();
    }

    public void deleteStatus(String imageUrl) {
        remove(new LambdaQueryWrapper<AdminImageStatus>()
                .eq(AdminImageStatus::getImageUrl, imageUrl));
    }

    public Map<String, String> loadStatusMap(Collection<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return Map.of();
        }
        List<AdminImageStatus> rows = lambdaQuery()
                .in(AdminImageStatus::getImageUrl, imageUrls)
                .list();
        Map<String, String> result = new LinkedHashMap<>(rows.size());
        for (AdminImageStatus row : rows) {
            result.put(empty(row.getImageUrl()), emptyDefault(row.getStatus(), "approved"));
        }
        return result;
    }

    private String empty(String value) {
        return value == null ? "" : value;
    }

    private String emptyDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
