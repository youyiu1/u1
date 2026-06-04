package com.neighborhood.app.controller.client;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.common.ResultUtils;
import com.neighborhood.app.dto.notification.ProcessNotificationRequest;
import com.neighborhood.app.dto.notification.SendNotificationRequest;
import com.neighborhood.app.entity.service.Notification;
import com.neighborhood.app.service.NotificationService;
import com.neighborhood.app.utils.RequestUserUtil;
import jakarta.servlet.http.HttpServletRequest;
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
    public Result<List<Notification>> list(
            @RequestParam(required = false) String userId,
            HttpServletRequest request) {
        return Result.ok(notificationService.listByUserId(RequestUserUtil.getEffectiveUserId(request, userId)));
    }

    @PostMapping("/{id}/read")
    public Result<Boolean> markRead(@PathVariable Long id) {
        return ResultUtils.bool(notificationService.markRead(id));
    }

    @PostMapping("/read-all")
    public Result<Boolean> markAllRead(
            @RequestParam(required = false) String userId,
            HttpServletRequest request) {
        return ResultUtils.bool(notificationService.markAllRead(RequestUserUtil.getEffectiveUserId(request, userId)));
    }

    /** 发送通知给用户。 */
    @PostMapping("/send")
    public Result<Boolean> send(@RequestBody SendNotificationRequest request) {
        notificationService.saveNotification(
                request.getUserId(),
                request.getTitle(),
                request.getContent(),
                request.getServiceName()
        );
        return ResultUtils.bool(true);
    }

    /** 处理预约通知，同意或拒绝。 */
    @PostMapping("/process")
    public Result<Boolean> process(@RequestBody ProcessNotificationRequest request) {
        return ResultUtils.bool(notificationService.processNotification(
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
}