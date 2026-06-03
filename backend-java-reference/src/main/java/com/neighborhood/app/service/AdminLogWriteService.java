package com.neighborhood.app.service;

import com.neighborhood.app.messaging.AdminLogMessage;

public interface AdminLogWriteService {
    void saveLoginLog(AdminLogMessage message);
    void saveOperationLog(AdminLogMessage message);
}