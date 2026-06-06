/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller.client;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.common.ResultUtils;
import com.neighborhood.app.dto.market.MarketPurchaseRequest;
import com.neighborhood.app.entity.market.MarketItem;
import com.neighborhood.app.entity.user.User;
import com.neighborhood.app.service.MarketService;
import com.neighborhood.app.service.NotificationService;
import com.neighborhood.app.service.UserService;
import com.neighborhood.app.utils.RequestUserUtil;
import com.neighborhood.app.utils.StringValueUtil;
import com.neighborhood.app.vo.market.MarketItemVO;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 用户端闲置商品接口。 */
@Slf4j
@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class MarketController {

    private static final String ACTIVE_STATUS = "active";
    private static final String PURCHASE_SUBMITTED_TITLE = "购买请求已提交";
    private static final String PURCHASE_REQUEST_TITLE = "新的购买请求";

    private final MarketService marketService;
    private final NotificationService notificationService;
    private final UserService userService;

    @GetMapping("/list")
    public Result<List<MarketItemVO>> list() {
        return Result.ok(marketService.listVO());
    }

    /** 获取用户商品列表。 */
    @GetMapping("/user/{userId}")
    public Result<List<MarketItemVO>> listByUserId(@PathVariable String userId) {
        return Result.ok(marketService.listByUserId(userId));
    }

    /** 获取闲置商品详情。 */
    @GetMapping("/{id}")
    public Result<MarketItemVO> getById(@PathVariable Long id, HttpServletRequest request) {
        return Result.ok(marketService.getMarketItemVOById(id, RequestUserUtil.currentUserId(request)));
    }

    /** 创建闲置商品。 */
    @PostMapping("/create")
    public Result<Boolean> create(@RequestBody MarketItem item, HttpServletRequest request) {
        String userId = (String) request.getAttribute("userId");
        item.setSellerId(userId);
        return Result.ok(marketService.save(item));
    }

    /** 提交闲置商品购买请求。 */
    @PostMapping("/purchase")
    public Result<Boolean> purchase(@RequestBody MarketPurchaseRequest request, HttpServletRequest httpRequest) {
        String buyerId = RequestUserUtil.currentUserId(httpRequest);
        if (buyerId == null || buyerId.isBlank() || request == null || request.getItemId() == null || request.getItemId().isBlank()) {
            return ResultUtils.fail("购买请求参数无效");
        }

        Long itemId;
        try {
            itemId = Long.parseLong(request.getItemId());
        } catch (NumberFormatException exception) {
            return ResultUtils.fail("商品参数无效");
        }

        MarketItem item = marketService.getById(itemId);
        if (item == null || !ACTIVE_STATUS.equals(StringValueUtil.emptyTo(item.getStatus(), ACTIVE_STATUS))) {
            return ResultUtils.fail("商品不存在或已下架");
        }
        if (buyerId.equals(item.getSellerId())) {
            return ResultUtils.fail("不能购买自己的商品");
        }
        if (notificationService.hasPendingMarketPurchaseRequest(item.getSellerId(), buyerId, itemId)) {
            return ResultUtils.fail("您已提交过购买请求，请等待卖家处理");
        }

        User buyer = userService.getById(buyerId);
        String buyerName = buyer == null ? "用户" : StringValueUtil.emptyTo(buyer.getName(), "用户");
        String itemTitle = StringValueUtil.emptyTo(item.getTitle(), "闲置商品");

        notificationService.saveNotification(
                buyerId,
                PURCHASE_SUBMITTED_TITLE,
                "您已成功提交商品《" + itemTitle + "》的购买请求，请留意卖家后续回复。",
                itemTitle
        );
        notificationService.saveNotificationWithMarketItem(
                item.getSellerId(),
                PURCHASE_REQUEST_TITLE,
                "用户 " + buyerName + " 想购买您的商品《" + itemTitle + "》，请及时处理。",
                itemTitle,
                buyerId,
                itemId
        );
        return ResultUtils.bool(true);
    }
}
