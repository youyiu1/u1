/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.ServiceReview;
import com.neighborhood.app.mapper.ServiceReviewMapper;
import com.neighborhood.app.service.ServiceReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceReviewServiceImpl extends ServiceImpl<ServiceReviewMapper, ServiceReview> implements ServiceReviewService {

    @Override
    public List<ServiceReview> getByServiceId(Long serviceId) {
        return lambdaQuery()
                .eq(ServiceReview::getServiceId, serviceId)
                .orderByDesc(ServiceReview::getCreateTime)
                .list();
    }
}