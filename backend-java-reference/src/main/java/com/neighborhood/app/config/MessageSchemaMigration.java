package com.neighborhood.app.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MessageSchemaMigration {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void ensureMessageColumns() {
        addColumnIfMissing("message_type", "ALTER TABLE t_message ADD COLUMN message_type VARCHAR(20) DEFAULT 'text' COMMENT 'message type: text/image'");
        addColumnIfMissing("media_url", "ALTER TABLE t_message ADD COLUMN media_url VARCHAR(500) DEFAULT '' COMMENT 'media url for image message'");
        ensureColumnCollation("sender_id", "ALTER TABLE t_message MODIFY COLUMN sender_id VARCHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'sender id'");
        ensureColumnCollation("receiver_id", "ALTER TABLE t_message MODIFY COLUMN receiver_id VARCHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'receiver id'");
    }

    private void addColumnIfMissing(String columnName, String ddl) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(1) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 't_message' AND column_name = ?",
                Integer.class,
                columnName);
        if (count != null && count == 0) {
            jdbcTemplate.execute(ddl);
        }
    }

    private void ensureColumnCollation(String columnName, String ddl) {
        String collation = jdbcTemplate.queryForObject(
                """
                        SELECT collation_name
                        FROM information_schema.columns
                        WHERE table_schema = DATABASE()
                          AND table_name = 't_message'
                          AND column_name = ?
                        """,
                String.class,
                columnName);
        if (collation != null && !"utf8mb4_unicode_ci".equalsIgnoreCase(collation)) {
            jdbcTemplate.execute(ddl);
        }
    }
}
