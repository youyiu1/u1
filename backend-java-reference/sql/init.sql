-- ================================================
-- 同城生活社区平台 - 数据库初始化脚本
-- MySQL 8.0+
-- 账户: root / root
-- 数据�? neighborhood_db
-- ================================================

-- 创建数据�?CREATE DATABASE IF NOT EXISTS neighborhood_db
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE neighborhood_db;

-- ================================================
-- 用户�?-- ================================================
DROP TABLE IF EXISTS t_user;
CREATE TABLE t_user (
    id VARCHAR(64) PRIMARY KEY COMMENT '用户ID',
    name VARCHAR(50) NOT NULL COMMENT '昵称',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    avatar VARCHAR(255) DEFAULT '' COMMENT '头像URL',
    tag VARCHAR(50) DEFAULT '' COMMENT '标签',
    bio VARCHAR(255) DEFAULT '' COMMENT '个人简�?,
    is_verified TINYINT(1) DEFAULT 0 COMMENT '是否认证',
    followers_count INT DEFAULT 0 COMMENT '粉丝�?,
    following_count INT DEFAULT 0 COMMENT '关注�?,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户�?;

-- ================================================
-- 关注关系�?-- ================================================
DROP TABLE IF EXISTS t_follow;
CREATE TABLE t_follow (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    follower_id VARCHAR(64) NOT NULL COMMENT '关注者ID',
    following_id VARCHAR(64) NOT NULL COMMENT '被关注者ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_follow (follower_id, following_id),
    INDEX idx_follower (follower_id),
    INDEX idx_following (following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关注关系�?;

-- ================================================
-- 社区动态表
-- ================================================
DROP TABLE IF EXISTS t_news;
CREATE TABLE t_news (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '动态ID',
    author_id VARCHAR(64) NOT NULL COMMENT '作者ID',
    title VARCHAR(200) DEFAULT '' COMMENT '标题',
    content TEXT NOT NULL COMMENT '动态内�?,
    location VARCHAR(100) DEFAULT '' COMMENT '位置',
    category VARCHAR(50) DEFAULT '生活记录' COMMENT '分类：生活记录、同城发现、探店动态、邻里闲情、物业反�?,
    likes INT DEFAULT 0 COMMENT '点赞�?,
    comments_count INT DEFAULT 0 COMMENT '评论�?,
    images JSON COMMENT '图片列表(JSON)',
    shares INT DEFAULT 0 COMMENT '分享�?,
    collections INT DEFAULT 0 COMMENT '收藏�?,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_author (author_id),
    INDEX idx_create_time (create_time DESC),
    INDEX idx_likes (likes DESC),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社区动态表';

-- ================================================
-- 评论�?-- ================================================
DROP TABLE IF EXISTS t_comment;
CREATE TABLE t_comment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '评论ID',
    news_id BIGINT NOT NULL COMMENT '动态ID',`r`n    parent_id BIGINT DEFAULT 0 COMMENT '父评论ID',
    user_id VARCHAR(64) NOT NULL COMMENT '用户ID',
    user_name VARCHAR(50) NOT NULL COMMENT '用户�?,
    user_avatar VARCHAR(255) DEFAULT '' COMMENT '用户头像',
    content TEXT NOT NULL COMMENT '评论内容',
    likes INT DEFAULT 0 COMMENT '点赞�?,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_news_id (news_id),`r`n    INDEX idx_parent_id (parent_id),
    INDEX idx_user_id (user_id),
    INDEX idx_news_create (news_id, create_time DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论�?;

-- ================================================
-- 闲置物品�?-- ================================================
-- ================================================
-- 评论点赞�?-- ================================================
DROP TABLE IF EXISTS t_comment_like;
CREATE TABLE t_comment_like (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '评论点赞ID',
    comment_id BIGINT NOT NULL COMMENT '评论ID',
    user_id VARCHAR(64) NOT NULL COMMENT '用户ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_comment_user (comment_id, user_id),
    INDEX idx_comment_id (comment_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论点赞�?;

DROP TABLE IF EXISTS t_market_item;
CREATE TABLE t_market_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '物品ID',
    title VARCHAR(200) NOT NULL COMMENT '标题',
    description TEXT COMMENT '描述',
    price DECIMAL(10,2) NOT NULL COMMENT '售价',
    item_condition VARCHAR(20) DEFAULT '' COMMENT '成色',
    image VARCHAR(255) DEFAULT '' COMMENT '主图',
    images JSON COMMENT '图片列表(JSON)',
    seller_id VARCHAR(64) NOT NULL COMMENT '卖家ID',
    category VARCHAR(50) DEFAULT '' COMMENT '分类',
    original_price DECIMAL(10,2) COMMENT '原价',
    location VARCHAR(100) DEFAULT '' COMMENT '位置',
    verified TINYINT(1) DEFAULT 0 COMMENT '是否认证',
    free_shipping TINYINT(1) DEFAULT 0 COMMENT '是否包邮',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_seller (seller_id),
    INDEX idx_category (category),
    INDEX idx_create_time (created_at DESC),
    INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='闲置物品�?;

-- ================================================
-- 生活服务�?-- ================================================
DROP TABLE IF EXISTS t_service;
CREATE TABLE t_service (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '服务ID',
    title VARCHAR(200) NOT NULL COMMENT '标题',
    description TEXT COMMENT '描述',
    category VARCHAR(50) DEFAULT '' COMMENT '分类',
    price DECIMAL(10,2) NOT NULL COMMENT '价格',
    image VARCHAR(255) DEFAULT '' COMMENT '封面�?,
    seller_id VARCHAR(64) NOT NULL COMMENT '服务商ID',
    rating DOUBLE DEFAULT 0 COMMENT '评分',
    reviews INT DEFAULT 0 COMMENT '评价�?,
    distance VARCHAR(50) DEFAULT '' COMMENT '距离',
    unit VARCHAR(20) DEFAULT '' COMMENT '单位',
    highlights JSON COMMENT '亮点(JSON)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_seller (seller_id),
    INDEX idx_category (category),
    INDEX idx_rating (rating DESC),
    INDEX idx_create_time (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='生活服务�?;

-- ================================================
-- 预约�?-- ================================================
CREATE TABLE IF NOT EXISTS t_booking (
    id BIGINT PRIMARY KEY COMMENT '预约ID',
    service_id BIGINT NOT NULL COMMENT '服务ID',
    buyer_id VARCHAR(64) NOT NULL COMMENT '买家ID',
    seller_id VARCHAR(64) NOT NULL COMMENT '卖家ID',
    booking_date DATETIME NOT NULL COMMENT '预约日期',
    booking_time VARCHAR(50) NOT NULL COMMENT '预约时间',
    duration INT DEFAULT 1 COMMENT '服务时长(小时)',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状�?pending confirmed completed cancelled',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_service_id (service_id),
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_seller_id (seller_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预约�?;

-- ================================================
-- 消息�?-- ================================================
DROP TABLE IF EXISTS t_message;
CREATE TABLE t_message (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '消息ID',
    sender_id VARCHAR(64) NOT NULL COMMENT '发送者ID',
    receiver_id VARCHAR(64) NOT NULL COMMENT '接收者ID',
    content TEXT NOT NULL COMMENT '消息内容',
    is_read TINYINT(1) DEFAULT 0 COMMENT '是否已读',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_conversation (sender_id, receiver_id),
    INDEX idx_create_time (create_time DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息�?;

-- ================================================
-- 初始化测试数�?-- ================================================

-- 插入测试用户
INSERT INTO t_user (id, name, email, password, avatar, tag, is_verified, followers_count, following_count) VALUES
('u001', '李阿�?, 'li_ayi@example.com', '123456', '/api/file/931f8e1a2d834e03a288800df5a7e6ec.jpg', '社区达人', 1, 3420, 156),
('u002', '王大�?, 'wang_dachu@example.com', '123456', '/api/file/37dc56e3f2b541b79d98e82c4abd371a.jpg', '美食达人', 1, 1240, 320),
('u003', '小林', 'photo_xiaolin@example.com', '123456', '/api/file/64edb6bef14c4c1b8bd23ffe817e54a5.jpg', '摄影达人', 0, 850, 412);

-- 插入测试动�?INSERT INTO t_news (author_id, content, location, category, likes, comments_count, images, shares, collections) VALUES
('u001', '今天在小区门口发现了一家新开的花店，品种好齐全，老板人也特别好！强烈推荐给各位邻居~ 🌸🌷', '金地格林世界', '同城发现', 24, 6, '["/api/file/c2675e0851d940799368c483682ddf3d.jpg"]', 2, 5),
('u002', '有人在公园看到一只走失的柯基吗？邻居家的狗跑丢了，大家帮忙关注下，特征是背部有一块深色花纹�?, '滨江公园', '邻里闲情', 86, 15, '[]', 12, 8);

-- 插入测试服务
INSERT INTO t_service (title, description, category, price, image, seller_id, rating, reviews, distance, unit, highlights) VALUES
('专业家庭保洁 - 全屋深度除尘除螨及高温消�?, '我们提供的不只是保洁，更是为您打造一个健康舒心的居家环境。我们的服务包括：全�?60°除尘、厨卫重垢去除、全屋除螨以及紫外线/高温蒸汽消毒�?, 'domestic', 150.00, '/api/file/b6c049a9c65744a6a7dcd58e76cf9f65.jpg', 'u001', 4.81, 128, '1.2km', '�?, '["4小时", "自备工具", "环保药剂"]'),
('上门宠物洗护 - 狗狗SPA与深度清�?, '专业宠物洗护师，3年大厂经验�?, 'pet', 88.00, '/api/file/b6c049a9c65744a6a7dcd58e76cf9f65.jpg', 'u001', 5.0, 86, '0.8km', '�?, '["自带设备", "温和沐浴"]');

-- 插入测试闲置
INSERT INTO t_market_item (title, description, price, item_condition, image, images, seller_id, category, original_price, location, verified, free_shipping) VALUES
('德龙 (De''Longhi) 意式半自动咖啡机 - 95成新', '成色很好，用了不到半年�?, 3200.00, '95成新', '/api/file/44dc84a59ccd486b9b0a383c556c9d9b.jpg', '["/api/file/44dc84a59ccd486b9b0a383c556c9d9b.jpg"]', 'u002', 'market', 5480.00, '浦东新区', 1, 1),
('Nintendo Switch 日版蓝红 - 带健身环', '吃灰半年，全套包装齐全�?, 1800.00, '99�?, '/api/file/d0f83c5066454d7c958a3fb0e954c5a2.jpg', '["/api/file/d0f83c5066454d7c958a3fb0e954c5a2.jpg"]', 'u003', 'market', 2400.00, '徐汇�?, 1, 1);


-- ================================================
-- Booking / notification / order compatibility patch
-- Added for service booking -> notification -> order workflow
-- ================================================

SET @booking_notification_col := (
  SELECT COUNT(1)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 't_booking'
    AND column_name = 'notification_id'
);
SET @booking_notification_sql := IF(
  @booking_notification_col = 0,
  'ALTER TABLE t_booking ADD COLUMN notification_id BIGINT COMMENT ''related notification id''',
  'SELECT 1'
);
PREPARE stmt FROM @booking_notification_sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS t_notification (
    id BIGINT PRIMARY KEY COMMENT 'notification id',
    user_id VARCHAR(64) NOT NULL COMMENT 'receiver user id',
    title VARCHAR(200) NOT NULL COMMENT 'title',
    content TEXT NOT NULL COMMENT 'content',
    service_name VARCHAR(200) DEFAULT '' COMMENT 'service name',
    time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'notification time',
    is_read TINYINT(1) DEFAULT 0 COMMENT 'read flag',
    is_processed TINYINT(1) DEFAULT 0 COMMENT 'processed flag',
    order_id BIGINT COMMENT 'related order id',
    related_booking_id BIGINT COMMENT 'related booking id',
    INDEX idx_notify_user_time (user_id, time),
    INDEX idx_notify_booking (related_booking_id),
    INDEX idx_notify_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='notification table';

CREATE TABLE IF NOT EXISTS t_order (
    id BIGINT PRIMARY KEY COMMENT 'order id',
    booking_id BIGINT COMMENT 'related booking id',
    buyer_id VARCHAR(64) NOT NULL COMMENT 'buyer user id',
    seller_id VARCHAR(64) NOT NULL COMMENT 'seller user id',
    service_id BIGINT COMMENT 'service id',
    service_title VARCHAR(200) COMMENT 'service title',
    price DECIMAL(10,2) COMMENT 'price',
    booking_date DATETIME COMMENT 'booking date',
    booking_time VARCHAR(50) COMMENT 'booking time',
    duration INT DEFAULT 1 COMMENT 'duration hours',
    status VARCHAR(20) DEFAULT 'pending' COMMENT 'pending confirmed in_progress completed cancelled',
    completed_time DATETIME COMMENT 'completed time',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_service_id (service_id),
    INDEX idx_status_time (status, create_time DESC),
    INDEX idx_buyer_status_ctime (buyer_id, status, create_time),
    INDEX idx_seller_status_ctime (seller_id, status, create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='order table';
