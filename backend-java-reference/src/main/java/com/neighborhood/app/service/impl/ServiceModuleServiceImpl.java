package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.service.Booking;
import com.neighborhood.app.entity.service.Order;
import com.neighborhood.app.entity.service.ServiceEntity;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.mapper.service.BookingMapper;
import com.neighborhood.app.mapper.service.OrderMapper;
import com.neighborhood.app.mapper.service.ServiceMapper;
import com.neighborhood.app.service.AppMetricsService;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.ServiceModuleService;
import com.neighborhood.app.service.UserService;
import com.neighborhood.app.utils.BookingDateTimeUtil;
import com.neighborhood.app.utils.CacheLookupUtil;
import com.neighborhood.app.utils.DistanceUtil;
import com.neighborhood.app.utils.EntityDefaultsUtil;
import com.neighborhood.app.utils.StringValueUtil;
import com.neighborhood.app.vo.service.ServiceDetailVO;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

/** 文件作用：服务模块服务实现。 */
@Service
@RequiredArgsConstructor
public class ServiceModuleServiceImpl extends ServiceImpl<ServiceMapper, ServiceEntity> implements ServiceModuleService {

    private static final String ACTIVE_STATUS = "active";
    private static final String COMPLETED_STATUS = "completed";
    private static final String PENDING_STATUS = "pending";
    private static final String UNKNOWN_DISTANCE = "距离未知";

    private final CacheService cacheService;
    private final BookingMapper bookingMapper;
    private final OrderMapper orderMapper;
    private final UserService userService;
    private final AppMetricsService appMetricsService;

    @Override
    public List<ServiceEntity> list() {
        return CacheLookupUtil.getOrLoadWithMetrics(
                cacheService::getCachedServiceList,
                () -> lambdaQuery()
                        .eq(ServiceEntity::getStatus, ACTIVE_STATUS)
                        .orderByDesc(ServiceEntity::getId)
                        .list(),
                cacheService::cacheServiceList,
                appMetricsService,
                "service",
                "list"
        );
    }

    @Override
    public ServiceEntity getById(Long id) {
        return CacheLookupUtil.getOrLoadWithMetrics(
                () -> cacheService.getCachedService(id),
                () -> super.getById(id),
                result -> cacheService.cacheService(id, result),
                appMetricsService,
                "service",
                "detail"
        );
    }

    /** 获取服务详情，包含服务商信息。 */
    public ServiceDetailVO getServiceDetail(Long id, Double buyerLat, Double buyerLng) {
        ServiceEntity service = getById(id);
        if (service == null || !ACTIVE_STATUS.equals(StringValueUtil.emptyTo(service.getStatus(), ACTIVE_STATUS))) {
            return null;
        }
        User seller = userService.getById(service.getSellerId());
        ServiceDetailVO vo = ServiceDetailVO.fromService(service, seller, buyerLat, buyerLng);
        if (vo != null && vo.getSeller() != null) {
            vo.getSeller().setSoldCount(countCompletedOrders(service.getSellerId()));
        }
        return vo;
    }

    @Override
    public IPage<ServiceEntity> listPage(String category, String keyword, Double buyerLat, Double buyerLng, long pageNum, long pageSize) {
        List<ServiceEntity> source = buyerLat != null && buyerLng != null ? listWithDistance(buyerLat, buyerLng) : list();
        String normalizedKeyword = normalizeKeyword(keyword);
        List<ServiceEntity> filtered = source.stream()
                .filter(service -> matchesCategory(category, service.getCategory()))
                .filter(service -> matchesKeyword(normalizedKeyword, service.getTitle()))
                .toList();

        Page<ServiceEntity> result = new Page<>(pageNum, pageSize, filtered.size());
        long start = Math.max(0L, (pageNum - 1) * pageSize);
        if (start >= filtered.size()) {
            result.setRecords(List.of());
            return result;
        }
        int fromIndex = (int) start;
        int toIndex = (int) Math.min(filtered.size(), start + pageSize);
        result.setRecords(filtered.subList(fromIndex, toIndex));
        return result;
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
        Booking booking = buildBooking(serviceId, buyerId, sellerId, bookingDate, bookingTime, duration);
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
        List<ServiceEntity> list = new ArrayList<>(list().stream().map(this::copyForDistance).toList());
        if (buyerLat == null || buyerLng == null) {
            list.forEach(this::fillUnknownDistance);
            return list;
        }

        Map<Long, Double> distanceMap = new HashMap<>();
        list.forEach(service -> applyDistance(service, buyerLat, buyerLng, distanceMap));
        list.sort(Comparator.comparingDouble(service -> sortDistance(service, distanceMap)));
        return list;
    }

    private Booking buildBooking(Long serviceId, String buyerId, String sellerId, String bookingDate, String bookingTime, Integer duration) {
        LocalDateTime now = LocalDateTime.now();
        Booking booking = new Booking();
        booking.setServiceId(serviceId);
        booking.setBuyerId(buyerId);
        booking.setSellerId(sellerId);
        booking.setBookingDate(BookingDateTimeUtil.combineDateAndTime(bookingDate, bookingTime));
        booking.setBookingTime(bookingTime);
        booking.setDuration(duration);
        booking.setStatus(PENDING_STATUS);
        booking.setCreateTime(now);
        booking.setUpdateTime(now);
        return booking;
    }

    private ServiceEntity copyForDistance(ServiceEntity item) {
        ServiceEntity copied = new ServiceEntity();
        BeanUtils.copyProperties(item, copied);
        return copied;
    }

    private boolean matchesCategory(String category, String currentCategory) {
        return category == null || category.isBlank() || "all".equalsIgnoreCase(category) || category.equals(currentCategory);
    }

    private boolean matchesKeyword(String keyword, String value) {
        if (keyword == null || keyword.isEmpty()) {
            return true;
        }
        return value != null && value.toLowerCase(Locale.ROOT).contains(keyword);
    }

    private String normalizeKeyword(String keyword) {
        return keyword == null ? "" : keyword.trim().toLowerCase(Locale.ROOT);
    }

    private int countCompletedOrders(String sellerId) {
        if (sellerId == null || sellerId.isBlank()) {
            return 0;
        }
        return Math.toIntExact(orderMapper.selectCount(new LambdaQueryWrapper<Order>()
                .eq(Order::getSellerId, sellerId)
                .eq(Order::getStatus, COMPLETED_STATUS)));
    }

    private void fillUnknownDistance(ServiceEntity service) {
        if (service.getDistance() == null || service.getDistance().isBlank()) {
            service.setDistance(UNKNOWN_DISTANCE);
        }
    }

    private void applyDistance(ServiceEntity service, Double buyerLat, Double buyerLng, Map<Long, Double> distanceMap) {
        if (service.getLatitude() == null || service.getLongitude() == null) {
            service.setDistance(UNKNOWN_DISTANCE);
            return;
        }

        double distance = DistanceUtil.calculateDistance(buyerLat, buyerLng, service.getLatitude(), service.getLongitude());
        service.setDistance(DistanceUtil.formatDistance(distance));
        if (service.getId() != null) {
            distanceMap.put(service.getId(), distance);
        }
    }

    private double sortDistance(ServiceEntity service, Map<Long, Double> distanceMap) {
        if (service.getId() == null) {
            return Double.MAX_VALUE;
        }
        double distance = distanceMap.getOrDefault(service.getId(), Double.MAX_VALUE);
        return Double.isFinite(distance) ? distance : Double.MAX_VALUE;
    }

    private void evictServiceCaches(Long serviceId, boolean includeHome) {
        cacheService.evictService(serviceId);
        if (includeHome) {
            cacheService.evictHomeIndex();
        }
    }
}
