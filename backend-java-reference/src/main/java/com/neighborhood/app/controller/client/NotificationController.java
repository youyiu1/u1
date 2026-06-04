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
            HttpServletRequest request
    ) {
        return Result.ok(notificationService.listByUserId(effectiveUserId(request, userId)));
    }

    @PostMapping("/{id}/read")
    public Result<Boolean> markRead(@PathVariable Long id, HttpServletRequest request) {
        if (!ownsNotification(id, RequestUserUtil.currentUserId(request))) {
            return ResultUtils.fail("无权操作该通知");
        }
        return ResultUtils.bool(notificationService.markRead(id));
    }

    @PostMapping("/read-all")
    public Result<Boolean> markAllRead(
            @RequestParam(required = false) String userId,
            HttpServletRequest request
    ) {
        return ResultUtils.bool(notificationService.markAllRead(RequestUserUtil.currentUserId(request)));
    }

    /** 发送通知给当前登录用户。 */
    @PostMapping("/send")
    public Result<Boolean> send(@RequestBody SendNotificationRequest request, HttpServletRequest httpRequest) {
        String userId = RequestUserUtil.currentUserId(httpRequest);
        if (request == null || userId == null || userId.isBlank() || !userId.equals(request.getUserId())) {
            return ResultUtils.fail("无权发送该通知");
        }
        notificationService.saveNotification(
                request.getUserId(),
                request.getTitle(),
                request.getContent(),
                request.getServiceName()
        );
        return ResultUtils.bool(true);
    }

    /** 处理预约通知，仅允许通知接收方处理真实预约通知。 */
    @PostMapping("/process")
    public Result<Boolean> process(@RequestBody ProcessNotificationRequest request, HttpServletRequest httpRequest) {
        String userId = RequestUserUtil.currentUserId(httpRequest);
        if (!ownsNotification(request.getNotificationId(), userId)) {
            return ResultUtils.fail("无权操作该通知");
        }
        return ResultUtils.bool(notificationService.processNotification(
                request.getNotificationId(),
                userId,
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

    private String effectiveUserId(HttpServletRequest request, String userId) {
        return RequestUserUtil.getEffectiveUserId(request, userId);
    }

    private boolean ownsNotification(Long notificationId, String userId) {
        if (notificationId == null || userId == null || userId.isBlank()) {
            return false;
        }
        Notification notification = notificationService.getById(notificationId);
        return notification != null && userId.equals(notification.getUserId());
    }
}
