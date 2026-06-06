package com.neighborhood.app.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/** 消息与通知表结构迁移。 */
@Component
@ConditionalOnProperty(prefix = "app.migration", name = "auto-run", havingValue = "true")
@RequiredArgsConstructor
public class MessageSchemaMigration {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void ensureMessageColumns() {
        addColumnIfMissing("t_message", "message_type", "ALTER TABLE t_message ADD COLUMN message_type VARCHAR(20) DEFAULT 'text' COMMENT 'message type: text/image'");
        addColumnIfMissing("t_message", "media_url", "ALTER TABLE t_message ADD COLUMN media_url VARCHAR(500) DEFAULT '' COMMENT 'media url for image message'");
        ensureColumnCollation("t_message", "sender_id", "ALTER TABLE t_message MODIFY COLUMN sender_id VARCHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'sender id'");
        ensureColumnCollation("t_message", "receiver_id", "ALTER TABLE t_message MODIFY COLUMN receiver_id VARCHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'receiver id'");

        addColumnIfMissing("t_notification", "related_user_id", "ALTER TABLE t_notification ADD COLUMN related_user_id VARCHAR(64) DEFAULT NULL COMMENT 'related user id'");
        addColumnIfMissing("t_notification", "related_market_item_id", "ALTER TABLE t_notification ADD COLUMN related_market_item_id BIGINT DEFAULT NULL COMMENT 'related market item id'");
        addIndexIfMissing("t_notification", "idx_notify_related_user", "CREATE INDEX idx_notify_related_user ON t_notification(related_user_id)");
        addIndexIfMissing("t_notification", "idx_notify_market_item", "CREATE INDEX idx_notify_market_item ON t_notification(related_market_item_id)");
    }

    private void addColumnIfMissing(String tableName, String columnName, String ddl) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(1) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?",
                Integer.class,
                tableName,
                columnName);
        if (count != null && count == 0) {
            jdbcTemplate.execute(ddl);
        }
    }

    private void addIndexIfMissing(String tableName, String indexName, String ddl) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?",
                Integer.class,
                tableName,
                indexName);
        if (count != null && count == 0) {
            jdbcTemplate.execute(ddl);
        }
    }

    private void ensureColumnCollation(String tableName, String columnName, String ddl) {
        String collation = jdbcTemplate.queryForObject(
                """
                        SELECT collation_name
                        FROM information_schema.columns
                        WHERE table_schema = DATABASE()
                          AND table_name = ?
                          AND column_name = ?
                        """,
                String.class,
                tableName,
                columnName);
        if (collation != null && !"utf8mb4_unicode_ci".equalsIgnoreCase(collation)) {
            jdbcTemplate.execute(ddl);
        }
    }
}
