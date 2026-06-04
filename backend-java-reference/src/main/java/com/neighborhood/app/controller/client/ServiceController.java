package com.neighborhood.app.controller.client;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.common.ResultUtils;
import com.neighborhood.app.dto.service.AddReviewRequest;
import com.neighborhood.app.dto.service.BookingRequest;
import com.neighborhood.app.entity.service.ServiceEntity;
import com.neighborhood.app.entity.service.ServiceReview;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.service.NotificationService;
import com.neighborhood.app.service.ServiceModuleService;
import com.neighborhood.app.service.ServiceReviewService;
import com.neighborhood.app.service.UserService;
import com.neighborhood.app.utils.RequestUserUtil;
import com.neighborhood.app.utils.RequestValueUtil;
import com.neighborhood.app.utils.ServiceReviewResponseUtil;
import com.neighborhood.app.vo.service.ServiceDetailVO;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/service")
@RequiredArgsConstructor
public class ServiceController {

    private static final String BOOKING_SUCCESS_TITLE = "预约成功";
    private static final String BOOKING_REQUEST_TITLE = "新的预约请求";

    private final ServiceModuleService serviceModuleService;
    private final ServiceReviewService serviceReviewService;
    private final NotificationService notificationService;
    private final UserService userService;

    /** 获取服务列表。 */
    @GetMapping("/list")
    public Result<List<ServiceEntity>> list(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        if (lat != null && lng != null) {
            return ResultUtils.ok(serviceModuleService.listWithDistance(lat, lng));
        }
        return ResultUtils.ok(serviceModuleService.list());
    }

    /** 获取用户发布的服务列表。 */
    @GetMapping("/user/{userId}")
    public Result<List<ServiceEntity>> listByUserId(@PathVariable String userId) {
        return ResultUtils.ok(serviceModuleService.listByUserId(userId));
    }

    /** 获取服务详情。 */
    @GetMapping("/{id}")
    public Result<ServiceDetailVO> getById(
            @PathVariable Long id,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        return ResultUtils.ok(serviceModuleService.getServiceDetail(id, lat, lng));
    }

    /** 获取服务评价列表。 */
    @GetMapping("/{id}/reviews")
    public Result<List<Map<String, Object>>> getReviews(@PathVariable Long id, HttpServletRequest request) {
        String userId = RequestUserUtil.currentUserId(request);
        if (userId != null && !userId.isBlank()) {
            return ResultUtils.ok(serviceReviewService.getByServiceIdWithLikeStatus(id, userId));
        }
        return ResultUtils.ok(mapReviews(serviceReviewService.getByServiceId(id)));
    }

    /** 新增服务评价。 */
    @PostMapping("/{id}/review")
    public Result<Boolean> addReview(@PathVariable Long id, @RequestBody AddReviewRequest request, HttpServletRequest httpRequest) {
        User user = userService.getById(RequestUserUtil.currentUserId(httpRequest));
        if (user == null) {
            return ResultUtils.fail("用户不存在");
        }
        boolean success = serviceReviewService.addReview(
                id,
                user.getId(),
                user.getName(),
                user.getAvatar(),
                request.getRating(),
                request.getContent()
        );
        if (success) {
            serviceReviewService.refreshServiceStats(id);
        }
        return ResultUtils.bool(success);
    }

    /** 点赞服务评价。 */
    @PostMapping("/review/{id}/like")
    public Result<Boolean> likeReview(@PathVariable Long id, HttpServletRequest request) {
        return ResultUtils.bool(serviceReviewService.likeReview(id, RequestUserUtil.currentUserId(request)));
    }

    /** 取消点赞服务评价。 */
    @PostMapping("/review/{id}/unlike")
    public Result<Boolean> unlikeReview(@PathVariable Long id, HttpServletRequest request) {
        return ResultUtils.bool(serviceReviewService.unlikeReview(id, RequestUserUtil.currentUserId(request)));
    }

    /** 创建服务。 */
    @PostMapping("/create")
    public Result<Boolean> create(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        ServiceEntity service = new ServiceEntity();
        service.setSellerId(RequestUserUtil.currentUserId(request));
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
        return ResultUtils.bool(serviceModuleService.save(service));
    }

    /** 提交服务预约。 */
    @PostMapping("/book")
    public Result<Boolean> book(@RequestBody BookingRequest request, HttpServletRequest httpRequest) {
        Long serviceId = Long.parseLong(request.getServiceId());
        ServiceEntity service = serviceModuleService.getById(serviceId);
        if (service == null) {
            return ResultUtils.fail("服务不存在");
        }
        String buyerId = RequestUserUtil.currentUserId(httpRequest);
        String sellerId = service.getSellerId();
        Long bookingId = serviceModuleService.book(
                serviceId,
                buyerId,
                sellerId,
                request.getBookingDate(),
                request.getBookingTime(),
                request.getDuration()
        );
        if (bookingId != null) {
            User buyer = userService.getById(buyerId);
            notifyBookingCreated(
                    buyerId,
                    sellerId,
                    request,
                    bookingId,
                    service == null ? "" : service.getTitle(),
                    buyer == null ? "用户" : buyer.getName()
            );
        }
        return ResultUtils.bool(bookingId != null);
    }

    private List<Map<String, Object>> mapReviews(List<ServiceReview> reviews) {
        return reviews.stream()
                .map(review -> ServiceReviewResponseUtil.toReviewResponse(review, false))
                .toList();
    }

    private void notifyBookingCreated(
            String buyerId,
            String sellerId,
            BookingRequest request,
            Long bookingId,
            String serviceName,
            String buyerName
    ) {
        notificationService.saveNotification(
                buyerId,
                BOOKING_SUCCESS_TITLE,
                "您已成功预约服务，请等待服务商确认。",
                serviceName
        );
        notificationService.saveNotificationWithBooking(
                sellerId,
                BOOKING_REQUEST_TITLE,
                "用户 " + buyerName + " 预约了您的服务《" + serviceName + "》，时间：" + request.getBookingDate() + " " + request.getBookingTime(),
                serviceName,
                bookingId
        );
    }
}
