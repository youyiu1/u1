package com.neighborhood.app.service;

import com.neighborhood.app.entity.message.Message;
import com.neighborhood.app.entity.service.Notification;

/** 实时推送服务接口。 */
public interface RealtimePushService {
    void pushMessage(Message message);

    void pushNotification(Notification notification);
}
