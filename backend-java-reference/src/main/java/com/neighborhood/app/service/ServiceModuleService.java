/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.ServiceEntity;
import com.neighborhood.app.entity.ServiceDetailVO;
import java.util.List;

public interface ServiceModuleService extends IService<ServiceEntity> {
    List<ServiceEntity> list();
    ServiceEntity getById(Long id);
    ServiceDetailVO getServiceDetail(Long id);
    boolean save(ServiceEntity service);
    boolean updateById(ServiceEntity service);
    boolean book(Long serviceId, String buyerId, String sellerId, String bookingDate, String bookingTime, Integer duration);
}