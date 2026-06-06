package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.admin.AdminImageStatus;
import java.util.Collection;
import java.util.Map;

/** 文件作用：管理端图片状态服务接口。 */
public interface AdminImageStatusService extends IService<AdminImageStatus> {
    void saveStatus(String imageUrl, String status);
    void deleteStatus(String imageUrl);
    Map<String, String> loadStatusMap(Collection<String> imageUrls);
}
