/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.entity.ServiceEntity;
import com.neighborhood.app.service.ServiceModuleService;
import com.neighborhood.app.common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/service")
public class ServiceController {

    @Autowired
    private ServiceModuleService serviceModuleService;

    @GetMapping("/list")
    public Result<List<ServiceEntity>> list() {
        return Result.ok(serviceModuleService.list());
    }

    @GetMapping("/{id}")
    public Result<ServiceEntity> getById(@PathVariable Long id) {
        return Result.ok(serviceModuleService.getById(id));
    }

    @PostMapping("/create")
    public Result<Boolean> create(@RequestBody ServiceEntity service) {
        return Result.ok(serviceModuleService.save(service));
    }
}