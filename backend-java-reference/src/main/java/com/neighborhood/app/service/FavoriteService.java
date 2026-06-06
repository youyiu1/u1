package com.neighborhood.app.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.neighborhood.app.entity.market.Favorite;
import java.util.List;

/** 文件作用：收藏服务接口。 */
public interface FavoriteService extends IService<Favorite> {
    /** 添加收藏。 */
    boolean addFavorite(String userId, String targetType, Long targetId);

    /** 取消收藏。 */
    boolean removeFavorite(String userId, String targetType, Long targetId);

    /** 获取用户收藏列表。 */
    List<Favorite> getUserFavorites(String userId);

    /** 判断是否已收藏，优先使用缓存。 */
    boolean isFavorited(String userId, String targetType, Long targetId);
}
