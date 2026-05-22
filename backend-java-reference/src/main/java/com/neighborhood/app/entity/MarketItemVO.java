/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import lombok.experimental.Accessors;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Accessors(chain = true)
public class MarketItemVO {
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private String itemCondition;
    private List<String> images;

    public List<String> getImages() {
        return images == null ? List.of() : images;
    }
    // 卖家信息（扁平化）
    private String sellerId;
    private String sellerName;
    private String sellerAvatar;
    private Boolean sellerVerified;
    private Integer sellerFollowersCount;
    private Integer sellerOnSaleCount;
    private Integer sellerSoldCount;
    private String category;
    private BigDecimal originalPrice;
    private String location;
    private Boolean verified;
    private Boolean freeShipping;

    public static MarketItemVO fromMarketItem(MarketItem item, User seller) {
        MarketItemVO vo = new MarketItemVO();
        vo.setId(item.getId());
        vo.setTitle(item.getTitle());
        vo.setDescription(item.getDescription());
        vo.setPrice(item.getPrice());
        vo.setItemCondition(item.getItemCondition());
        vo.setImages(item.getImages());
        vo.setCategory(item.getCategory());
        vo.setOriginalPrice(item.getOriginalPrice());
        vo.setLocation(item.getLocation());
        vo.setVerified(item.getVerified());
        vo.setFreeShipping(item.getFreeShipping());

        if (seller != null) {
            vo.setSellerId(seller.getId());
            vo.setSellerName(seller.getName());
            vo.setSellerAvatar(seller.getAvatar());
            vo.setSellerVerified(seller.getIsVerified());
            vo.setSellerFollowersCount(seller.getFollowersCount());
            vo.setSellerOnSaleCount(seller.getSoldCount());  // 复用字段
            vo.setSellerSoldCount(seller.getRating() != null ? seller.getRating().intValue() : 0);
        }
        return vo;
    }
}