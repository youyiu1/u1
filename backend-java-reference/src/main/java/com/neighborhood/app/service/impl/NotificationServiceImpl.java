package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.market.MarketItem;
import com.neighborhood.app.entity.service.Booking;
import com.neighborhood.app.entity.service.Notification;
import com.neighborhood.app.entity.service.Order;
import com.neighborhood.app.entity.service.ServiceEntity;
import com.neighborhood.app.mapper.service.BookingMapper;
import com.neighborhood.app.mapper.service.NotificationMapper;
import com.neighborhood.app.service.AppMetricsService;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.MarketService;
import com.neighborhood.app.service.NotificationDispatchService;
import com.neighborhood.app.service.NotificationService;
import com.neighborhood.app.service.NotificationWriteService;
import com.neighborhood.app.service.OrderService;
import com.neighborhood.app.service.ServiceModuleService;
import com.neighborhood.app.utils.BookingDateTimeUtil;
import com.neighborhood.app.utils.CacheLookupUtil;
import com.neighborhood.app.utils.OrderBuildUtil;
import com.neighborhood.app.utils.StringValueUtil;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.function.Consumer;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/** 通知服务实现。 */
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl extends ServiceImpl<NotificationMapper, Notification> implements NotificationService {

    private static final int RETENTION_DAYS = 7;
    private static final int DEFAULT_DURATION = 1;

    private static final String BOOKING_STATUS_CONFIRMED = "confirmed";
    private static final String BOOKING_STATUS_CANCELLED = "cancelled";
    private static final String BOOKING_TITLE_CONFIRMED = "预约已确认";
    private static final String BOOKING_TITLE_REJECTED = "预约已拒绝";

    private static final String MARKET_STATUS_ACTIVE = "active";
    private static final String MARKET_STATUS_SOLD = "sold";
    private static final String MARKET_REQUEST_TITLE = "新的购买请求";
    private static final String MARKET_TITLE_CONFIRMED = "购买请求已同意";
    private static final String MARKET_TITLE_REJECTED = "购买请求已拒绝";

    private final BookingMapper bookingMapper;
    private final NotificationDispatchService notificationDispatchService;
    private final NotificationWriteService notificationWriteService;
    private final OrderService orderService;
    private final ServiceModuleService serviceModuleService;
    private final MarketService marketService;
    private final CacheService cacheService;
    private final AppMetricsService appMetricsService;

    @Override
    public List<Notification> listByUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            return List.of();
        }
        return CacheLookupUtil.getOrLoadAndTrack(
                () -> cacheService.getCachedNotificationList(userId),
                () -> lambdaQuery()
                        .eq(Notification::getUserId, userId)
                        .orderByDesc(Notification::getTime)
                        .list(),
                list -> cacheService.cacheNotificationList(userId, list),
                appMetricsService::recordNotificationList
        );
    }

    @Override
    public boolean markRead(Long id) {
        Notification notification = getById(id);
        if (notification == null) {
            return false;
        }
        return updateReadAndEvict(notification.getUserId(), wrapper -> wrapper.eq(Notification::getId, id));
    }

    @Override
    public boolean markAllRead(String userId) {
        if (userId == null || userId.isBlank()) {
            return false;
        }
        return updateReadAndEvict(userId, wrapper -> wrapper.eq(Notification::getUserId, userId));
    }

    @Override
    public void saveNotification(String userId, String title, String content, String serviceName) {
        notificationDispatchService.dispatchNotification(userId, title, content, serviceName);
    }

    @Override
    public void saveNotificationWithBooking(String userId, String title, String content, String serviceName, Long bookingId) {
        notificationDispatchService.dispatchNotificationWithBooking(userId, title, content, serviceName, bookingId);
    }

    @Override
    public void saveNotificationWithMarketItem(
            String userId,
            String title,
            String content,
            String serviceName,
            String relatedUserId,
            Long marketItemId
    ) {
        notificationDispatchService.dispatchNotificationWithMarketItem(
                userId,
                title,
                content,
                serviceName,
                relatedUserId,
                marketItemId
        );
    }

    @Override
    public boolean hasPendingMarketPurchaseRequest(String sellerId, String buyerId, Long marketItemId) {
        if (sellerId == null || sellerId.isBlank() || buyerId == null || buyerId.isBlank() || marketItemId == null) {
            return false;
        }
        return lambdaQuery()
                .eq(Notification::getUserId, sellerId)
                .eq(Notification::getRelatedUserId, buyerId)
                .eq(Notification::getRelatedMarketItemId, marketItemId)
                .eq(Notification::getTitle, MARKET_REQUEST_TITLE)
                .eq(Notification::getIsProcessed, false)
                .count() > 0;
    }

    @Override
    public boolean processNotification(
            Long notificationId,
            String operatorUserId,
            boolean accept,
            String buyerId,
            String sellerId,
            Long serviceId,
            String serviceTitle,
            String price,
            String bookingDate,
            String bookingTime,
            Integer duration
    ) {
        Notification notification = getById(notificationId);
        if (notification == null || Boolean.TRUE.equals(notification.getIsProcessed())) {
            return false;
        }

        if (notification.getRelatedMarketItemId() != null) {
            return processMarketNotification(notification, operatorUserId, accept);
        }

        Booking booking = findBooking(notification);
        if (!canProcessBookingNotification(notification, booking, operatorUserId)) {
            return false;
        }
        ProcessContext context = resolveProcessContext(
                notification,
                booking,
                buyerId,
                sellerId,
                serviceId,
                serviceTitle,
                price,
                bookingDate,
                bookingTime,
                duration
        );
        if (!context.isValid()) {
            return false;
        }
        return accept ? confirmBookingNotification(notification, context) : rejectBookingNotification(notification, context);
    }

    /** 每天凌晨清理过期通知。 */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanExpiredNotifications() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(RETENTION_DAYS);
        lambdaUpdate()
                .lt(Notification::getTime, threshold)
                .remove();
    }

    private boolean processMarketNotification(Notification notification, String operatorUserId, boolean accept) {
        if (operatorUserId == null || operatorUserId.isBlank() || !operatorUserId.equals(notification.getUserId())) {
            return false;
        }

        MarketItem item = marketService.getById(notification.getRelatedMarketItemId());
        if (item == null || !operatorUserId.equals(item.getSellerId())) {
            return false;
        }

        String buyerId = notification.getRelatedUserId();
        if (buyerId == null || buyerId.isBlank()) {
            return false;
        }

        String itemTitle = StringValueUtil.emptyTo(item.getTitle(), notification.getServiceName());
        if (accept) {
            String currentStatus = StringValueUtil.emptyTo(item.getStatus(), MARKET_STATUS_ACTIVE);
            if (!MARKET_STATUS_ACTIVE.equals(currentStatus)) {
                return false;
            }
            MarketItem update = new MarketItem();
            update.setId(item.getId());
            update.setStatus(MARKET_STATUS_SOLD);
            if (!marketService.updateById(update)) {
                return false;
            }
            markProcessed(notification.getId(), null);
            notificationWriteService.saveProcessedNotification(
                    buyerId,
                    MARKET_TITLE_CONFIRMED,
                    "您对商品《" + itemTitle + "》的购买请求已获卖家同意，请尽快联系对方完成交易。",
                    itemTitle
            );
            evictNotificationList(notification.getUserId());
            return true;
        }

        markProcessed(notification.getId(), null);
        notificationWriteService.saveProcessedNotification(
                buyerId,
                MARKET_TITLE_REJECTED,
                "您对商品《" + itemTitle + "》的购买请求已被卖家拒绝，可以继续浏览其他商品。",
                itemTitle
        );
        evictNotificationList(notification.getUserId());
        return true;
    }

    private boolean confirmBookingNotification(Notification notification, ProcessContext context) {
        Order order = createConfirmedOrder(notification, context);
        orderService.save(order);
        return finishBookingNotificationProcess(
                notification,
                context,
                order.getId(),
                BOOKING_STATUS_CONFIRMED,
                BOOKING_TITLE_CONFIRMED,
                "您的服务预约《" + context.serviceTitle + "》已获服务商确认，请按时到达。预约时间：" + context.bookingDate + " " + context.bookingTime
        );
    }

    private boolean rejectBookingNotification(Notification notification, ProcessContext context) {
        return finishBookingNotificationProcess(
                notification,
                context,
                null,
                BOOKING_STATUS_CANCELLED,
                BOOKING_TITLE_REJECTED,
                "您的服务预约《" + context.serviceTitle + "》已被服务商拒绝，请尝试预约其他时间或服务。"
        );
    }

    private Booking findBooking(Notification notification) {
        Long bookingId = notification.getRelatedBookingId();
        return bookingId == null ? null : bookingMapper.selectById(bookingId);
    }

    private boolean canProcessBookingNotification(Notification notification, Booking booking, String operatorUserId) {
        if (notification == null || booking == null || operatorUserId == null || operatorUserId.isBlank()) {
            return false;
        }
        return operatorUserId.equals(booking.getSellerId()) && operatorUserId.equals(notification.getUserId());
    }

    private ProcessContext resolveProcessContext(
            Notification notification,
            Booking booking,
            String buyerId,
            String sellerId,
            Long serviceId,
            String serviceTitle,
            String price,
            String bookingDate,
            String bookingTime,
            Integer duration
    ) {
        Long actualServiceId = booking != null && booking.getServiceId() != null ? booking.getServiceId() : serviceId;
        ServiceEntity service = actualServiceId == null ? null : serviceModuleService.getById(actualServiceId);

        String actualBuyerId = booking != null ? booking.getBuyerId() : buyerId;
        String actualSellerId = booking != null ? booking.getSellerId() : sellerId;
        String actualServiceTitle = service != null
                ? service.getTitle()
                : StringValueUtil.emptyTo(serviceTitle, notification.getServiceName());
        BigDecimal actualPrice = service != null && service.getPrice() != null ? service.getPrice() : parsePrice(price);
        String actualBookingDate = booking != null && booking.getBookingDate() != null
                ? booking.getBookingDate().toLocalDate().toString()
                : bookingDate;
        String actualBookingTime = booking != null ? booking.getBookingTime() : bookingTime;
        int actualDuration = booking != null && booking.getDuration() != null
                ? booking.getDuration()
                : normalizeDuration(duration);

        return new ProcessContext(
                actualBuyerId,
                actualSellerId,
                actualServiceId,
                actualServiceTitle,
                actualPrice,
                actualBookingDate,
                actualBookingTime,
                actualDuration
        );
    }

    private Order createConfirmedOrder(Notification notification, ProcessContext context) {
        return OrderBuildUtil.buildConfirmedOrder(
                notification.getRelatedBookingId(),
                context.buyerId,
                context.sellerId,
                context.serviceId,
                context.serviceTitle,
                context.price,
                BookingDateTimeUtil.combineDateAndTime(context.bookingDate, context.bookingTime),
                context.bookingTime,
                context.duration
        );
    }

    private boolean finishBookingNotificationProcess(
            Notification notification,
            ProcessContext context,
            Long orderId,
            String bookingStatus,
            String title,
            String content
    ) {
        markProcessed(notification.getId(), orderId);
        updateBookingStatus(notification.getRelatedBookingId(), bookingStatus);
        notificationWriteService.saveProcessedNotification(
                context.buyerId,
                title,
                content,
                context.serviceTitle
        );
        evictNotificationList(notification.getUserId());
        return true;
    }

    private void markProcessed(Long notificationId, Long orderId) {
        var update = lambdaUpdate()
                .eq(Notification::getId, notificationId)
                .set(Notification::getIsProcessed, true);
        if (orderId != null) {
            update.set(Notification::getOrderId, orderId);
        }
        update.update();
    }

    private void updateBookingStatus(Long bookingId, String status) {
        updateBooking(bookingId, wrapper -> wrapper
                .set(Booking::getStatus, status)
                .set(Booking::getUpdateTime, LocalDateTime.now()));
    }

    private void updateBooking(Long bookingId, Consumer<LambdaUpdateWrapper<Booking>> customizer) {
        if (bookingId == null) {
            return;
        }
        LambdaUpdateWrapper<Booking> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Booking::getId, bookingId);
        customizer.accept(wrapper);
        bookingMapper.update(null, wrapper);
    }

    private BigDecimal parsePrice(String price) {
        return price == null || price.isEmpty() ? BigDecimal.ZERO : new BigDecimal(price);
    }

    private int normalizeDuration(Integer duration) {
        return duration == null || duration == 0 ? DEFAULT_DURATION : duration;
    }

    private boolean updateReadState(Consumer<LambdaUpdateWrapper<Notification>> customizer) {
        LambdaUpdateWrapper<Notification> wrapper = new LambdaUpdateWrapper<>();
        customizer.accept(wrapper);
        wrapper.set(Notification::getIsRead, true);
        return update(wrapper);
    }

    private boolean updateReadAndEvict(
            String userId,
            Consumer<LambdaUpdateWrapper<Notification>> customizer
    ) {
        boolean updated = updateReadState(customizer);
        if (updated) {
            evictNotificationList(userId);
        }
        return updated;
    }

    private void evictNotificationList(String userId) {
        cacheService.evictNotificationList(userId);
    }

    private record ProcessContext(
            String buyerId,
            String sellerId,
            Long serviceId,
            String serviceTitle,
            BigDecimal price,
            String bookingDate,
            String bookingTime,
            int duration
    ) {
        private boolean isValid() {
            return buyerId != null
                    && sellerId != null
                    && serviceId != null
                    && bookingDate != null
                    && bookingTime != null;
        }
    }
}
