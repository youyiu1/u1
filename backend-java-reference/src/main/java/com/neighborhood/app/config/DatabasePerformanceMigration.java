package com.neighborhood.app.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabasePerformanceMigration {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void ensurePerformanceIndexes() {
        addIndexIfMissing("t_user", "idx_user_created", "CREATE INDEX idx_user_created ON t_user(created_at DESC)");
        addIndexIfMissing("t_user", "idx_user_admin_role", "CREATE INDEX idx_user_admin_role ON t_user(admin_role)");
        addIndexIfMissing("t_news", "idx_news_status_time", "CREATE INDEX idx_news_status_time ON t_news(status, create_time DESC)");
        addIndexIfMissing("t_news", "idx_news_author_time", "CREATE INDEX idx_news_author_time ON t_news(author_id, create_time DESC)");
        addIndexIfMissing("t_comment", "idx_comment_status_time", "CREATE INDEX idx_comment_status_time ON t_comment(status, create_time DESC)");
        addIndexIfMissing("t_comment", "idx_comment_news_status_time", "CREATE INDEX idx_comment_news_status_time ON t_comment(news_id, status, create_time DESC)");
        addIndexIfMissing("t_market_item", "idx_market_status_id", "CREATE INDEX idx_market_status_id ON t_market_item(status, id DESC)");
        addIndexIfMissing("t_market_item", "idx_market_seller_time", "CREATE INDEX idx_market_seller_time ON t_market_item(seller_id, created_at DESC)");
        addIndexIfMissing("t_service", "idx_service_status_id", "CREATE INDEX idx_service_status_id ON t_service(status, id DESC)");
        addIndexIfMissing("t_service", "idx_service_seller_time", "CREATE INDEX idx_service_seller_time ON t_service(seller_id, created_at DESC)");
        addIndexIfMissing("t_service_review", "idx_review_service_status_time", "CREATE INDEX idx_review_service_status_time ON t_service_review(service_id, status, create_time DESC)");
        addIndexIfMissing("t_message", "idx_message_sender_receiver_time", "CREATE INDEX idx_message_sender_receiver_time ON t_message(sender_id, receiver_id, create_time DESC)");
        addIndexIfMissing("t_message", "idx_message_receiver_read_time", "CREATE INDEX idx_message_receiver_read_time ON t_message(receiver_id, is_read, create_time DESC)");
        addIndexIfMissing("t_order", "idx_order_buyer_time", "CREATE INDEX idx_order_buyer_time ON t_order(buyer_id, create_time DESC)");
        addIndexIfMissing("t_order", "idx_order_seller_time", "CREATE INDEX idx_order_seller_time ON t_order(seller_id, create_time DESC)");
        addIndexIfMissing("t_order", "idx_order_status_time", "CREATE INDEX idx_order_status_time ON t_order(status, create_time DESC)");
        addIndexIfMissing("t_notification", "idx_notification_time", "CREATE INDEX idx_notification_time ON t_notification(time DESC)");
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
}
