/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.Notification;
import java.util.List;

public interface NotificationService extends IService<Notification> {
    List<Notification> listByUserId(String userId);
    boolean markRead(Long id);
    boolean markAllRead(String userId);
    void saveNotification(String userId, String title, String content, String serviceName);
}