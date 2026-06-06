package com.neighborhood.app.service;

import com.neighborhood.app.messaging.AdminLogMessage;

/** 文件作用：管理端Log写入服务接口。 */
public interface AdminLogWriteService {
    void saveLoginLog(AdminLogMessage message);
    void saveOperationLog(AdminLogMessage message);
}
