/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.Notification;
import com.neighborhood.app.mapper.NotificationMapper;
import com.neighborhood.app.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl extends ServiceImpl<NotificationMapper, Notification> implements NotificationService {

    private static final int RETENTION_DAYS = 7;

    @Override
    public List<Notification> listByUserId(String userId) {
        return lambdaQuery()
                .eq(Notification::getUserId, userId)
                .orderByDesc(Notification::getTime)
                .list();
    }

    @Override
    public boolean markRead(Long id) {
        return lambdaUpdate()
                .eq(Notification::getId, id)
                .set(Notification::getIsRead, true)
                .update();
    }

    @Override
    public boolean markAllRead(String userId) {
        return lambdaUpdate()
                .eq(Notification::getUserId, userId)
                .set(Notification::getIsRead, true)
                .update();
    }

    @Override
    public void saveNotification(String userId, String title, String content, String serviceName) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setServiceName(serviceName);
        notification.setTime(LocalDateTime.now());
        notification.setIsRead(false);
        save(notification);
    }

    /**
     * 每天凌晨2点清理7天前的通知
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanExpiredNotifications() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(RETENTION_DAYS);
        lambdaUpdate()
                .lt(Notification::getTime, threshold)
                .remove();
    }
}