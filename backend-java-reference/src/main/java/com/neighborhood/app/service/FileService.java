package com.neighborhood.app.service;

import java.io.IOException;
import org.springframework.web.multipart.MultipartFile;

/** 文件作用：文件服务接口。 */
public interface FileService {
    String uploadFile(MultipartFile file) throws IOException;
    String uploadBytes(byte[] data, String filename) throws IOException;
    byte[] getFile(String key) throws IOException;
    byte[] getPublicFile(String key) throws IOException;
    void deleteFile(String url);
    boolean fileExists(String key);
    String ensureDefaultAvatar();
    String generatePresignedUrl(String key, int expirationMinutes);
    String buildPublicUrl(String key);
}
