/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@TableName("t_market_item")
public class MarketItem {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private String condition;
    private String image;
    private List<String> images;
    private String sellerId;
    private String category;
    private BigDecimal originalPrice;
    private String location;
    private Boolean verified;
    private Boolean freeShipping;
}
