/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/file")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    /**
     * 图片上传接口
     */
    @PostMapping("/upload")
    public Result<String> upload(@RequestParam("file") MultipartFile file) {
        try {
            String url = fileService.uploadFile(file);
            return Result.ok(url);
        } catch (Exception e) {
            return Result.fail("上传失败: " + e.getMessage());
        }
    }
}