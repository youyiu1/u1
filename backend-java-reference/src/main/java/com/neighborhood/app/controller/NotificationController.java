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

    public static class SendNotificationRequest {
        private String userId;
        private String title;
        private String content;
        private String serviceName;
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getServiceName() { return serviceName; }
        public void setServiceName(String serviceName) { this.serviceName = serviceName; }
    }

    public static class ProcessNotificationRequest {
        private Long notificationId;
        private boolean accept;
        private String buyerId;
        private String sellerId;
        private Long serviceId;
        private String serviceTitle;
        private String price;
        private String bookingDate;
        private String bookingTime;
        private Integer duration;
        public Long getNotificationId() { return notificationId; }
        public void setNotificationId(Long notificationId) { this.notificationId = notificationId; }
        public boolean isAccept() { return accept; }
        public void setAccept(boolean accept) { this.accept = accept; }
        public String getBuyerId() { return buyerId; }
        public void setBuyerId(String buyerId) { this.buyerId = buyerId; }
        public String getSellerId() { return sellerId; }
        public void setSellerId(String sellerId) { this.sellerId = sellerId; }
        public Long getServiceId() { return serviceId; }
        public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
        public String getServiceTitle() { return serviceTitle; }
        public void setServiceTitle(String serviceTitle) { this.serviceTitle = serviceTitle; }
        public String getPrice() { return price; }
        public void setPrice(String price) { this.price = price; }
        public String getBookingDate() { return bookingDate; }
        public void setBookingDate(String bookingDate) { this.bookingDate = bookingDate; }
        public String getBookingTime() { return bookingTime; }
        public void setBookingTime(String bookingTime) { this.bookingTime = bookingTime; }
        public Integer getDuration() { return duration; }
        public void setDuration(Integer duration) { this.duration = duration; }
    }
}