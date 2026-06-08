/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.service.ServiceEntity;
import com.neighborhood.app.vo.service.ServiceDetailVO;
import java.util.List;

/** 文件作用：服务模块服务接口。 */
public interface ServiceModuleService extends IService<ServiceEntity> {
    List<ServiceEntity> list();
    ServiceEntity getById(Long id);
    ServiceDetailVO getServiceDetail(Long id, Double buyerLat, Double buyerLng);
    IPage<ServiceEntity> listPage(String category, String keyword, Double buyerLat, Double buyerLng, long pageNum, long pageSize);
    List<ServiceEntity> listByUserId(String userId);  // 获取用户服务
    List<ServiceEntity> listWithDistance(Double buyerLat, Double buyerLng);  // 带距离的服务列表
    boolean save(ServiceEntity service);
    boolean updateById(ServiceEntity service);
    Long book(Long serviceId, String buyerId, String sellerId, String bookingDate, String bookingTime, Integer duration);
}
