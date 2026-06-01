/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.dto.AddReviewRequest;
import com.neighborhood.app.dto.BookingRequest;
import com.neighborhood.app.entity.ServiceEntity;
import com.neighborhood.app.vo.ServiceDetailVO;
import com.neighborhood.app.entity.ServiceReview;
import com.neighborhood.app.entity.User;
import com.neighborhood.app.service.ServiceModuleService;
import com.neighborhood.app.service.ServiceReviewService;
import com.neighborhood.app.service.NotificationService;
import com.neighborhood.app.service.UserService;
import com.neighborhood.app.common.Result;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/service")
public class ServiceController {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Autowired
    private ServiceModuleService serviceModuleService;
    @Autowired
    private ServiceReviewService serviceReviewService;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private UserService userService;

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
    public Result<ServiceDetailVO> getById(@PathVariable Long id,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        return Result.ok(serviceModuleService.getServiceDetail(id, lat, lng));
    }

    /**
     * 获取服务评价列表（带当前用户点赞状态）
     */
    @GetMapping("/{id}/reviews")
    public Result<List<Map<String, Object>>> getReviews(@PathVariable Long id, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        if (userId != null) {
            return Result.ok(serviceReviewService.getByServiceIdWithLikeStatus(id, userId));
        }
        return Result.ok(serviceReviewService.getByServiceId(id).stream()
                .map(this::toReviewResponse)
                .toList());
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
    public Result<Boolean> likeReview(@PathVariable Long id, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return Result.ok(serviceReviewService.likeReview(id, userId));
    }

    /**
     * 取消评价点赞
     */
    @PostMapping("/review/{id}/unlike")
    public Result<Boolean> unlikeReview(@PathVariable Long id, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        return Result.ok(serviceReviewService.unlikeReview(id, userId));
    }

    @PostMapping("/create")
    public Result<Boolean> create(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        ServiceEntity service = new ServiceEntity();
        service.setSellerId(userId);
        service.setTitle(str(body.get("title")));
        service.setDescription(str(body.get("description")));
        service.setCategory(str(body.get("category")));
        service.setUnit(str(body.get("unit")));
        service.setDistance(str(body.get("distance")));
        service.setPrice(toBigDecimal(body.get("price")));
        service.setHighlights(normalizeJsonArray(body.get("highlights")));
        service.setImages(toStringList(body.get("images")));
        service.setLatitude(toDouble(body.get("latitude")));
        service.setLongitude(toDouble(body.get("longitude")));
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
            String serviceName = service != null ? service.getTitle() : "";
            User buyer = userService.getById(request.getBuyerId());
            String buyerName = buyer != null ? buyer.getName() : "用户";
            // 通知买家
            notificationService.saveNotification(
                request.getBuyerId(),
                "预约成功",
                "您已成功预约服务，请等待服务商确认。",
                serviceName
            );
            // 通知卖家
            notificationService.saveNotificationWithBooking(
                request.getSellerId(),
                "新预约请求",
                "用户 " + buyerName + " 预约了您的服务「" + serviceName + "」，时间：" + request.getBookingDate() + " " + request.getBookingTime(),
                serviceName,
                bookingId
            );
        }
        return Result.ok(bookingId != null);
    }

    private Map<String, Object> toReviewResponse(ServiceReview review) {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", review.getId());
        map.put("serviceId", review.getServiceId());
        map.put("userId", review.getUserId());
        map.put("userName", review.getUserName());
        map.put("userAvatar", review.getUserAvatar());
        map.put("rating", review.getRating());
        map.put("content", review.getContent());
        map.put("likes", review.getLikes());
        map.put("createTime", review.getCreateTime());
        map.put("isLiked", false);
        return map;
    }

    private String str(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        if (value instanceof BigDecimal decimal) {
            return decimal;
        }
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        try {
            return new BigDecimal(String.valueOf(value).trim());
        } catch (Exception ignored) {
            return BigDecimal.ZERO;
        }
    }

    private Double toDouble(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        try {
            return Double.valueOf(String.valueOf(value).trim());
        } catch (Exception ignored) {
            return null;
        }
    }

    private String normalizeJsonArray(Object value) {
        if (value == null) {
            return "[]";
        }
        if (value instanceof String stringVal) {
            String trimmed = stringVal.trim();
            if (trimmed.isEmpty()) {
                return "[]";
            }
            if (trimmed.startsWith("[")) {
                return trimmed;
            }
            return "[\"" + trimmed.replace("\"", "\\\"") + "\"]";
        }
        try {
            return OBJECT_MAPPER.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private List<String> toStringList(Object value) {
        if (value == null) {
            return Collections.emptyList();
        }
        if (value instanceof List<?> listVal) {
            List<String> list = new ArrayList<>();
            for (Object item : listVal) {
                if (item == null) {
                    continue;
                }
                String str = String.valueOf(item).trim();
                if (!str.isEmpty()) {
                    list.add(str);
                }
            }
            return list;
        }
        String stringVal = String.valueOf(value).trim();
        if (stringVal.isEmpty()) {
            return Collections.emptyList();
        }
        if (stringVal.startsWith("[")) {
            try {
                List<String> parsed = OBJECT_MAPPER.readValue(stringVal, new TypeReference<List<String>>() {});
                return parsed == null ? Collections.emptyList() : parsed;
            } catch (Exception ignored) {
            }
        }
        return List.of(stringVal);
    }
}

