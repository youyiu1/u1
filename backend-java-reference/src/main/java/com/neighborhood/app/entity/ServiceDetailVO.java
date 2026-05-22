/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.util.ArrayList;
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

    public List<String> getImages() {
        if (images == null) return List.of();
        return images;
    }

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
        vo.setHighlights(parseJson(service.getHighlights()));
        vo.setImages(parseJson(service.getImages()));

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

    private static List<String> parseJson(String json) {
        if (json == null || json.isEmpty()) {
            return List.of();
        }
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            var node = mapper.readTree(json);
            if (node.isArray()) {
                List<String> list = new ArrayList<>();
                for (var n : node) {
                    list.add(n.asText());
                }
                return list;
            }
        } catch (Exception e) {
            // ignore
        }
        return List.of();
    }
}
