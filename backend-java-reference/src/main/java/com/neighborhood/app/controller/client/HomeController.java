package com.neighborhood.app.controller.client;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.dto.home.HomeIndexData;
import com.neighborhood.app.service.HomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 鏂囦欢浣滅敤锛氱敤鎴风棣栭〉鎺ュ彛銆?*/
@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;

    /** 棣栭〉鑱氬悎鏁版嵁銆?*/
    @GetMapping("/index")
    public Result<HomeIndexData> index() {
        return Result.ok(homeService.getHomeIndex());
    }
}
