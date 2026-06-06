/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.service.Notification;
import java.util.List;

/** 通知服务接口。 */
public interface NotificationService extends IService<Notification> {
    List<Notification> listByUserId(String userId);

    boolean markRead(Long id);

    boolean markAllRead(String userId);

    void saveNotification(String userId, String title, String content, String serviceName);

    void saveNotificationWithBooking(String userId, String title, String content, String serviceName, Long bookingId);

    void saveNotificationWithMarketItem(
            String userId,
            String title,
            String content,
            String serviceName,
            String relatedUserId,
            Long marketItemId
    );

    boolean hasPendingMarketPurchaseRequest(String sellerId, String buyerId, Long marketItemId);

    boolean processNotification(
            Long notificationId,
            String operatorUserId,
            boolean accept,
            String buyerId,
            String sellerId,
            Long serviceId,
            String serviceTitle,
            String price,
            String bookingDate,
            String bookingTime,
            Integer duration
    );
}
