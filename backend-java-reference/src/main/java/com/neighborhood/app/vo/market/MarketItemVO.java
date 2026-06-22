/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.vo.market;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.neighborhood.app.entity.market.MarketItem;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.utils.MarketCategoryUtil;
import java.math.BigDecimal;
import java.util.List;
import lombok.Data;
import lombok.experimental.Accessors;

/** 文件作用：闲置商品Item视图模型。 */
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

    private String sellerId;
    private String sellerName;
    private String sellerAvatar;
    private Boolean sellerVerified;
    private String sellerTag;
    private String sellerBio;
    private String sellerRegion;
    private Integer sellerFollowersCount;
    private Integer sellerOnSaleCount;
    private Integer sellerSoldCount;
    private String category;
    private BigDecimal originalPrice;
    private String location;
    private String status;
    private String rejectReason;
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
        vo.setCategory(MarketCategoryUtil.normalize(item.getCategory()));
        vo.setOriginalPrice(item.getOriginalPrice());
        vo.setLocation(item.getLocation());
        vo.setStatus(item.getStatus());
        vo.setRejectReason(item.getRejectReason());
        vo.setVerified(item.getVerified());
        vo.setFreeShipping(item.getFreeShipping());

        if (seller != null) {
            vo.setSellerId(seller.getId());
            vo.setSellerName(seller.getName());
            vo.setSellerAvatar(seller.getAvatar());
            vo.setSellerVerified(seller.getIsVerified());
            vo.setSellerTag(seller.getTag());
            vo.setSellerBio(seller.getBio());
            vo.setSellerRegion(seller.getRegion());
            vo.setSellerFollowersCount(seller.getFollowersCount());
            vo.setSellerSoldCount(seller.getSoldCount());
        }
        return vo;
    }
}
