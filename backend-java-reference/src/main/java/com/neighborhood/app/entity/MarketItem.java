/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@TableName("t_market_item")
public class MarketItem {
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    @TableField("item_condition")
    private String itemCondition;
    private String image;
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<String> images;
    @TableField("seller_id")
    private String sellerId;
    private String category;
    @TableField("original_price")
    private BigDecimal originalPrice;
    private String location;
    private Boolean verified;
    private Boolean freeShipping;

    /**
     * 统一图片列表，前端只使用此方法获取图片数组
     */
    public List<String> getImages() {
        List<String> result = new ArrayList<>();
        if (image != null && !image.isBlank()) result.add(image);
        if (images != null) result.addAll(images);
        return result;
    }
}