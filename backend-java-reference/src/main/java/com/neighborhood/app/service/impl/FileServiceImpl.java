package com.neighborhood.app.service.impl;

import com.neighborhood.app.config.S3Config;
import com.neighborhood.app.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    private static final String DEFAULT_CONTENT_TYPE = "application/octet-stream";
    private static final String DEFAULT_IMAGE_CONTENT_TYPE = "image/jpeg";

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final S3Config s3Config;

    @Value("${app.file.public-base-url:}")
    private String publicBaseUrl;

    @Value("${app.file.cdn-base-url:}")
    private String cdnBaseUrl;

    @Override
    public String uploadFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }
        String key = generateKey(file.getOriginalFilename());
        putObject(key, file.getInputStream(), file.getSize(), file.getContentType());
        String proxyPath = "/api/file/" + key;
        log.info("文件上传成功: {}", proxyPath);
        return proxyPath;
    }

    @Override
    public String uploadBytes(byte[] data, String filename) throws IOException {
        if (data == null || data.length == 0) {
            throw new IllegalArgumentException("数据不能为空");
        }
        String key = generateKey(filename);
        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(s3Config.getBucket())
                        .key(key)
                        .contentType(DEFAULT_IMAGE_CONTENT_TYPE)
                        .build(),
                RequestBody.fromBytes(data)
        );
        log.info("字节数据上传成功: {}", key);
        return buildPublicUrl(key);
    }

    @Override
    public byte[] getFile(String key) throws IOException {
        log.info("获取文件: bucket={}, key={}", s3Config.getBucket(), key);
        try (var response = s3Client.getObject(GetObjectRequest.builder()
                .bucket(s3Config.getBucket())
                .key(key)
                .build())) {
            return response.readAllBytes();
        }
    }

    @Override
    public void deleteFile(String url) {
        String key = extractKeyFromUrl(url);
        if (key == null) {
            log.warn("无法从 URL 提取 key: {}", url);
            return;
        }
        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(s3Config.getBucket())
                .key(key)
                .build());
        log.info("文件删除成功: {}", key);
    }

    @Override
    public boolean fileExists(String key) {
        try {
            s3Client.headObject(HeadObjectRequest.builder()
                    .bucket(s3Config.getBucket())
                    .key(key)
                    .build());
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public String generatePresignedUrl(String key, int expirationMinutes) {
        String presignedUrl = s3Presigner.presignGetObject(GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(expirationMinutes))
                .getObjectRequest(GetObjectRequest.builder()
                        .bucket(s3Config.getBucket())
                        .key(key)
                        .build())
                .build())
                .url()
                .toString();
        return s3Config.getEndpoint() + "/" + s3Config.getBucket() + "/" + key
                + presignedUrl.substring(presignedUrl.indexOf("?"));
    }

    @Override
    public String buildPublicUrl(String key) {
        String normalizedKey = normalizeKey(key);
        String baseUrl = preferredPublicBaseUrl();
        return joinPath(baseUrl, normalizedKey);
    }

    private String generateKey(String filename) {
        String ext = "";
        if (filename != null && filename.contains(".")) {
            ext = filename.substring(filename.lastIndexOf('.'));
        }
        String datePath = String.format("images/%tF", new Date()).replace("-", "/");
        return datePath + UUID.randomUUID().toString().replace("-", "") + ext;
    }

    private void putObject(String key, InputStream input, long size, String contentType) throws IOException {
        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(s3Config.getBucket())
                        .key(key)
                        .contentType(contentType == null || contentType.isBlank() ? DEFAULT_CONTENT_TYPE : contentType)
                        .build(),
                RequestBody.fromInputStream(input, size)
        );
    }

    private String extractKeyFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        if (url.startsWith("/api/file/")) {
            return normalizeKey(url.substring("/api/file/".length()));
        }
        String bucketPath = "/" + s3Config.getBucket() + "/";
        int index = url.indexOf(bucketPath);
        return index > 0 ? normalizeKey(url.substring(index + bucketPath.length())) : null;
    }

    private String preferredPublicBaseUrl() {
        if (cdnBaseUrl != null && !cdnBaseUrl.isBlank()) {
            return trimTrailingSlash(cdnBaseUrl);
        }
        if (publicBaseUrl != null && !publicBaseUrl.isBlank()) {
            return trimTrailingSlash(publicBaseUrl);
        }
        return "/api/file";
    }

    private String normalizeKey(String key) {
        if (key == null || key.isBlank()) {
            return "";
        }
        return key.startsWith("/") ? key.substring(1) : key;
    }

    private String joinPath(String baseUrl, String key) {
        return baseUrl + "/" + key;
    }

    private String trimTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
