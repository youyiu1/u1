/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service;

import com.neighborhood.app.config.S3Config;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final S3Config s3Config;

    /** 上传文件，返回代理路径 */
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

    /** 上传字节数组 */
    public String uploadBytes(byte[] data, String filename) throws IOException {
        if (data == null || data.length == 0) {
            throw new IllegalArgumentException("数据不能为空");
        }
        String key = generateKey(filename);
        s3Client.putObject(PutObjectRequest.builder()
                .bucket(s3Config.getBucket()).key(key).contentType("image/jpeg").build(),
                RequestBody.fromBytes(data));
        log.info("字节数据上传成功: {}", key);
        return s3Config.getEndpoint() + "/" + s3Config.getBucket() + "/" + key;
    }

    /** 获取文件内容 */
    public byte[] getFile(String key) throws IOException {
        log.info("获取文件: bucket={}, key={}", s3Config.getBucket(), key);
        try (var response = s3Client.getObject(GetObjectRequest.builder()
                .bucket(s3Config.getBucket()).key(key).build())) {
            return response.readAllBytes();
        }
    }

    /** 删除文件 */
    public void deleteFile(String url) {
        String key = extractKeyFromUrl(url);
        if (key == null) {
            log.warn("无法从URL提取key: {}", url);
            return;
        }
        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(s3Config.getBucket()).key(key).build());
        log.info("文件删除成功: {}", key);
    }

    /** 检查文件是否存在 */
    public boolean fileExists(String key) {
        try {
            s3Client.headObject(HeadObjectRequest.builder()
                    .bucket(s3Config.getBucket()).key(key).build());
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /** 生成签名URL */
    public String generatePresignedUrl(String key, int expirationMinutes) {
        String presignedUrl = s3Presigner.presignGetObject(GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(expirationMinutes))
                .getObjectRequest(GetObjectRequest.builder()
                        .bucket(s3Config.getBucket()).key(key).build())
                .build()).url().toString();
        // 提取签名查询参数，重组为 path-style URL
        return s3Config.getEndpoint() + "/" + s3Config.getBucket() + "/" + key
                + presignedUrl.substring(presignedUrl.indexOf("?"));
    }

    /** 生成文件key：images/yyyy/MM/dd/uuid.ext */
    private String generateKey(String filename) {
        String ext = "";
        if (filename != null && filename.contains(".")) {
            ext = filename.substring(filename.lastIndexOf('.'));
        }
        String datePath = String.format("images/%tF", new java.util.Date()).replace("-", "/");
        return datePath + UUID.randomUUID().toString().replace("-", "") + ext;
    }

    /** 上传对象到RustFS */
    private void putObject(String key, InputStream input, long size, String contentType) throws IOException {
        if (contentType == null) contentType = "application/octet-stream";
        s3Client.putObject(PutObjectRequest.builder()
                .bucket(s3Config.getBucket()).key(key).contentType(contentType).build(),
                RequestBody.fromInputStream(input, size));
    }

    /** 从URL提取key */
    private String extractKeyFromUrl(String url) {
        if (url == null || url.isEmpty()) return null;
        String bucketPath = "/" + s3Config.getBucket() + "/";
        int idx = url.indexOf(bucketPath);
        return idx > 0 ? url.substring(idx + bucketPath.length()) : null;
    }
}
