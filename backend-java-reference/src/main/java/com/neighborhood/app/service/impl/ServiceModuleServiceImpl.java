/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.Booking;
import com.neighborhood.app.entity.ServiceEntity;
import com.neighborhood.app.entity.ServiceDetailVO;
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
import java.util.List;

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
        List<ServiceEntity> list = super.list();
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
        if (service == null) {
            return null;
        }
        User seller = userService.getById(service.getSellerId());
        return ServiceDetailVO.fromService(service, seller, buyerLat, buyerLng);
    }

    @Override
    public boolean save(ServiceEntity service) {
        boolean result = super.save(service);
        if (result) {
            cacheService.evictService(service.getId());
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
    public boolean book(Long serviceId, String buyerId, String sellerId, String bookingDate, String bookingTime, Integer duration) {
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
        return bookingMapper.insert(booking) > 0;
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
        List<ServiceEntity> list = super.list();
        if (buyerLat != null && buyerLng != null) {
            for (ServiceEntity service : list) {
                if (service.getLatitude() != null && service.getLongitude() != null) {
                    double dist = com.neighborhood.app.utils.DistanceUtil.calculateDistance(
                        buyerLat, buyerLng, service.getLatitude(), service.getLongitude());
                    service.setDistance(com.neighborhood.app.utils.DistanceUtil.formatDistance(dist));
                }
            }
        }
        return list;
    }
}