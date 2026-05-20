/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

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
}