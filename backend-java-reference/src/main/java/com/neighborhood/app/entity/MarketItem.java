/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.neighborhood.app.handler.MySqlJsonTypeHandler;
import lombok.Data;
import org.apache.ibatis.type.JdbcType;
import java.math.BigDecimal;
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
    @TableField(value = "images", typeHandler = MySqlJsonTypeHandler.class, jdbcType = JdbcType.VARCHAR)
    private List<String> images;
    @TableField("seller_id")
    private String sellerId;
    private String category;
    @TableField("original_price")
    private BigDecimal originalPrice;
    private String location;
    private String status;
    private String rejectReason;
    private Boolean verified;
    private Boolean freeShipping;
}
