/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.controller;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/file")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    /**
     * 上传文件到RustFS私有桶
     */
    @PostMapping("/upload")
    public Result<String> upload(@RequestParam("file") MultipartFile file) {
        try {
            return Result.ok(fileService.uploadFile(file));
        } catch (Exception e) {
            return Result.fail("上传失败: " + e.getMessage());
        }
    }

    /**
     * 获取文件的签名URL（用于访问RustFS私有桶中的文件）
     */
    @GetMapping("/url/{*filename}")
    public ResponseEntity<?> getFileUrl(@PathVariable String filename,
                                       @RequestParam(defaultValue = "60") int expiresMinutes) {
        try {
            return ResponseEntity.ok(Result.ok(fileService.generatePresignedUrl(cleanKey(filename), expiresMinutes)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Result.fail("获取签名URL失败: " + e.getMessage()));
        }
    }

    /**
     * 后端代理访问RustFS私有桶中的文件
     */
    @GetMapping("/{*filename}")
    public ResponseEntity<?> getFile(@PathVariable String filename) {
        try {
            String key = cleanKey(filename);
            byte[] data = fileService.getFile(key);
            return ResponseEntity.ok().contentType(getMediaType(key)).body(data);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** 去掉前导斜杠 */
    private String cleanKey(String filename) {
        return filename.startsWith("/") ? filename.substring(1) : filename;
    }

    /** 根据文件扩展名获取MediaType */
    private MediaType getMediaType(String key) {
        return switch (key.substring(key.lastIndexOf('.')).toLowerCase()) {
            case ".png" -> MediaType.IMAGE_PNG;
            case ".jpg", ".jpeg" -> MediaType.IMAGE_JPEG;
            case ".gif" -> MediaType.IMAGE_GIF;
            case ".webp" -> MediaType.parseMediaType("image/webp");
            case ".svg" -> MediaType.parseMediaType("image/svg+xml");
            default -> MediaType.APPLICATION_OCTET_STREAM;
        };
    }
}
