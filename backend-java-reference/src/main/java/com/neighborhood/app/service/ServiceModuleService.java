/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.ServiceEntity;
import com.neighborhood.app.mapper.ServiceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceModuleService extends ServiceImpl<ServiceMapper, ServiceEntity> {

    private final CacheService cacheService;

    @Override
    public List<ServiceEntity> list() {
        // 先查缓存
        List<ServiceEntity> cached = cacheService.getCachedServiceList();
        if (cached != null) {
            return cached;
        }
        // 缓存未命中，查数据库
        List<ServiceEntity> list = super.list();
        cacheService.cacheServiceList(list);
        return list;
    }

    public ServiceEntity getById(Long id) {
        // 先查缓存
        ServiceEntity cached = (ServiceEntity) cacheService.getCachedService(id);
        if (cached != null) {
            return cached;
        }
        // 缓存未命中，查数据库
        ServiceEntity service = super.getById(id);
        if (service != null) {
            cacheService.cacheService(id, service);
        }
        return service;
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
}