/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ServiceDetailVO {
    private Long id;
    private String title;
    private String description;
    private String category;
    private BigDecimal price;
    private String sellerId;
    private Double rating;
    private Integer reviews;
    private String distance;
    private String unit;
    private List<String> highlights;
    private List<String> images;

    private SellerInfo seller;

    @Data
    public static class SellerInfo {
        private String id;
        private String name;
        private String avatar;
        private Double rating;
        private Integer soldCount;
        private Integer followersCount;
        private Boolean isFollowing;
    }

    public static ServiceDetailVO fromService(ServiceEntity service, User seller) {
        ServiceDetailVO vo = new ServiceDetailVO();
        vo.setId(service.getId());
        vo.setTitle(service.getTitle());
        vo.setDescription(service.getDescription());
        vo.setCategory(service.getCategory());
        vo.setPrice(service.getPrice());
        vo.setSellerId(service.getSellerId());
        vo.setRating(service.getRating());
        vo.setReviews(service.getReviews());
        vo.setDistance(service.getDistance());
        vo.setUnit(service.getUnit());
        vo.setHighlights(service.getHighlights());
        vo.setImages(service.getImages());

        if (seller != null) {
            SellerInfo sellerInfo = new SellerInfo();
            sellerInfo.setId(seller.getId());
            sellerInfo.setName(seller.getName());
            sellerInfo.setAvatar(seller.getAvatar());
            sellerInfo.setRating(seller.getRating());
            sellerInfo.setSoldCount(seller.getSoldCount());
            sellerInfo.setFollowersCount(seller.getFollowersCount());
            sellerInfo.setIsFollowing(false);
            vo.setSeller(sellerInfo);
        }
        return vo;
    }
}
