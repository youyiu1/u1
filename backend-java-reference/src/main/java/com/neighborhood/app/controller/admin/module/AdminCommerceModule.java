package com.neighborhood.app.controller.admin.module;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.neighborhood.app.common.Result;
import com.neighborhood.app.controller.admin.AdminSupport;
import com.neighborhood.app.dto.admin.AdminCommerceRequests.CancelOrderRequest;
import com.neighborhood.app.dto.admin.AdminCommerceRequests.ServiceCreateRequest;
import com.neighborhood.app.dto.admin.AdminCommonRequests.StatusRequest;
import com.neighborhood.app.entity.market.MarketItem;
import com.neighborhood.app.entity.service.Order;
import com.neighborhood.app.entity.service.ServiceEntity;
import com.neighborhood.app.mapper.service.ServiceMapper;
import com.neighborhood.app.service.MarketService;
import com.neighborhood.app.service.OrderService;
import com.neighborhood.app.service.ServiceModuleService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** 文件作用：管理端交易模块封装。 */
@Component
@RequiredArgsConstructor
public class AdminCommerceModule {

    private final AdminSupport support;
    private final ServiceMapper serviceMapper;
    private final MarketService marketService;
    private final ServiceModuleService serviceModuleService;
    private final OrderService orderService;

    public Result<List<Map<String, Object>>> goods() {
        String sql = """
                SELECT m.*, u.name seller_name, u.avatar seller_avatar, u.tag seller_tag, u.rating seller_rating
                FROM t_market_item m LEFT JOIN t_user u ON m.seller_id = u.id
                ORDER BY m.created_at DESC
                """;
        return Result.ok(support.mapQueryList(sql, support::goodsItem));
    }

    public Result<Void> updateGoodsStatus(Long id, StatusRequest body) {
        MarketItem item = marketService.getById(id);
        if (item == null) {
            return Result.fail("商品不存在");
        }
        item.setStatus(support.requestStatus(body, "active"));
        item.setRejectReason(support.requestRejectReason(body));
        marketService.updateById(item);
        support.evictMarketRelated(id);
        return Result.ok();
    }

    public Result<List<Map<String, Object>>> services() {
        String sql = """
                SELECT s.*, u.name provider_name, u.avatar provider_avatar, u.tag provider_tag, u.is_verified provider_verified
                FROM t_service s LEFT JOIN t_user u ON s.seller_id = u.id
                ORDER BY s.created_at DESC
                """;
        return Result.ok(support.mapQueryList(sql, support::serviceItem));
    }

    public Result<Void> addService(ServiceCreateRequest body, String userId) {
        ServiceEntity service = new ServiceEntity();
        service.setTitle(body == null ? "" : support.empty(body.title()));
        service.setDescription(body == null ? "" : support.empty(body.description()));
        service.setCategory(body == null ? "" : support.empty(body.category()));
        service.setPrice(support.decimal(body == null ? null : body.price()));
        service.setSellerId(userId);
        service.setRating(0D);
        service.setReviews(0);
        service.setDistance("");
        service.setUnit(body == null ? "" : support.empty(body.unit()));
        service.setStatus(body == null ? "pending" : support.emptyTo(body.status(), "pending"));
        service.setRejectReason("");
        service.setHighlights("");
        serviceModuleService.save(service);
        serviceMapper.update(null, new LambdaUpdateWrapper<ServiceEntity>()
                .eq(ServiceEntity::getId, service.getId())
                .setSql("area = '" + support.escapeSql(body == null ? "" : support.empty(body.area()))
                        + "', phone = '" + support.escapeSql(body == null ? "" : support.empty(body.phone())) + "'"));
        return Result.ok();
    }

    public Result<Void> updateServiceStatus(Long id, StatusRequest body) {
        ServiceEntity service = serviceModuleService.getById(id);
        if (service == null) {
            return Result.fail("服务不存在");
        }
        service.setStatus(support.requestStatus(body, "active"));
        service.setRejectReason(support.requestRejectReason(body));
        serviceModuleService.updateById(service);
        support.evictServiceRelated(id);
        return Result.ok();
    }

    public Result<List<Map<String, Object>>> orders() {
        try {
            String sql = """
                    SELECT o.*, bu.name buyer_name, bu.tag buyer_tag, su.name seller_name, su.tag seller_tag, s.title service_name
                    FROM t_order o
                    LEFT JOIN t_user bu ON o.buyer_id = bu.id
                    LEFT JOIN t_user su ON o.seller_id = su.id
                    LEFT JOIN t_service s ON o.service_id = s.id
                    ORDER BY o.create_time DESC
                    """;
            return Result.ok(support.mapQueryList(sql, support::orderItem));
        } catch (Exception ignored) {
            return Result.ok(support.mapQueryList("SELECT * FROM t_order ORDER BY create_time DESC", support::orderItem));
        }
    }

    public Result<Void> cancelOrder(Long id, CancelOrderRequest body) {
        Order order = orderService.getById(id);
        if (order == null) {
            return Result.fail("订单不存在");
        }
        order.setStatus("cancelled");
        order.setCancelReason(support.emptyTo(body == null ? null : body.reason(), "管理员强制取消"));
        order.setUpdateTime(LocalDateTime.now());
        orderService.updateById(order);
        return Result.ok();
    }
}
