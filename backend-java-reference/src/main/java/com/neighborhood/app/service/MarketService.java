/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.MarketItem;
import com.neighborhood.app.mapper.MarketMapper;
import org.springframework.stereotype.Service;

@Service
public class MarketService extends ServiceImpl<MarketMapper, MarketItem> {
}
