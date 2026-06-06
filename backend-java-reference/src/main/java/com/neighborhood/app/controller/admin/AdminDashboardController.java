package com.neighborhood.app.controller.admin;

import com.neighborhood.app.common.Result;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 文件作用：管理端首页接口。 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminSupport support;

    @GetMapping("/dashboard/stats")
    public Result<Map<String, Object>> stats() {
        return support.stats();
    }
}
