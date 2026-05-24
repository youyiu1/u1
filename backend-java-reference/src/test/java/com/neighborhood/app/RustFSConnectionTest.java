/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.ByteArrayInputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class RustFSConnectionTest {

    @org.springframework.beans.factory.annotation.Value("${rustfs.endpoint}")
    private String endpoint;

    @org.springframework.beans.factory.annotation.Value("${rustfs.access-key}")
    private String accessKey;

    @org.springframework.beans.factory.annotation.Value("${rustfs.secret-key}")
    private String secretKey;

    @org.springframework.beans.factory.annotation.Value("${rustfs.bucket}")
    private String bucket;

    private S3Client getS3Client() {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);
        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.US_EAST_1)
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .forcePathStyle(true)
                .build();
    }

    @Test
    void testRustFSCreateBucketAndUpload() {
        System.out.println("=== RustFS 创建Bucket并上传测试 ===");

        S3Client s3Client = getS3Client();

        // 1. 创建Bucket
        System.out.println("\n1. 创建Bucket: " + bucket);
        try {
            CreateBucketRequest createRequest = CreateBucketRequest.builder()
                    .bucket(bucket)
                    .build();
            CreateBucketResponse createResponse = s3Client.createBucket(createRequest);
            System.out.println("   Bucket创建成功! " + createResponse.location());
        } catch (BucketAlreadyExistsException e) {
            System.out.println("   Bucket已存在，跳过创建");
        } catch (BucketAlreadyOwnedByYouException e) {
            System.out.println("   Bucket已属于你，跳过创建");
        }

        // 2. 上传文件
        System.out.println("\n2. 上传测试文件...");
        String testContent = "Hello from RustFS! " + System.currentTimeMillis();
        String testKey = "test/" + System.currentTimeMillis() + ".txt";

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(testKey)
                    .contentType("text/plain")
                    .build();

            s3Client.putObject(putRequest,
                    software.amazon.awssdk.core.sync.RequestBody.fromInputStream(
                            new ByteArrayInputStream(testContent.getBytes(StandardCharsets.UTF_8)),
                            testContent.length()
                    ));
            System.out.println("   上传成功: " + testKey);

            // 3. 下载验证
            System.out.println("\n3. 下载验证...");
            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(testKey)
                    .build();

            String downloaded = new String(s3Client.getObjectAsBytes(getRequest).asByteArray(), StandardCharsets.UTF_8);
            System.out.println("   下载内容: " + downloaded);

            assertEquals(testContent, downloaded);
            System.out.println("\n✅ 全部测试通过!");

        } catch (Exception e) {
            System.out.println("   失败: " + e.getMessage());
            e.printStackTrace();
            fail("测试失败: " + e.getMessage());
        }
    }

    @Test
    void testRustFSListBuckets() {
        System.out.println("=== RustFS 列出所有Bucket ===");
        S3Client s3Client = getS3Client();

        try {
            ListBucketsRequest request = ListBucketsRequest.builder().build();
            ListBucketsResponse response = s3Client.listBuckets(request);

            System.out.println("共 " + response.buckets().size() + " 个Bucket:");
            response.buckets().forEach(b -> System.out.println("  - " + b.name() + " (创建于: " + b.creationDate() + ")"));

            assertNotNull(response);
        } catch (Exception e) {
            System.out.println("列出失败: " + e.getMessage());
            e.printStackTrace();
            fail();
        }
    }
}