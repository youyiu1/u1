/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.entity.Favorite;
import com.neighborhood.app.dto.AddFavoriteRequest;
import com.neighborhood.app.service.FavoriteService;
import com.neighborhood.app.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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
        boolean success = favoriteService.addFavorite(
                request.getUserId(),
                request.getTargetType(),
                request.getTargetId()
        );
        return Result.ok(success);
    }

    /**
     * 取消收藏
     */
    @PostMapping("/remove")
    public Result<Boolean> remove(@RequestBody AddFavoriteRequest request) {
        boolean success = favoriteService.removeFavorite(
                request.getUserId(),
                request.getTargetType(),
                request.getTargetId()
        );
        return Result.ok(success);
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
        return Result.ok(favoriteService.isFavorited(userId, targetType, targetId));
    }
}
