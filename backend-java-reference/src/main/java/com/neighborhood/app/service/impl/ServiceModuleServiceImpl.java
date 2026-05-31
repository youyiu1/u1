/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.Booking;
import com.neighborhood.app.entity.ServiceEntity;
import com.neighborhood.app.vo.ServiceDetailVO;
import com.neighborhood.app.entity.User;
import com.neighborhood.app.mapper.BookingMapper;
import com.neighborhood.app.mapper.ServiceMapper;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.ServiceModuleService;
import com.neighborhood.app.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ServiceModuleServiceImpl extends ServiceImpl<ServiceMapper, ServiceEntity> implements ServiceModuleService {

    private final CacheService cacheService;
    private final BookingMapper bookingMapper;
    private final UserService userService;

    @Override
    public List<ServiceEntity> list() {
        List<ServiceEntity> cached = cacheService.getCachedServiceList();
        if (cached != null) {
            return cached;
        }
        List<ServiceEntity> list = lambdaQuery()
                .eq(ServiceEntity::getStatus, "active")
                .orderByDesc(ServiceEntity::getId)
                .list();
        cacheService.cacheServiceList(list);
        return list;
    }

    @Override
    public ServiceEntity getById(Long id) {
        ServiceEntity cached = cacheService.getCachedService(id);
        if (cached != null) {
            return cached;
        }
        ServiceEntity service = super.getById(id);
        if (service != null) {
            cacheService.cacheService(id, service);
        }
        return service;
    }

    /**
     * 获取服务详情（含卖家信息）
     */
    public ServiceDetailVO getServiceDetail(Long id, Double buyerLat, Double buyerLng) {
        ServiceEntity service = getById(id);
        if (service == null || !"active".equals(emptyTo(service.getStatus(), "active"))) {
            return null;
        }
        User seller = userService.getById(service.getSellerId());
        return ServiceDetailVO.fromService(service, seller, buyerLat, buyerLng);
    }

    @Override
    public boolean save(ServiceEntity service) {
        service.setStatus("pending");
        service.setRejectReason("");
        service.setRating(service.getRating() == null ? 0D : service.getRating());
        service.setReviews(service.getReviews() == null ? 0 : service.getReviews());
        boolean result = super.save(service);
        if (result) {
            cacheService.evictService(service.getId());
            cacheService.evictHomeIndex();
        }
        return result;
    }

    @Override
    public boolean updateById(ServiceEntity service) {
        boolean result = super.updateById(service);
        if (result) {
            cacheService.evictService(service.getId());
        }
        return result;
    }

    @Override
    public Long book(Long serviceId, String buyerId, String sellerId, String bookingDate, String bookingTime, Integer duration) {
        Booking booking = new Booking();
        booking.setServiceId(serviceId);
        booking.setBuyerId(buyerId);
        booking.setSellerId(sellerId);
        booking.setBookingDate(LocalDateTime.of(
            LocalDate.parse(bookingDate, DateTimeFormatter.ISO_LOCAL_DATE),
            LocalTime.parse(bookingTime, DateTimeFormatter.ISO_LOCAL_TIME)
        ));
        booking.setBookingTime(bookingTime);
        booking.setDuration(duration);
        booking.setStatus("pending");
        booking.setCreateTime(LocalDateTime.now());
        booking.setUpdateTime(LocalDateTime.now());
        return bookingMapper.insert(booking) > 0 ? booking.getId() : null;
    }

    @Override
    public List<ServiceEntity> listByUserId(String userId) {
        return lambdaQuery()
                .eq(ServiceEntity::getSellerId, userId)
                .orderByDesc(ServiceEntity::getId)
                .list();
    }

    @Override
    public List<ServiceEntity> listWithDistance(Double buyerLat, Double buyerLng) {
        List<ServiceEntity> source = list();
        List<ServiceEntity> list = new ArrayList<>(source.size());
        for (ServiceEntity item : source) {
            list.add(copyForDistance(item));
        }

        if (buyerLat == null || buyerLng == null) {
            for (ServiceEntity service : list) {
                fillUnknownDistance(service);
            }
            return list;
        }

        Map<Long, Double> distanceMap = new HashMap<>();
        for (ServiceEntity service : list) {
            applyDistance(service, buyerLat, buyerLng, distanceMap);
        }

        list.sort(Comparator.comparingDouble(service -> {
            if (service.getId() == null) {
                return Double.MAX_VALUE;
            }
            double distance = distanceMap.getOrDefault(service.getId(), Double.MAX_VALUE);
            return Double.isFinite(distance) ? distance : Double.MAX_VALUE;
        }));

        return list;
    }

    private ServiceEntity copyForDistance(ServiceEntity item) {
        ServiceEntity copied = new ServiceEntity();
        copied.setId(item.getId());
        copied.setTitle(item.getTitle());
        copied.setDescription(item.getDescription());
        copied.setCategory(item.getCategory());
        copied.setPrice(item.getPrice());
        copied.setSellerId(item.getSellerId());
        copied.setRating(item.getRating());
        copied.setReviews(item.getReviews());
        copied.setDistance(item.getDistance());
        copied.setUnit(item.getUnit());
        copied.setHighlights(item.getHighlights());
        copied.setStatus(item.getStatus());
        copied.setRejectReason(item.getRejectReason());
        copied.setLatitude(item.getLatitude());
        copied.setLongitude(item.getLongitude());
        copied.setImages(item.getImages());
        return copied;
    }

    private void fillUnknownDistance(ServiceEntity service) {
        if (service.getDistance() == null || service.getDistance().isBlank()) {
            service.setDistance("距离未知");
        }
    }

    private void applyDistance(ServiceEntity service, Double buyerLat, Double buyerLng, Map<Long, Double> distanceMap) {
        if (service.getLatitude() == null || service.getLongitude() == null) {
            service.setDistance("距离未知");
            return;
        }

        double dist = com.neighborhood.app.utils.DistanceUtil.calculateDistance(
                buyerLat, buyerLng, service.getLatitude(), service.getLongitude());
        service.setDistance(com.neighborhood.app.utils.DistanceUtil.formatDistance(dist));
        if (service.getId() != null) {
            distanceMap.put(service.getId(), dist);
        }
    }

    private String emptyTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}

