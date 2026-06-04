package com.neighborhood.app.utils;

import com.neighborhood.app.entity.content.News;
import com.neighborhood.app.entity.market.MarketItem;
import com.neighborhood.app.entity.service.ServiceEntity;

import java.time.LocalDateTime;

public final class EntityDefaultsUtil {

    private EntityDefaultsUtil() {
    }

    public static void initPendingNews(News news) {
        if (news == null) {
            return;
        }
        news.setStatus("pending");
        news.setRejectReason("");
        news.setLikes(defaultInt(news.getLikes()));
        news.setCommentsCount(defaultInt(news.getCommentsCount()));
        news.setShares(defaultInt(news.getShares()));
        news.setCollections(defaultInt(news.getCollections()));
        news.setCreateTime(news.getCreateTime() == null ? LocalDateTime.now() : news.getCreateTime());
        news.setUpdateTime(LocalDateTime.now());
    }

    public static void initPendingMarketItem(MarketItem item) {
        if (item == null) {
            return;
        }
        item.setStatus("pending");
        item.setRejectReason("");
        item.setVerified(Boolean.TRUE.equals(item.getVerified()));
        item.setFreeShipping(Boolean.TRUE.equals(item.getFreeShipping()));
    }

    public static void initPendingService(ServiceEntity service) {
        if (service == null) {
            return;
        }
        service.setStatus("pending");
        service.setRejectReason("");
        service.setRating(service.getRating() == null ? 0D : service.getRating());
        service.setReviews(defaultInt(service.getReviews()));
    }

    private static int defaultInt(Integer value) {
        return value == null ? 0 : value;
    }
}
