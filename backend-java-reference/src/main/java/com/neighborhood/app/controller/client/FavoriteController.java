package com.neighborhood.app.controller.client;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.common.ResultUtils;
import com.neighborhood.app.dto.interaction.AddFavoriteRequest;
import com.neighborhood.app.entity.market.Favorite;
import com.neighborhood.app.service.FavoriteService;
import com.neighborhood.app.utils.RequestUserUtil;
import jakarta.servlet.http.HttpServletRequest;
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

    /** 添加收藏 */
    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody AddFavoriteRequest request, HttpServletRequest httpRequest) {
        return ResultUtils.bool(favoriteService.addFavorite(
                RequestUserUtil.currentUserId(httpRequest),
                request.getTargetType(),
                request.getTargetId()
        ));
    }

    /** 取消收藏 */
    @PostMapping("/remove")
    public Result<Boolean> remove(@RequestBody AddFavoriteRequest request, HttpServletRequest httpRequest) {
        return ResultUtils.bool(favoriteService.removeFavorite(
                RequestUserUtil.currentUserId(httpRequest),
                request.getTargetType(),
                request.getTargetId()
        ));
    }

    /** 获取当前用户收藏列表 */
    @GetMapping("/list")
    public Result<List<Favorite>> list(@RequestParam(required = false) String userId, HttpServletRequest httpRequest) {
        return Result.ok(favoriteService.getUserFavorites(RequestUserUtil.getEffectiveUserId(httpRequest, userId)));
    }

    /** 检查当前用户是否已收藏 */
    @GetMapping("/check")
    public Result<Boolean> check(
            @RequestParam(required = false) String userId,
            @RequestParam String targetType,
            @RequestParam Long targetId,
            HttpServletRequest httpRequest) {
        return ResultUtils.bool(favoriteService.isFavorited(
                RequestUserUtil.getEffectiveUserId(httpRequest, userId),
                targetType,
                targetId
        ));
    }
}
