/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller.client;

import com.neighborhood.app.entity.market.Favorite;
import com.neighborhood.app.dto.interaction.AddFavoriteRequest;
import com.neighborhood.app.service.FavoriteService;
import com.neighborhood.app.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/favorite")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    /**
     * 添加收藏
     */
    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody AddFavoriteRequest request) {
        return booleanResult(favoriteService.addFavorite(
                request.getUserId(),
                request.getTargetType(),
                request.getTargetId()
        ));
    }

    /**
     * 取消收藏
     */
    @PostMapping("/remove")
    public Result<Boolean> remove(@RequestBody AddFavoriteRequest request) {
        return booleanResult(favoriteService.removeFavorite(
                request.getUserId(),
                request.getTargetType(),
                request.getTargetId()
        ));
    }

    /**
     * 获取用户收藏列表
     */
    @GetMapping("/list")
    public Result<List<Favorite>> list(@RequestParam String userId) {
        return Result.ok(favoriteService.getUserFavorites(userId));
    }

    /**
     * 检查是否已收藏
     */
    @GetMapping("/check")
    public Result<Boolean> check(
            @RequestParam String userId,
            @RequestParam String targetType,
            @RequestParam Long targetId) {
        return booleanResult(favoriteService.isFavorited(userId, targetType, targetId));
    }

    private Result<Boolean> booleanResult(boolean success) {
        return Result.ok(success);
    }
}
