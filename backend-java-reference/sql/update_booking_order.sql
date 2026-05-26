-- ================================================
-- 同城生活社区平台 - 增量更新脚本 v2
-- 添加订单表和通知关联字段
-- ================================================

USE neighborhood_db;

-- 添加通知表新字段
ALTER TABLE t_notification ADD COLUMN is_processed TINYINT(1) DEFAULT 0 COMMENT '是否已处理';
ALTER TABLE t_notification ADD COLUMN order_id BIGINT COMMENT '关联的订单ID';
ALTER TABLE t_notification ADD COLUMN related_booking_id BIGINT COMMENT '关联的预约ID';

-- 添加预约表新字段
ALTER TABLE t_booking ADD COLUMN notification_id BIGINT COMMENT '关联的通知ID';

-- ================================================
-- 订单表
-- ================================================
DROP TABLE IF EXISTS t_order;
CREATE TABLE t_order (
    id BIGINT PRIMARY KEY COMMENT '订单ID',
    booking_id BIGINT COMMENT '关联的预约ID',
    buyer_id VARCHAR(64) NOT NULL COMMENT '买家ID',
    seller_id VARCHAR(64) NOT NULL COMMENT '卖家ID',
    service_id BIGINT COMMENT '服务ID',
    service_title VARCHAR(200) COMMENT '服务标题',
    price DECIMAL(10,2) COMMENT '价格',
    booking_date DATETIME COMMENT '预约日期',
    booking_time VARCHAR(50) COMMENT '预约时间',
    duration INT DEFAULT 1 COMMENT '服务时长(小时)',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态:pending confirmed completed cancelled',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_service_id (service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';