package com.neighborhood.app.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileService {
    String uploadFile(MultipartFile file) throws IOException;
    String uploadBytes(byte[] data, String filename) throws IOException;
    byte[] getFile(String key) throws IOException;
    void deleteFile(String url);
    boolean fileExists(String key);
    String generatePresignedUrl(String key, int expirationMinutes);
}