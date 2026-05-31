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
}
