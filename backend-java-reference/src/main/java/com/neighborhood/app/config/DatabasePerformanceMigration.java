package com.neighborhood.app.config;

import jakarta.annotation.PostConstruct;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/** 文件作用：数据库性能迁移任务。 */
@Component
@ConditionalOnProperty(prefix = "app.migration", name = "auto-run", havingValue = "true")
@RequiredArgsConstructor
public class DatabasePerformanceMigration {

    private static final List<TableSpec> TABLE_SPECS = List.of(
            new TableSpec("t_comment_like", """
                    CREATE TABLE t_comment_like (
                        id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'comment like id',
                        comment_id BIGINT NOT NULL COMMENT 'comment id',
                        user_id VARCHAR(64) NOT NULL COMMENT 'user id',
                        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE KEY uk_comment_user (comment_id, user_id),
                        INDEX idx_comment_id (comment_id),
                        INDEX idx_user_id (user_id)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='comment like table'
                    """),
            new TableSpec("t_review_like", """
                    CREATE TABLE t_review_like (
                        id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'review like id',
                        review_id BIGINT NOT NULL COMMENT 'review id',
                        user_id VARCHAR(64) NOT NULL COMMENT 'user id',
                        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE KEY uk_review_user (review_id, user_id),
                        INDEX idx_review_id (review_id),
                        INDEX idx_review_user_id (user_id)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='review like table'
                    """),
            new TableSpec("t_favorite", """
                    CREATE TABLE t_favorite (
                        id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'favorite id',
                        user_id VARCHAR(64) NOT NULL COMMENT 'user id',
                        target_type VARCHAR(32) NOT NULL COMMENT 'target type',
                        target_id BIGINT NOT NULL COMMENT 'target id',
                        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE KEY uk_favorite_user_target (user_id, target_type, target_id),
                        INDEX idx_favorite_user_time (user_id, create_time DESC),
                        INDEX idx_favorite_target (target_type, target_id)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='favorite table'
                    """)
    );

    private static final List<ColumnSpec> COLUMN_SPECS = List.of(
            new ColumnSpec("t_user", "latitude", "ALTER TABLE t_user ADD COLUMN latitude DOUBLE DEFAULT NULL COMMENT 'user latitude'"),
            new ColumnSpec("t_user", "longitude", "ALTER TABLE t_user ADD COLUMN longitude DOUBLE DEFAULT NULL COMMENT 'user longitude'"),
            new ColumnSpec("t_news", "status", "ALTER TABLE t_news ADD COLUMN status VARCHAR(20) DEFAULT 'approved' COMMENT 'content status'"),
            new ColumnSpec("t_news", "reject_reason", "ALTER TABLE t_news ADD COLUMN reject_reason VARCHAR(255) DEFAULT '' COMMENT 'reject reason'"),
            new ColumnSpec("t_comment", "parent_id", "ALTER TABLE t_comment ADD COLUMN parent_id BIGINT DEFAULT 0 COMMENT 'parent comment id'"),
            new ColumnSpec("t_comment", "status", "ALTER TABLE t_comment ADD COLUMN status VARCHAR(20) DEFAULT 'normal'"),
            new ColumnSpec("t_service_review", "status", "ALTER TABLE t_service_review ADD COLUMN status VARCHAR(20) DEFAULT 'normal'")
    );

    private static final List<IndexSpec> INDEX_SPECS = List.of(
            new IndexSpec("t_user", "idx_user_created", "CREATE INDEX idx_user_created ON t_user(created_at DESC)"),
            new IndexSpec("t_user", "idx_user_admin_role", "CREATE INDEX idx_user_admin_role ON t_user(admin_role)"),
            new IndexSpec("t_news", "idx_news_status_time", "CREATE INDEX idx_news_status_time ON t_news(status, create_time DESC)"),
            new IndexSpec("t_news", "idx_news_author_time", "CREATE INDEX idx_news_author_time ON t_news(author_id, create_time DESC)"),
            new IndexSpec("t_news", "idx_news_status_comments_count", "CREATE INDEX idx_news_status_comments_count ON t_news(status, comments_count DESC)"),
            new IndexSpec("t_comment", "idx_comment_status_time", "CREATE INDEX idx_comment_status_time ON t_comment(status, create_time DESC)"),
            new IndexSpec("t_comment", "idx_comment_news_status_time", "CREATE INDEX idx_comment_news_status_time ON t_comment(news_id, status, create_time DESC)"),
            new IndexSpec("t_comment", "idx_parent_id", "CREATE INDEX idx_parent_id ON t_comment(parent_id)"),
            new IndexSpec("t_comment", "idx_comment_news_status_likes_time", "CREATE INDEX idx_comment_news_status_likes_time ON t_comment(news_id, status, likes, create_time DESC)"),
            new IndexSpec("t_follow", "idx_follow_follower_following", "CREATE INDEX idx_follow_follower_following ON t_follow(follower_id, following_id)"),
            new IndexSpec("t_favorite", "idx_favorite_user_time", "CREATE INDEX idx_favorite_user_time ON t_favorite(user_id, create_time DESC)"),
            new IndexSpec("t_favorite", "idx_favorite_target", "CREATE INDEX idx_favorite_target ON t_favorite(target_type, target_id)"),
            new IndexSpec("t_market_item", "idx_market_status_id", "CREATE INDEX idx_market_status_id ON t_market_item(status, id DESC)"),
            new IndexSpec("t_market_item", "idx_market_seller_time", "CREATE INDEX idx_market_seller_time ON t_market_item(seller_id, created_at DESC)"),
            new IndexSpec("t_market_item", "idx_market_seller_id_id", "CREATE INDEX idx_market_seller_id_id ON t_market_item(seller_id, id DESC)"),
            new IndexSpec("t_service", "idx_service_status_id", "CREATE INDEX idx_service_status_id ON t_service(status, id DESC)"),
            new IndexSpec("t_service", "idx_service_seller_time", "CREATE INDEX idx_service_seller_time ON t_service(seller_id, created_at DESC)"),
            new IndexSpec("t_service", "idx_service_seller_id_id", "CREATE INDEX idx_service_seller_id_id ON t_service(seller_id, id DESC)"),
            new IndexSpec("t_service_review", "idx_review_service_status_time", "CREATE INDEX idx_review_service_status_time ON t_service_review(service_id, status, create_time DESC)"),
            new IndexSpec("t_service_review", "idx_service_review_status_rating", "CREATE INDEX idx_service_review_status_rating ON t_service_review(service_id, status, rating DESC)"),
            new IndexSpec("t_message", "idx_message_sender_receiver_time", "CREATE INDEX idx_message_sender_receiver_time ON t_message(sender_id, receiver_id, create_time DESC)"),
            new IndexSpec("t_message", "idx_message_receiver_read_time", "CREATE INDEX idx_message_receiver_read_time ON t_message(receiver_id, is_read, create_time DESC)"),
            new IndexSpec("t_booking", "idx_booking_buyer_status_time", "CREATE INDEX idx_booking_buyer_status_time ON t_booking(buyer_id, status, create_time DESC)"),
            new IndexSpec("t_booking", "idx_booking_seller_status_time", "CREATE INDEX idx_booking_seller_status_time ON t_booking(seller_id, status, create_time DESC)"),
            new IndexSpec("t_order", "idx_order_buyer_time", "CREATE INDEX idx_order_buyer_time ON t_order(buyer_id, create_time DESC)"),
            new IndexSpec("t_order", "idx_order_seller_time", "CREATE INDEX idx_order_seller_time ON t_order(seller_id, create_time DESC)"),
            new IndexSpec("t_order", "idx_order_status_time", "CREATE INDEX idx_order_status_time ON t_order(status, create_time DESC)"),
            new IndexSpec("t_notification", "idx_notification_time", "CREATE INDEX idx_notification_time ON t_notification(time DESC)"),
            new IndexSpec("t_notification", "idx_notify_user_time", "CREATE INDEX idx_notify_user_time ON t_notification(user_id, time DESC)"),
            new IndexSpec("t_notification", "idx_notify_booking", "CREATE INDEX idx_notify_booking ON t_notification(related_booking_id)")
    );

    private static final List<String> SAFE_SQLS = List.of(
            "UPDATE t_news SET status = 'approved' WHERE status IS NULL OR status = ''",
            "UPDATE t_comment SET status = 'normal' WHERE status = 'pending'",
            "UPDATE t_service_review SET status = 'normal' WHERE status = 'pending'"
    );

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void ensurePerformanceIndexes() {
        TABLE_SPECS.forEach(spec -> createTableIfMissing(spec.tableName(), spec.ddl()));
        COLUMN_SPECS.forEach(spec -> addColumnIfMissing(spec.tableName(), spec.columnName(), spec.ddl()));
        SAFE_SQLS.forEach(this::executeSafely);
        INDEX_SPECS.forEach(spec -> addIndexIfMissing(spec.tableName(), spec.indexName(), spec.ddl()));
    }

    private void createTableIfMissing(String tableName, String ddl) {
        Integer count = jdbcTemplate.queryForObject(
                """
                        SELECT COUNT(1)
                        FROM information_schema.tables
                        WHERE table_schema = DATABASE()
                          AND table_name = ?
                        """,
                Integer.class,
                tableName);
        if (count != null && count == 0) {
            jdbcTemplate.execute(ddl);
        }
    }

    private void addColumnIfMissing(String tableName, String columnName, String ddl) {
        Integer count = jdbcTemplate.queryForObject(
                """
                        SELECT COUNT(1)
                        FROM information_schema.columns
                        WHERE table_schema = DATABASE()
                          AND table_name = ?
                          AND column_name = ?
                        """,
                Integer.class,
                tableName,
                columnName);
        if (count != null && count == 0) {
            jdbcTemplate.execute(ddl);
        }
    }

    private void addIndexIfMissing(String tableName, String indexName, String ddl) {
        Integer count = jdbcTemplate.queryForObject(
                """
                        SELECT COUNT(1)
                        FROM information_schema.statistics
                        WHERE table_schema = DATABASE()
                          AND table_name = ?
                          AND index_name = ?
                        """,
                Integer.class,
                tableName,
                indexName);
        if (count != null && count == 0) {
            jdbcTemplate.execute(ddl);
        }
    }

    private void executeSafely(String sql) {
        try {
            jdbcTemplate.execute(sql);
        } catch (Exception ignored) {
        }
    }

    private record TableSpec(String tableName, String ddl) {
    }

    private record ColumnSpec(String tableName, String columnName, String ddl) {
    }

    private record IndexSpec(String tableName, String indexName, String ddl) {
    }
}
