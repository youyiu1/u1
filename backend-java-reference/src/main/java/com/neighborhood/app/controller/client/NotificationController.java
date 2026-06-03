/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller.client;

import com.neighborhood.app.dto.notification.ProcessNotificationRequest;
import com.neighborhood.app.dto.notification.SendNotificationRequest;
import com.neighborhood.app.entity.service.Notification;
import com.neighborhood.app.service.NotificationService;
import com.neighborhood.app.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/notification")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/list")
    public Result<List<Notification>> list(@RequestParam String userId) {
        return Result.ok(notificationService.listByUserId(userId));
    }

    @PostMapping("/{id}/read")
    public Result<Boolean> markRead(@PathVariable Long id) {
        return booleanResult(notificationService.markRead(id));
    }

    @PostMapping("/read-all")
    public Result<Boolean> markAllRead(@RequestParam String userId) {
        return booleanResult(notificationService.markAllRead(userId));
    }

    /**
     * 发送通知给用户
     */
    @PostMapping("/send")
    public Result<Boolean> send(@RequestBody SendNotificationRequest request) {
        notificationService.saveNotification(request.getUserId(), request.getTitle(), request.getContent(), request.getServiceName());
        return booleanResult(true);
    }

    /**
     * 处理预约通知（同意或拒绝）
     */
    @PostMapping("/process")
    public Result<Boolean> process(@RequestBody ProcessNotificationRequest request) {
        return booleanResult(notificationService.processNotification(
            request.getNotificationId(),
            request.isAccept(),
            request.getBuyerId(),
            request.getSellerId(),
            request.getServiceId(),
            request.getServiceTitle(),
            request.getPrice(),
            request.getBookingDate(),
            request.getBookingTime(),
            request.getDuration()
        ));
    }

    private Result<Boolean> booleanResult(boolean success) {
        return Result.ok(success);
    }
}
