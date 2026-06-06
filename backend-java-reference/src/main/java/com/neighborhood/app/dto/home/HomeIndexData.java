package com.neighborhood.app.dto.home;

import com.neighborhood.app.entity.service.ServiceEntity;
import com.neighborhood.app.vo.content.NewsVO;
import com.neighborhood.app.vo.market.MarketItemVO;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

/** 文件作用：首页聚合缓存数据。 */
@Data
public class HomeIndexData {

    private List<NewsVO> hotNews = new ArrayList<>();

    private List<MarketItemVO> hotMarket = new ArrayList<>();

    private List<ServiceEntity> hotServices = new ArrayList<>();
}
