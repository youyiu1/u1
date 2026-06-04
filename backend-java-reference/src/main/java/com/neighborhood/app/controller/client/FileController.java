package com.neighborhood.app.controller.client;

import com.neighborhood.app.common.Result;
import com.neighborhood.app.service.AppMetricsService;
import com.neighborhood.app.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;

@RestController
@RequestMapping("/api/file")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;
    private final AppMetricsService appMetricsService;

    /** 上传文件到对象存储。 */
    @PostMapping("/upload")
    public Result<String> upload(@RequestParam("file") MultipartFile file) {
        try {
            String path = fileService.uploadFile(file);
            appMetricsService.recordFileAccess("upload", "success");
            return Result.ok(path);
        } catch (Exception e) {
            appMetricsService.recordFileAccess("upload", "fail");
            return Result.fail("上传失败: " + e.getMessage());
        }
    }

    /** 获取文件签名地址。 */
    @GetMapping("/url/{*filename}")
    public ResponseEntity<?> getFileUrl(@PathVariable String filename,
                                        @RequestParam(defaultValue = "60") int expiresMinutes) {
        try {
            appMetricsService.recordFileAccess("presign", "success");
            return ResponseEntity.ok(Result.ok(fileService.generatePresignedUrl(cleanKey(filename), expiresMinutes)));
        } catch (Exception e) {
            appMetricsService.recordFileAccess("presign", "fail");
            return ResponseEntity.badRequest().body(Result.fail("获取签名地址失败: " + e.getMessage()));
        }
    }

    /** 获取文件公共地址，配置 CDN 时优先返回 CDN 地址。 */
    @GetMapping("/public/{*filename}")
    public Result<String> getPublicUrl(@PathVariable String filename) {
        return Result.ok(fileService.buildPublicUrl(cleanKey(filename)));
    }

    /** 通过后端代理访问对象存储文件。 */
    @GetMapping("/{*filename}")
    public ResponseEntity<?> getFile(@PathVariable String filename) {
        try {
            String key = cleanKey(filename);
            byte[] data = fileService.getFile(key);
            appMetricsService.recordFileAccess("proxy_read", "success");
            return ResponseEntity.ok()
                    .contentType(getMediaType(key))
                    .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic().mustRevalidate())
                    .header(HttpHeaders.VARY, "Accept-Encoding")
                    .body(data);
        } catch (Exception e) {
            appMetricsService.recordFileAccess("proxy_read", "fail");
            return ResponseEntity.notFound().build();
        }
    }

    private String cleanKey(String filename) {
        return filename.startsWith("/") ? filename.substring(1) : filename;
    }

    private MediaType getMediaType(String key) {
        int dotIndex = key.lastIndexOf('.');
        if (dotIndex < 0) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
        return switch (key.substring(dotIndex).toLowerCase()) {
            case ".png" -> MediaType.IMAGE_PNG;
            case ".jpg", ".jpeg" -> MediaType.IMAGE_JPEG;
            case ".gif" -> MediaType.IMAGE_GIF;
            case ".webp" -> MediaType.parseMediaType("image/webp");
            case ".svg" -> MediaType.parseMediaType("image/svg+xml");
            default -> MediaType.APPLICATION_OCTET_STREAM;
        };
    }
}