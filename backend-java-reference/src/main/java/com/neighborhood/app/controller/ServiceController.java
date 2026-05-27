/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.entity.ServiceEntity;
import com.neighborhood.app.entity.ServiceDetailVO;
import com.neighborhood.app.entity.ServiceReview;
import com.neighborhood.app.service.ServiceModuleService;
import com.neighborhood.app.service.ServiceReviewService;
import com.neighborhood.app.service.NotificationService;
import com.neighborhood.app.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/service")
public class ServiceController {

    @Autowired
    private ServiceModuleService serviceModuleService;
    @Autowired
    private ServiceReviewService serviceReviewService;
    @Autowired
    private NotificationService notificationService;

    @GetMapping("/list")
    public Result<List<ServiceEntity>> list() {
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
    public Result<ServiceDetailVO> getById(@PathVariable Long id,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        return Result.ok(serviceModuleService.getServiceDetail(id, lat, lng));
    }

    /**
     * 获取服务评价列表
     */
    @GetMapping("/{id}/reviews")
    public Result<List<ServiceReview>> getReviews(@PathVariable Long id) {
        return Result.ok(serviceReviewService.getByServiceId(id));
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
            // 更新服务评分
            List<ServiceReview> reviews = serviceReviewService.getByServiceId(id);
            double avgRating = reviews.stream().mapToInt(ServiceReview::getRating).average().orElse(0);
            ServiceEntity service = serviceModuleService.getById(id);
            if (service != null) {
                service.setRating(avgRating);
                service.setReviews(reviews.size());
                serviceModuleService.updateById(service);
            }
        }
        return Result.ok(success);
    }

    /**
     * 评价点赞
     */
    @PostMapping("/review/{id}/like")
    public Result<Boolean> likeReview(@PathVariable Long id) {
        return Result.ok(serviceReviewService.likeReview(id));
    }

    /**
     * 取消评价点赞
     */
    @PostMapping("/review/{id}/unlike")
    public Result<Boolean> unlikeReview(@PathVariable Long id) {
        return Result.ok(serviceReviewService.unlikeReview(id));
    }

    @PostMapping("/create")
    public Result<Boolean> create(@RequestBody ServiceEntity service, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        service.setSellerId(userId);
        return Result.ok(serviceModuleService.save(service));
    }

    @PostMapping("/book")
    public Result<Boolean> book(@RequestBody BookingRequest request) {
        Long serviceId = Long.parseLong(request.getServiceId());
        boolean success = serviceModuleService.book(
            serviceId,
            request.getBuyerId(),
            request.getSellerId(),
            request.getBookingDate(),
            request.getBookingTime(),
            request.getDuration()
        );
        if (success) {
            ServiceEntity service = serviceModuleService.getById(serviceId);
            String serviceName = service != null ? service.getTitle() : "";
            // 通知买家
            notificationService.saveNotification(
                request.getBuyerId(),
                "预约成功",
                "您已成功预约服务，请等待服务商确认。",
                serviceName
            );
            // 通知卖家
            notificationService.saveNotification(
                request.getSellerId(),
                "新预约通知",
                "您有新的服务预约，请及时处理。",
                serviceName
            );
        }
        return Result.ok(success);
    }

    public static class BookingRequest {
        private String serviceId;
        private String buyerId;
        private String sellerId;
        private String bookingDate;
        private String bookingTime;
        private Integer duration;

        public String getServiceId() { return serviceId; }
        public void setServiceId(String serviceId) { this.serviceId = serviceId; }
        public String getBuyerId() { return buyerId; }
        public void setBuyerId(String buyerId) { this.buyerId = buyerId; }
        public String getSellerId() { return sellerId; }
        public void setSellerId(String sellerId) { this.sellerId = sellerId; }
        public String getBookingDate() { return bookingDate; }
        public void setBookingDate(String bookingDate) { this.bookingDate = bookingDate; }
        public String getBookingTime() { return bookingTime; }
        public void setBookingTime(String bookingTime) { this.bookingTime = bookingTime; }
        public Integer getDuration() { return duration; }
        public void setDuration(Integer duration) { this.duration = duration; }
    }

    public static class AddReviewRequest {
        private String userId;
        private String userName;
        private String userAvatar;
        private Integer rating;
        private String content;
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getUserAvatar() { return userAvatar; }
        public void setUserAvatar(String userAvatar) { this.userAvatar = userAvatar; }
        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}