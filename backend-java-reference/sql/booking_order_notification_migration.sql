-- Booking / notification / order migration (idempotent)
-- Target database: neighborhood_db
-- Safe to run repeatedly. This script does not drop existing data.

USE neighborhood_db;

-- Notification table used by system messages and booking approvals.
CREATE TABLE IF NOT EXISTS t_notification (
    id BIGINT PRIMARY KEY COMMENT 'notification id',
    user_id VARCHAR(64) NOT NULL COMMENT 'receiver user id',
    title VARCHAR(100) NOT NULL COMMENT 'notification title',
    content VARCHAR(1000) COMMENT 'notification content',
    service_name VARCHAR(200) COMMENT 'related service name',
    time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'notification time',
    is_read TINYINT(1) DEFAULT 0 COMMENT 'read flag',
    is_processed TINYINT(1) DEFAULT 0 COMMENT 'processed flag',
    order_id BIGINT COMMENT 'related order id',
    related_booking_id BIGINT COMMENT 'related booking id'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='notification table';

-- Booking table used by life service reservations.
CREATE TABLE IF NOT EXISTS t_booking (
    id BIGINT PRIMARY KEY COMMENT 'booking id',
    service_id BIGINT NOT NULL COMMENT 'service id',
    buyer_id VARCHAR(64) NOT NULL COMMENT 'buyer id',
    seller_id VARCHAR(64) NOT NULL COMMENT 'seller id',
    booking_date DATETIME COMMENT 'booking date',
    booking_time VARCHAR(50) COMMENT 'booking time',
    duration INT DEFAULT 1 COMMENT 'duration hours',
    status VARCHAR(20) DEFAULT 'pending' COMMENT 'booking status',
    notification_id BIGINT COMMENT 'related notification id',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='booking table';

-- Order table generated after a booking is accepted.
CREATE TABLE IF NOT EXISTS t_order (
    id BIGINT PRIMARY KEY COMMENT 'order id',
    booking_id BIGINT COMMENT 'related booking id',
    buyer_id VARCHAR(64) NOT NULL COMMENT 'buyer id',
    seller_id VARCHAR(64) NOT NULL COMMENT 'seller id',
    service_id BIGINT COMMENT 'service id',
    service_title VARCHAR(200) COMMENT 'service title',
    price DECIMAL(10,2) COMMENT 'price',
    booking_date DATETIME COMMENT 'booking date',
    booking_time VARCHAR(50) COMMENT 'booking time',
    duration INT DEFAULT 1 COMMENT 'duration hours',
    status VARCHAR(20) DEFAULT 'pending' COMMENT 'order status',
    completed_time DATETIME COMMENT 'completed time',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='order table';

-- Add missing columns for databases created before booking/order support.
SET @e := (SELECT COUNT(1) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 't_notification' AND column_name = 'is_processed');
SET @s := IF(@e = 0, 'ALTER TABLE t_notification ADD COLUMN is_processed TINYINT(1) DEFAULT 0 COMMENT ''processed flag''', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @e := (SELECT COUNT(1) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 't_notification' AND column_name = 'order_id');
SET @s := IF(@e = 0, 'ALTER TABLE t_notification ADD COLUMN order_id BIGINT COMMENT ''related order id''', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @e := (SELECT COUNT(1) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 't_notification' AND column_name = 'related_booking_id');
SET @s := IF(@e = 0, 'ALTER TABLE t_notification ADD COLUMN related_booking_id BIGINT COMMENT ''related booking id''', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @e := (SELECT COUNT(1) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 't_booking' AND column_name = 'notification_id');
SET @s := IF(@e = 0, 'ALTER TABLE t_booking ADD COLUMN notification_id BIGINT COMMENT ''related notification id''', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @e := (SELECT COUNT(1) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 't_order' AND column_name = 'completed_time');
SET @s := IF(@e = 0, 'ALTER TABLE t_order ADD COLUMN completed_time DATETIME COMMENT ''completed time'' AFTER status', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Indexes for frequent list/detail operations.
SET @e := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 't_notification' AND index_name = 'idx_notify_user_time');
SET @s := IF(@e = 0, 'CREATE INDEX idx_notify_user_time ON t_notification(user_id, time)', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @e := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 't_notification' AND index_name = 'idx_notify_booking');
SET @s := IF(@e = 0, 'CREATE INDEX idx_notify_booking ON t_notification(related_booking_id)', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @e := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 't_notification' AND index_name = 'idx_notify_order');
SET @s := IF(@e = 0, 'CREATE INDEX idx_notify_order ON t_notification(order_id)', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @e := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 't_booking' AND index_name = 'idx_booking_buyer_status_time');
SET @s := IF(@e = 0, 'CREATE INDEX idx_booking_buyer_status_time ON t_booking(buyer_id, status, create_time)', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @e := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 't_booking' AND index_name = 'idx_booking_seller_status_time');
SET @s := IF(@e = 0, 'CREATE INDEX idx_booking_seller_status_time ON t_booking(seller_id, status, create_time)', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @e := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 't_booking' AND index_name = 'idx_booking_service_time');
SET @s := IF(@e = 0, 'CREATE INDEX idx_booking_service_time ON t_booking(service_id, booking_date)', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @e := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 't_order' AND index_name = 'idx_order_booking_id');
SET @s := IF(@e = 0, 'CREATE INDEX idx_order_booking_id ON t_order(booking_id)', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @e := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 't_order' AND index_name = 'idx_order_buyer_status_ctime');
SET @s := IF(@e = 0, 'CREATE INDEX idx_order_buyer_status_ctime ON t_order(buyer_id, status, create_time)', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @e := (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 't_order' AND index_name = 'idx_order_seller_status_ctime');
SET @s := IF(@e = 0, 'CREATE INDEX idx_order_seller_status_ctime ON t_order(seller_id, status, create_time)', 'SELECT 1'); PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;
