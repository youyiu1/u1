package com.neighborhood.app.service.impl;

import com.neighborhood.app.config.S3Config;
import com.neighborhood.app.service.FileService;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Date;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
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

/** 文件作用：文件服务实现。 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    private static final String FILE_PROXY_PREFIX = "/api/file/";
    private static final int MAX_PRESIGNED_EXPIRE_MINUTES = 60;
    private static final String DEFAULT_CONTENT_TYPE = "application/octet-stream";
    private static final String DEFAULT_IMAGE_CONTENT_TYPE = "image/jpeg";
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".gif", ".webp");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/gif", "image/webp");

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
        String originalFilename = file.getOriginalFilename();
        String extension = requireAllowedExtension(originalFilename);
        String contentType = requireAllowedContentType(file.getContentType());
        byte[] bytes = file.getBytes();
        validateFileBytes(bytes, extension);
        String key = generateKey(extension);
        putObject(key, new ByteArrayInputStream(bytes), bytes.length, resolveContentType(contentType, DEFAULT_CONTENT_TYPE));
        String proxyPath = FILE_PROXY_PREFIX + key;
        log.info("文件上传成功: {}", proxyPath);
        return proxyPath;
    }

    @Override
    public String uploadBytes(byte[] data, String filename) throws IOException {
        if (data == null || data.length == 0) {
            throw new IllegalArgumentException("数据不能为空");
        }
        String extension = requireAllowedExtension(filename);
        validateFileBytes(data, extension);
        String key = generateKey(extension);
        s3Client.putObject(buildPutRequest(key, contentTypeByExtension(extension)), RequestBody.fromBytes(data));
        log.info("字节数据上传成功: {}", key);
        return buildPublicUrl(key);
    }

    @Override
    public byte[] getFile(String key) throws IOException {
        log.info("获取文件: bucket={}, key={}", s3Config.getBucket(), key);
        try (var response = s3Client.getObject(buildGetRequest(key))) {
            return response.readAllBytes();
        }
    }

    @Override
    public void deleteFile(String url) {
        String key = extractKeyFromUrl(url);
        if (key == null) {
            log.warn("无法从 URL 提取文件 key: {}", url);
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
        int safeExpirationMinutes = Math.max(1, Math.min(expirationMinutes, MAX_PRESIGNED_EXPIRE_MINUTES));
        String presignedUrl = s3Presigner.presignGetObject(GetObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofMinutes(safeExpirationMinutes))
                        .getObjectRequest(buildGetRequest(key))
                        .build())
                .url()
                .toString();
        return s3Config.getEndpoint() + "/" + s3Config.getBucket() + "/" + key
                + presignedUrl.substring(presignedUrl.indexOf("?"));
    }

    @Override
    public String buildPublicUrl(String key) {
        return joinPath(preferredPublicBaseUrl(), normalizeKey(key));
    }

    private String generateKey(String extension) {
        String datePath = String.format("images/%tF", new Date()).replace("-", "/");
        return datePath + UUID.randomUUID().toString().replace("-", "") + extension;
    }

    private void putObject(String key, InputStream input, long size, String contentType) throws IOException {
        s3Client.putObject(buildPutRequest(key, contentType), RequestBody.fromInputStream(input, size));
    }

    private PutObjectRequest buildPutRequest(String key, String contentType) {
        return PutObjectRequest.builder()
                .bucket(s3Config.getBucket())
                .key(key)
                .contentType(contentType)
                .build();
    }

    private GetObjectRequest buildGetRequest(String key) {
        return GetObjectRequest.builder()
                .bucket(s3Config.getBucket())
                .key(key)
                .build();
    }

    private String resolveContentType(String contentType, String fallback) {
        return contentType == null || contentType.isBlank() ? fallback : contentType;
    }

    private String requireAllowedExtension(String filename) {
        String extension = normalizeExtension(filename);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("仅支持 jpg、jpeg、png、gif、webp 格式图片");
        }
        return extension;
    }

    private String requireAllowedContentType(String contentType) {
        String normalized = resolveContentType(contentType, "").toLowerCase(Locale.ROOT);
        if (!ALLOWED_CONTENT_TYPES.contains(normalized)) {
            throw new IllegalArgumentException("文件类型不支持");
        }
        return normalized;
    }

    private String normalizeExtension(String filename) {
        if (filename == null || filename.isBlank() || !filename.contains(".")) {
            return ".jpg";
        }
        return filename.substring(filename.lastIndexOf('.')).toLowerCase(Locale.ROOT);
    }

    private void validateFileBytes(byte[] data, String extension) {
        if (data == null || data.length == 0) {
            throw new IllegalArgumentException("文件内容不能为空");
        }
        if (!matchesSignature(data, extension)) {
            throw new IllegalArgumentException("文件内容与扩展名不匹配");
        }
    }

    private boolean matchesSignature(byte[] data, String extension) {
        return switch (extension) {
            case ".jpg", ".jpeg" -> startsWith(data, (byte) 0xFF, (byte) 0xD8, (byte) 0xFF);
            case ".png" -> startsWith(data, (byte) 0x89, (byte) 0x50, (byte) 0x4E, (byte) 0x47);
            case ".gif" -> startsWithAscii(data, "GIF87a") || startsWithAscii(data, "GIF89a");
            case ".webp" -> startsWithAscii(data, "RIFF") && containsAsciiAt(data, 8, "WEBP");
            default -> false;
        };
    }

    private boolean startsWith(byte[] data, byte... signature) {
        if (data.length < signature.length) {
            return false;
        }
        for (int i = 0; i < signature.length; i++) {
            if (data[i] != signature[i]) {
                return false;
            }
        }
        return true;
    }

    private boolean startsWithAscii(byte[] data, String signature) {
        return containsAsciiAt(data, 0, signature);
    }

    private boolean containsAsciiAt(byte[] data, int offset, String signature) {
        byte[] bytes = signature.getBytes(StandardCharsets.US_ASCII);
        if (data.length < offset + bytes.length) {
            return false;
        }
        for (int i = 0; i < bytes.length; i++) {
            if (data[offset + i] != bytes[i]) {
                return false;
            }
        }
        return true;
    }

    private String contentTypeByExtension(String extension) {
        return switch (extension) {
            case ".png" -> "image/png";
            case ".gif" -> "image/gif";
            case ".webp" -> "image/webp";
            default -> DEFAULT_IMAGE_CONTENT_TYPE;
        };
    }

    private String extractKeyFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        if (url.startsWith(FILE_PROXY_PREFIX)) {
            return normalizeKey(url.substring(FILE_PROXY_PREFIX.length()));
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
        return FILE_PROXY_PREFIX.substring(0, FILE_PROXY_PREFIX.length() - 1);
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
