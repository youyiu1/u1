package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.service.Booking;
import com.neighborhood.app.entity.service.ServiceEntity;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.mapper.service.BookingMapper;
import com.neighborhood.app.mapper.service.ServiceMapper;
import com.neighborhood.app.service.AppMetricsService;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.ServiceModuleService;
import com.neighborhood.app.service.UserService;
import com.neighborhood.app.utils.BookingDateTimeUtil;
import com.neighborhood.app.utils.CacheLookupUtil;
import com.neighborhood.app.utils.EntityDefaultsUtil;
import com.neighborhood.app.utils.StringValueUtil;
import com.neighborhood.app.vo.service.ServiceDetailVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
    private final AppMetricsService appMetricsService;

    @Override
    public List<ServiceEntity> list() {
        List<ServiceEntity> cached = cacheService.getCachedServiceList();
        if (cached != null) {
            appMetricsService.recordContentAccess("service", "list", true);
            return cached;
        }
        List<ServiceEntity> result = lambdaQuery()
                .eq(ServiceEntity::getStatus, "active")
                .orderByDesc(ServiceEntity::getId)
                .list();
        cacheService.cacheServiceList(result);
        appMetricsService.recordContentAccess("service", "list", false);
        return result;
    }

    @Override
    public ServiceEntity getById(Long id) {
        ServiceEntity cached = cacheService.getCachedService(id);
        if (cached != null) {
            appMetricsService.recordContentAccess("service", "detail", true);
            return cached;
        }
        ServiceEntity result = super.getById(id);
        if (result != null) {
            cacheService.cacheService(id, result);
        }
        appMetricsService.recordContentAccess("service", "detail", false);
        return result;
    }

    /** 获取服务详情，包含服务商信息。 */
    public ServiceDetailVO getServiceDetail(Long id, Double buyerLat, Double buyerLng) {
        ServiceEntity service = getById(id);
        if (service == null || !"active".equals(StringValueUtil.emptyTo(service.getStatus(), "active"))) {
            return null;
        }
        User seller = userService.getById(service.getSellerId());
        return ServiceDetailVO.fromService(service, seller, buyerLat, buyerLng);
    }

    @Override
    public boolean save(ServiceEntity service) {
        EntityDefaultsUtil.initPendingService(service);
        boolean result = super.save(service);
        if (result) {
            evictServiceCaches(service.getId(), true);
        }
        return result;
    }

    @Override
    public boolean updateById(ServiceEntity service) {
        boolean result = super.updateById(service);
        if (result) {
            evictServiceCaches(service.getId(), false);
        }
        return result;
    }

    @Override
    public Long book(Long serviceId, String buyerId, String sellerId, String bookingDate, String bookingTime, Integer duration) {
        Booking booking = new Booking();
        booking.setServiceId(serviceId);
        booking.setBuyerId(buyerId);
        booking.setSellerId(sellerId);
        booking.setBookingDate(BookingDateTimeUtil.combineDateAndTime(bookingDate, bookingTime));
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
        List<ServiceEntity> list = source.stream()
                .map(this::copyForDistance)
                .collect(java.util.stream.Collectors.toCollection(() -> new ArrayList<>(source.size())));

        if (buyerLat == null || buyerLng == null) {
            list.forEach(this::fillUnknownDistance);
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

    private void evictServiceCaches(Long serviceId, boolean includeHome) {
        cacheService.evictService(serviceId);
        if (includeHome) {
            cacheService.evictHomeIndex();
        }
    }
}
