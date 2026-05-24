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
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {

    private final S3Client s3Client;
    private final S3Config s3Config;

    /**
     * 上传单个文件到RustFS，返回访问URL
     */
    public String uploadFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }

        String originalFilename = file.getOriginalFilename();
        String ext = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            ext = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString().replace("-", "") + ext;

        // 按日期分类存储：images/2026/05/22/filename.jpg
        String datePath = String.format("images/%tF", new java.util.Date()).replace("-", "/");
        String key = datePath + filename;

        String contentType = file.getContentType();
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(s3Config.getBucket())
                .key(key)
                .contentType(contentType)
                .build();

        try (InputStream inputStream = file.getInputStream()) {
            s3Client.putObject(putRequest, RequestBody.fromInputStream(inputStream, file.getSize()));
        }

        // 返回后端代理路径，前端通过 /api/file/{key} 访问
        String proxyPath = "/api/file/" + key;
        log.info("文件上传成功: {}", proxyPath);
        return proxyPath;
    }

    /**
     * 上传字节数组到RustFS（用于已有图片URL的复制存储）
     */
    public String uploadBytes(byte[] data, String filename) throws IOException {
        if (data == null || data.length == 0) {
            throw new IllegalArgumentException("数据不能为空");
        }

        String ext = "";
        if (filename != null && filename.contains(".")) {
            ext = filename.substring(filename.lastIndexOf("."));
        }
        String newFilename = UUID.randomUUID().toString().replace("-", "") + ext;

        String datePath = String.format("images/%tF", new java.util.Date()).replace("-", "/");
        String key = datePath + newFilename;

        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(s3Config.getBucket())
                .key(key)
                .contentType("image/jpeg")
                .build();

        s3Client.putObject(putRequest, RequestBody.fromBytes(data));

        String url = s3Config.getEndpoint() + "/" + s3Config.getBucket() + "/" + key;
        log.info("字节数据上传成功: {}", url);
        return url;
    }

    /**
     * 获取文件（用于前端代理访问RustFS文件）
     */
    public byte[] getFile(String key) throws IOException {
        GetObjectRequest getRequest = GetObjectRequest.builder()
                .bucket(s3Config.getBucket())
                .key(key)
                .build();

        try (var response = s3Client.getObject(getRequest)) {
            return response.readAllBytes();
        }
    }

    /**
     * 删除文件
     */
    public void deleteFile(String url) {
        // 从URL中提取key
        String key = extractKeyFromUrl(url);
        if (key == null) {
            log.warn("无法从URL提取key: {}", url);
            return;
        }

        DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                .bucket(s3Config.getBucket())
                .key(key)
                .build();

        s3Client.deleteObject(deleteRequest);
        log.info("文件删除成功: {}", key);
    }

    /**
     * 检查文件是否存在
     */
    public boolean fileExists(String key) {
        try {
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(s3Config.getBucket())
                    .key(key)
                    .build();
            s3Client.headObject(headRequest);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 从URL提取RustFS的key
     */
    private String extractKeyFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        // URL格式: http://localhost:9000/neighborhood/images/2026/05/22/xxx.jpg
        String bucketPath = "/" + s3Config.getBucket() + "/";
        int idx = url.indexOf(bucketPath);
        if (idx > 0) {
            return url.substring(idx + bucketPath.length());
        }
        return null;
    }
}