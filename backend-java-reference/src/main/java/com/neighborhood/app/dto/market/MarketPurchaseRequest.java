package com.neighborhood.app.dto.market;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/** 闲置商品购买请求。 */
@Data
public class MarketPurchaseRequest {
    @NotBlank(message = "商品不能为空")
    @Pattern(regexp = "\\d+", message = "商品参数无效")
    private String itemId;
}
