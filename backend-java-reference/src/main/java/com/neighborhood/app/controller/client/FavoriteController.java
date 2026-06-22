package com.neighborhood.app.controller.client;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.common.ResultUtils;
import com.neighborhood.app.dto.interaction.AddFavoriteRequest;
import com.neighborhood.app.entity.market.Favorite;
import com.neighborhood.app.service.FavoriteService;
import com.neighborhood.app.utils.RequestUserUtil;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 用户端收藏接口。 */
@RestController
@RequestMapping("/api/favorite")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody AddFavoriteRequest request, HttpServletRequest httpRequest) {
        return ResultUtils.bool(favoriteService.addFavorite(
                RequestUserUtil.currentUserId(httpRequest),
                request.getTargetType(),
                request.getTargetId()
        ));
    }

    @PostMapping("/remove")
    public Result<Boolean> remove(@RequestBody AddFavoriteRequest request, HttpServletRequest httpRequest) {
        return ResultUtils.bool(favoriteService.removeFavorite(
                RequestUserUtil.currentUserId(httpRequest),
                request.getTargetType(),
                request.getTargetId()
        ));
    }

    @GetMapping("/list")
    public Result<List<Favorite>> list(HttpServletRequest httpRequest) {
        return Result.ok(favoriteService.getUserFavorites(RequestUserUtil.currentUserId(httpRequest)));
    }

    @GetMapping("/check")
    public Result<Boolean> check(
            @RequestParam String targetType,
            @RequestParam Long targetId,
            HttpServletRequest httpRequest) {
        return ResultUtils.bool(favoriteService.isFavorited(
                RequestUserUtil.currentUserId(httpRequest),
                targetType,
                targetId
        ));
    }
}
