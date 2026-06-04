package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.service.Booking;
import com.neighborhood.app.entity.service.Notification;
import com.neighborhood.app.entity.service.Order;
import com.neighborhood.app.entity.service.ServiceEntity;
import com.neighborhood.app.mapper.service.BookingMapper;
import com.neighborhood.app.mapper.service.NotificationMapper;
import com.neighborhood.app.service.AppMetricsService;
import com.neighborhood.app.service.CacheService;
import com.neighborhood.app.service.NotificationDispatchService;
import com.neighborhood.app.service.NotificationService;
import com.neighborhood.app.service.NotificationWriteService;
import com.neighborhood.app.service.OrderService;
import com.neighborhood.app.service.ServiceModuleService;
import com.neighborhood.app.utils.BookingDateTimeUtil;
import com.neighborhood.app.utils.OrderBuildUtil;
import com.neighborhood.app.utils.StringValueUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl extends ServiceImpl<NotificationMapper, Notification> implements NotificationService {

    private static final int RETENTION_DAYS = 7;
    private static final int DEFAULT_DURATION = 1;

    private final BookingMapper bookingMapper;
    private final NotificationDispatchService notificationDispatchService;
    private final NotificationWriteService notificationWriteService;
    private final OrderService orderService;
    private final ServiceModuleService serviceModuleService;
    private final CacheService cacheService;
    private final AppMetricsService appMetricsService;

    @Override
    public List<Notification> listByUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            return List.of();
        }
        List<Notification> cached = cacheService.getCachedNotificationList(userId);
        if (cached != null) {
            appMetricsService.recordNotificationList(true);
            return cached;
        }
        List<Notification> list = lambdaQuery()
                .eq(Notification::getUserId, userId)
                .orderByDesc(Notification::getTime)
                .list();
        cacheService.cacheNotificationList(userId, list);
        appMetricsService.recordNotificationList(false);
        return list;
    }

    @Override
    public boolean markRead(Long id) {
        Notification notification = getById(id);
        if (notification == null) {
            return false;
        }
        boolean updated = lambdaUpdate()
                .eq(Notification::getId, id)
                .set(Notification::getIsRead, true)
                .update();
        if (updated) {
            evictNotificationList(notification.getUserId());
        }
        return updated;
    }

    @Override
    public boolean markAllRead(String userId) {
        if (userId == null || userId.isBlank()) {
            return false;
        }
        boolean updated = lambdaUpdate()
                .eq(Notification::getUserId, userId)
                .set(Notification::getIsRead, true)
                .update();
        if (updated) {
            evictNotificationList(userId);
        }
        return updated;
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
    public boolean processNotification(Long notificationId, boolean accept, String buyerId, String sellerId, Long serviceId, String serviceTitle, String price, String bookingDate, String bookingTime, Integer duration) {
        Notification notification = getById(notificationId);
        if (notification == null || Boolean.TRUE.equals(notification.getIsProcessed())) {
            return false;
        }

        Booking booking = findBooking(notification);
        ProcessContext context = resolveProcessContext(notification, booking, buyerId, sellerId, serviceId, serviceTitle, price, bookingDate, bookingTime, duration);
        if (!context.isValid()) {
            return false;
        }

        if (accept) {
            Order order = createConfirmedOrder(notification, context);
            orderService.save(order);
            markProcessed(notificationId, order.getId());
            updateBookingStatus(notification.getRelatedBookingId(), "confirmed");
            saveProcessResultNotification(
                    context,
                    "预约已确认",
                    "您的服务预约《" + context.serviceTitle + "》已通过服务商确认，请按时到达。预约时间：" + context.bookingDate + " " + context.bookingTime
            );
        } else {
            markProcessed(notificationId, null);
            saveProcessResultNotification(
                    context,
                    "预约被拒绝",
                    "您的服务预约《" + context.serviceTitle + "》已被服务商拒绝，请尝试预约其他时间或服务。"
            );
            updateBookingStatus(notification.getRelatedBookingId(), "cancelled");
        }

        evictNotificationList(notification.getUserId());
        return true;
    }

    /** 每天凌晨清理过期通知 */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanExpiredNotifications() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(RETENTION_DAYS);
        lambdaUpdate()
                .lt(Notification::getTime, threshold)
                .remove();
    }

    private Booking findBooking(Notification notification) {
        Long bookingId = notification.getRelatedBookingId();
        return bookingId == null ? null : bookingMapper.selectById(bookingId);
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
            Integer duration) {
        Long actualServiceId = booking != null && booking.getServiceId() != null ? booking.getServiceId() : serviceId;
        ServiceEntity service = actualServiceId == null ? null : serviceModuleService.getById(actualServiceId);

        String actualBuyerId = booking != null ? booking.getBuyerId() : buyerId;
        String actualSellerId = booking != null ? booking.getSellerId() : sellerId;
        String actualServiceTitle = service != null ? service.getTitle() : StringValueUtil.emptyTo(serviceTitle, notification.getServiceName());
        BigDecimal actualPrice = service != null && service.getPrice() != null ? service.getPrice() : parsePrice(price);
        String actualBookingDate = booking != null && booking.getBookingDate() != null ? booking.getBookingDate().toLocalDate().toString() : bookingDate;
        String actualBookingTime = booking != null ? booking.getBookingTime() : bookingTime;
        int actualDuration = booking != null && booking.getDuration() != null ? booking.getDuration() : normalizeDuration(duration);

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

    private void markProcessed(Long notificationId, Long orderId) {
        var update = lambdaUpdate()
                .eq(Notification::getId, notificationId)
                .set(Notification::getIsProcessed, true);
        if (orderId != null) {
            update.set(Notification::getOrderId, orderId);
        }
        update.update();
    }

    private void saveProcessResultNotification(ProcessContext context, String title, String content) {
        notificationWriteService.saveProcessedNotification(
                context.buyerId,
                title,
                content,
                context.serviceTitle
        );
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
            int duration) {
        private boolean isValid() {
            return buyerId != null && sellerId != null && serviceId != null && bookingDate != null && bookingTime != null;
        }
    }
}
