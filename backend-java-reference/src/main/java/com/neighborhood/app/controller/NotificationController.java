/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.dto.ProcessNotificationRequest;
import com.neighborhood.app.dto.SendNotificationRequest;
import com.neighborhood.app.entity.Notification;
import com.neighborhood.app.service.NotificationService;
import com.neighborhood.app.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
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
        return Result.ok(notificationService.markRead(id));
    }

    @PostMapping("/read-all")
    public Result<Boolean> markAllRead(@RequestParam String userId) {
        return Result.ok(notificationService.markAllRead(userId));
    }

    /**
     * 发送通知给用户
     */
    @PostMapping("/send")
    public Result<Boolean> send(@RequestBody SendNotificationRequest request) {
        notificationService.saveNotification(request.getUserId(), request.getTitle(), request.getContent(), request.getServiceName());
        return Result.ok(true);
    }

    /**
     * 处理预约通知（同意或拒绝）
     */
    @PostMapping("/process")
    public Result<Boolean> process(@RequestBody ProcessNotificationRequest request) {
        boolean success = notificationService.processNotification(
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
        );
        return Result.ok(success);
    }
}
