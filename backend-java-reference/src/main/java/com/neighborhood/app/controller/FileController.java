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

    @PostMapping("/upload")
    public Result<String> upload(@RequestParam("file") MultipartFile file) {
        try {
            String url = fileService.uploadFile(file);
            return Result.ok(url);
        } catch (Exception e) {
            return Result.fail("上传失败: " + e.getMessage());
        }
    }

    @RequestMapping(value = "/images/**", method = RequestMethod.GET)
    public ResponseEntity<byte[]> serveFile(jakarta.servlet.http.HttpServletRequest request) {
        try {
            String path = request.getRequestURI();
            // 去掉 /api/file 前缀
            String key = path.substring("/api/file/".length());
            System.out.println("=== serveFile key: " + key);

            byte[] data = fileService.getFile(key);

            MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
            if (key.endsWith(".png")) {
                mediaType = MediaType.IMAGE_PNG;
            } else if (key.endsWith(".jpg") || key.endsWith(".jpeg")) {
                mediaType = MediaType.IMAGE_JPEG;
            } else if (key.endsWith(".gif")) {
                mediaType = MediaType.IMAGE_GIF;
            } else if (key.endsWith(".webp")) {
                mediaType = MediaType.parseMediaType("image/webp");
            } else if (key.endsWith(".svg")) {
                mediaType = MediaType.parseMediaType("image/svg+xml");
            }

            return ResponseEntity.ok().contentType(mediaType).body(data);
        } catch (Exception e) {
            System.out.println("serveFile error: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}