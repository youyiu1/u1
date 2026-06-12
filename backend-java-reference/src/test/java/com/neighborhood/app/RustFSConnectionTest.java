/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.fail;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import java.io.ByteArrayInputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.BucketAlreadyExistsException;
import software.amazon.awssdk.services.s3.model.BucketAlreadyOwnedByYouException;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.CreateBucketResponse;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.ListBucketsRequest;
import software.amazon.awssdk.services.s3.model.ListBucketsResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@SpringBootTest
class RustFSConnectionTest {

    @Value("${rustfs.endpoint}")
    private String endpoint;

    @Value("${rustfs.access-key}")
    private String accessKey;

    @Value("${rustfs.secret-key}")
    private String secretKey;

    @Value("${rustfs.bucket}")
    private String bucket;

    @Value("${test.rustfs.enabled:false}")
    private boolean enabled;

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
        assumeTrue(enabled, "RustFS 集成测试未开启");
        System.out.println("=== RustFS 创建 Bucket 并上传测试 ===");

        S3Client s3Client = getS3Client();
        String testContent = "Hello from RustFS! " + System.currentTimeMillis();
        String testKey = "test/" + System.currentTimeMillis() + ".txt";

        ensureBucketExists(s3Client);

        try {
            System.out.println("\n2. 上传测试文件...");
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(testKey)
                    .contentType("text/plain")
                    .build();

            s3Client.putObject(
                    putRequest,
                    software.amazon.awssdk.core.sync.RequestBody.fromInputStream(
                            new ByteArrayInputStream(testContent.getBytes(StandardCharsets.UTF_8)),
                            testContent.length()
                    )
            );
            System.out.println("   上传成功: " + testKey);

            System.out.println("\n3. 下载验证...");
            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(testKey)
                    .build();

            String downloaded = new String(s3Client.getObjectAsBytes(getRequest).asByteArray(), StandardCharsets.UTF_8);
            System.out.println("   下载内容: " + downloaded);
            assertEquals(testContent, downloaded);
            System.out.println("\n全部测试通过");
        } catch (Exception e) {
            e.printStackTrace();
            fail("RustFS 上传链路测试失败: " + e.getMessage());
        } finally {
            deleteQuietly(s3Client, testKey);
        }
    }

    @Test
    void testRustFSListBuckets() {
        assumeTrue(enabled, "RustFS 集成测试未开启");
        System.out.println("=== RustFS 列出所有 Bucket ===");
        S3Client s3Client = getS3Client();

        try {
            ListBucketsRequest request = ListBucketsRequest.builder().build();
            ListBucketsResponse response = s3Client.listBuckets(request);
            System.out.println("共 " + response.buckets().size() + " 个 Bucket:");
            response.buckets().forEach(bucketItem ->
                    System.out.println("  - " + bucketItem.name() + " (创建于: " + bucketItem.creationDate() + ")")
            );
            assertNotNull(response);
        } catch (Exception e) {
            e.printStackTrace();
            fail("RustFS 列表失败: " + e.getMessage());
        }
    }

    private void ensureBucketExists(S3Client s3Client) {
        System.out.println("\n1. 创建 Bucket: " + bucket);
        try {
            CreateBucketRequest createRequest = CreateBucketRequest.builder()
                    .bucket(bucket)
                    .build();
            CreateBucketResponse createResponse = s3Client.createBucket(createRequest);
            System.out.println("   Bucket 创建成功: " + createResponse.location());
        } catch (BucketAlreadyExistsException e) {
            System.out.println("   Bucket 已存在，跳过创建");
        } catch (BucketAlreadyOwnedByYouException e) {
            System.out.println("   Bucket 已属于当前账号，跳过创建");
        }
    }

    private void deleteQuietly(S3Client s3Client, String key) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build());
            System.out.println("\n4. 清理测试文件成功: " + key);
        } catch (Exception e) {
            System.out.println("\n4. 清理测试文件失败: " + e.getMessage());
        }
    }
}
