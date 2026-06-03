/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller.client;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.dto.service.AddReviewRequest;
import com.neighborhood.app.dto.service.BookingRequest;
import com.neighborhood.app.entity.service.ServiceEntity;
import com.neighborhood.app.entity.service.ServiceReview;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.service.NotificationService;
import com.neighborhood.app.service.ServiceModuleService;
import com.neighborhood.app.service.ServiceReviewService;
import com.neighborhood.app.service.UserService;
import com.neighborhood.app.utils.RequestValueUtil;
import com.neighborhood.app.utils.ServiceReviewResponseUtil;
import com.neighborhood.app.vo.service.ServiceDetailVO;
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
import java.util.Map;

@RestController
@RequestMapping("/api/service")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceModuleService serviceModuleService;
    private final ServiceReviewService serviceReviewService;
    private final NotificationService notificationService;
    private final UserService userService;

    @GetMapping("/list")
    public Result<List<ServiceEntity>> list(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        if (lat != null && lng != null) {
            return Result.ok(serviceModuleService.listWithDistance(lat, lng));
        }
        return Result.ok(serviceModuleService.list());
    }

    /**
     * 获取用户服务列表
     */
    @GetMapping("/user/{userId}")
    public Result<List<ServiceEntity>> listByUserId(@PathVariable String userId) {
        return Result.ok(serviceModuleService.listByUserId(userId));
    }

    @GetMapping("/{id}")
    public Result<ServiceDetailVO> getById(
            @PathVariable Long id,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        return Result.ok(serviceModuleService.getServiceDetail(id, lat, lng));
    }

    /**
     * 获取服务评价列表（带当前用户点赞状态）
     */
    @GetMapping("/{id}/reviews")
    public Result<List<Map<String, Object>>> getReviews(@PathVariable Long id, HttpServletRequest request) {
        String userId = requestUserId(request);
        if (userId != null) {
            return Result.ok(serviceReviewService.getByServiceIdWithLikeStatus(id, userId));
        }
        return Result.ok(mapReviews(serviceReviewService.getByServiceId(id)));
    }

    /**
     * 添加服务评价
     */
    @PostMapping("/{id}/review")
    public Result<Boolean> addReview(@PathVariable Long id, @RequestBody AddReviewRequest request) {
        boolean success = serviceReviewService.addReview(
                id,
                request.getUserId(),
                request.getUserName(),
                request.getUserAvatar(),
                request.getRating(),
                request.getContent()
        );
        if (success) {
            serviceReviewService.refreshServiceStats(id);
        }
        return Result.ok(success);
    }

    /**
     * 评价点赞
     */
    @PostMapping("/review/{id}/like")
    public Result<Boolean> likeReview(@PathVariable Long id, HttpServletRequest request) {
        return Result.ok(serviceReviewService.likeReview(id, requestUserId(request)));
    }

    /**
     * 取消评价点赞
     */
    @PostMapping("/review/{id}/unlike")
    public Result<Boolean> unlikeReview(@PathVariable Long id, HttpServletRequest request) {
        return Result.ok(serviceReviewService.unlikeReview(id, requestUserId(request)));
    }

    @PostMapping("/create")
    public Result<Boolean> create(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        ServiceEntity service = new ServiceEntity();
        service.setSellerId(requestUserId(request));
        service.setTitle(RequestValueUtil.str(body.get("title")));
        service.setDescription(RequestValueUtil.str(body.get("description")));
        service.setCategory(RequestValueUtil.str(body.get("category")));
        service.setUnit(RequestValueUtil.str(body.get("unit")));
        service.setDistance(RequestValueUtil.str(body.get("distance")));
        service.setPrice(RequestValueUtil.toBigDecimal(body.get("price")));
        service.setHighlights(RequestValueUtil.normalizeJsonArray(body.get("highlights")));
        service.setImages(RequestValueUtil.toStringList(body.get("images")));
        service.setLatitude(RequestValueUtil.toDouble(body.get("latitude")));
        service.setLongitude(RequestValueUtil.toDouble(body.get("longitude")));
        return Result.ok(serviceModuleService.save(service));
    }

    @PostMapping("/book")
    public Result<Boolean> book(@RequestBody BookingRequest request) {
        Long serviceId = Long.parseLong(request.getServiceId());
        Long bookingId = serviceModuleService.book(
                serviceId,
                request.getBuyerId(),
                request.getSellerId(),
                request.getBookingDate(),
                request.getBookingTime(),
                request.getDuration()
        );
        if (bookingId != null) {
            ServiceEntity service = serviceModuleService.getById(serviceId);
            User buyer = userService.getById(request.getBuyerId());
            notifyBookingCreated(
                    request,
                    bookingId,
                    service == null ? "" : service.getTitle(),
                    buyer == null ? "用户" : buyer.getName()
            );
        }
        return Result.ok(bookingId != null);
    }

    private String requestUserId(HttpServletRequest request) {
        return (String) request.getAttribute("userId");
    }

    private List<Map<String, Object>> mapReviews(List<ServiceReview> reviews) {
        return reviews.stream()
                .map(review -> ServiceReviewResponseUtil.toReviewResponse(review, false))
                .toList();
    }

    private void notifyBookingCreated(BookingRequest request, Long bookingId, String serviceName, String buyerName) {
        notificationService.saveNotification(
                request.getBuyerId(),
                "预约成功",
                "您已成功预约服务，请等待服务商确认。",
                serviceName
        );
        notificationService.saveNotificationWithBooking(
                request.getSellerId(),
                "新预约请求",
                "用户 " + buyerName + " 预约了您的服务《" + serviceName + "》，时间：" + request.getBookingDate() + " " + request.getBookingTime(),
                serviceName,
                bookingId
        );
    }
}
