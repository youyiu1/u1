/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.ServiceEntity;
import com.neighborhood.app.mapper.ServiceMapper;
import org.springframework.stereotype.Service;

@Service
public class ServiceModuleService extends ServiceImpl<ServiceMapper, ServiceEntity> {
}
