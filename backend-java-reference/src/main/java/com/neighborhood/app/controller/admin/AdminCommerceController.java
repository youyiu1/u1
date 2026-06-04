package com.neighborhood.app.controller.admin;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.dto.admin.AdminCommerceRequests.CancelOrderRequest;
import com.neighborhood.app.dto.admin.AdminCommerceRequests.ServiceCreateRequest;
import com.neighborhood.app.dto.admin.AdminCommonRequests.StatusRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminCommerceController {

    private final com.neighborhood.app.controller.admin.module.AdminCommerceModule module;

    @GetMapping("/goods")
    public Result<List<Map<String, Object>>> goods() {
        return module.goods();
    }

    @PostMapping("/goods/{id}/status")
    public Result<Void> updateGoodsStatus(@PathVariable Long id, @RequestBody StatusRequest body) {
        return module.updateGoodsStatus(id, body);
    }

    @GetMapping("/services")
    public Result<List<Map<String, Object>>> services() {
        return module.services();
    }

    @PostMapping("/services")
    public Result<Void> addService(@RequestBody ServiceCreateRequest body, @RequestAttribute String userId) {
        return module.addService(body, userId);
    }

    @PostMapping("/services/{id}/status")
    public Result<Void> updateServiceStatus(@PathVariable Long id, @RequestBody StatusRequest body) {
        return module.updateServiceStatus(id, body);
    }

    @GetMapping("/orders")
    public Result<List<Map<String, Object>>> orders() {
        return module.orders();
    }

    @PostMapping("/orders/{id}/cancel")
    public Result<Void> cancelOrder(@PathVariable Long id, @RequestBody CancelOrderRequest body) {
        return module.cancelOrder(id, body);
    }
}
