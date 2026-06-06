-- 数据库性能优化索引脚本（可重复执行）
-- 目标库：neighborhood_db

-- t_news
SET @e := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema='neighborhood_db' AND table_name='t_news' AND index_name='idx_news_comments_count');
SET @s := IF(@e=0, 'CREATE INDEX idx_news_comments_count ON t_news(comments_count)', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @e := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema='neighborhood_db' AND table_name='t_news' AND index_name='idx_news_author_ctime');
SET @s := IF(@e=0, 'CREATE INDEX idx_news_author_ctime ON t_news(author_id, create_time)', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- t_message
SET @e := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema='neighborhood_db' AND table_name='t_message' AND index_name='idx_msg_sender_receiver_time');
SET @s := IF(@e=0, 'CREATE INDEX idx_msg_sender_receiver_time ON t_message(sender_id, receiver_id, create_time)', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @e := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema='neighborhood_db' AND table_name='t_message' AND index_name='idx_msg_receiver_sender_read_time');
SET @s := IF(@e=0, 'CREATE INDEX idx_msg_receiver_sender_read_time ON t_message(receiver_id, sender_id, is_read, create_time)', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- t_notification
SET @e := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema='neighborhood_db' AND table_name='t_notification' AND index_name='idx_notify_user_time');
SET @s := IF(@e=0, 'CREATE INDEX idx_notify_user_time ON t_notification(user_id, time)', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- t_order
SET @e := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema='neighborhood_db' AND table_name='t_order' AND index_name='idx_order_buyer_ctime');
SET @s := IF(@e=0, 'CREATE INDEX idx_order_buyer_ctime ON t_order(buyer_id, create_time)', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @e := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema='neighborhood_db' AND table_name='t_order' AND index_name='idx_order_seller_ctime');
SET @s := IF(@e=0, 'CREATE INDEX idx_order_seller_ctime ON t_order(seller_id, create_time)', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @e := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema='neighborhood_db' AND table_name='t_order' AND index_name='idx_order_buyer_status_ctime');
SET @s := IF(@e=0, 'CREATE INDEX idx_order_buyer_status_ctime ON t_order(buyer_id, status, create_time)', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @e := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema='neighborhood_db' AND table_name='t_order' AND index_name='idx_order_seller_status_ctime');
SET @s := IF(@e=0, 'CREATE INDEX idx_order_seller_status_ctime ON t_order(seller_id, status, create_time)', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- t_service_review
SET @e := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema='neighborhood_db' AND table_name='t_service_review' AND index_name='idx_sr_service_ctime');
SET @s := IF(@e=0, 'CREATE INDEX idx_sr_service_ctime ON t_service_review(service_id, create_time)', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- t_service / t_market_item
SET @e := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema='neighborhood_db' AND table_name='t_service' AND index_name='idx_service_seller_id');
SET @s := IF(@e=0, 'CREATE INDEX idx_service_seller_id ON t_service(seller_id, id)', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @e := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema='neighborhood_db' AND table_name='t_market_item' AND index_name='idx_market_seller_id');
SET @s := IF(@e=0, 'CREATE INDEX idx_market_seller_id ON t_market_item(seller_id, id)', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

ANALYZE TABLE t_news, t_comment, t_service, t_market_item, t_message, t_notification, t_order, t_service_review;
