package com.neighborhood.app.controller.client;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.service.HomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;

    /** 首页聚合数据。 */
    @GetMapping("/index")
    public Result<Map<String, Object>> index() {
        return Result.ok(homeService.getHomeIndex());
    }
}
