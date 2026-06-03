/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.vo.service;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.neighborhood.app.entity.service.ServiceEntity;
import com.neighborhood.app.entity.user.User;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ServiceDetailVO {
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    private String title;
    private String description;
    private String category;
    private BigDecimal price;
    private String sellerId;
    private Double rating;
    private Integer reviews;
    private String unit;
    private String highlights;
    private String status;
    private String rejectReason;
    private List<String> images;
    private Double latitude;   // 服务位置纬度
    private Double longitude;  // 服务位置经度
    private String distance;   // 计算后的距离

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

    public static ServiceDetailVO fromService(ServiceEntity service, User seller, Double buyerLat, Double buyerLng) {
        ServiceDetailVO vo = new ServiceDetailVO();
        vo.setId(service.getId());
        vo.setTitle(service.getTitle());
        vo.setDescription(service.getDescription());
        vo.setCategory(service.getCategory());
        vo.setPrice(service.getPrice());
        vo.setSellerId(service.getSellerId());
        vo.setRating(service.getRating());
        vo.setReviews(service.getReviews());
        vo.setUnit(service.getUnit());
        vo.setHighlights(service.getHighlights());
        vo.setStatus(service.getStatus());
        vo.setRejectReason(service.getRejectReason());
        vo.setImages(service.getImages());
        vo.setLatitude(service.getLatitude());
        vo.setLongitude(service.getLongitude());

        vo.setDistance(service.getDistance() == null || service.getDistance().isBlank() ? "距离未知" : service.getDistance());
        if (buyerLat != null && buyerLng != null && service.getLatitude() != null && service.getLongitude() != null) {
            double dist = com.neighborhood.app.utils.DistanceUtil.calculateDistance(
                    buyerLat, buyerLng, service.getLatitude(), service.getLongitude());
            vo.setDistance(com.neighborhood.app.utils.DistanceUtil.formatDistance(dist));
        }

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
