-- ================================================
-- 同城生活社区平台 - 数据库初始化脚本
-- MySQL 8.0+
-- 账户: root / root
-- 数据库: neighborhood_db
-- ================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS neighborhood_db
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE neighborhood_db;

-- ================================================
-- 用户表
-- ================================================
DROP TABLE IF EXISTS t_user;
CREATE TABLE t_user (
    id VARCHAR(64) PRIMARY KEY COMMENT '用户ID',
    name VARCHAR(50) NOT NULL COMMENT '昵称',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    avatar VARCHAR(255) DEFAULT '' COMMENT '头像URL',
    tag VARCHAR(50) DEFAULT '' COMMENT '标签',
    is_verified TINYINT(1) DEFAULT 0 COMMENT '是否认证',
    followers_count INT DEFAULT 0 COMMENT '粉丝数',
    following_count INT DEFAULT 0 COMMENT '关注数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ================================================
-- 关注关系表
-- ================================================
DROP TABLE IF EXISTS t_follow;
CREATE TABLE t_follow (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    follower_id VARCHAR(64) NOT NULL COMMENT '关注者ID',
    following_id VARCHAR(64) NOT NULL COMMENT '被关注者ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_follow (follower_id, following_id),
    INDEX idx_follower (follower_id),
    INDEX idx_following (following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关注关系表';

-- ================================================
-- 社区动态表
-- ================================================
DROP TABLE IF EXISTS t_news;
CREATE TABLE t_news (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '动态ID',
    author_id VARCHAR(64) NOT NULL COMMENT '作者ID',
    content TEXT NOT NULL COMMENT '动态内容',
    location VARCHAR(100) DEFAULT '' COMMENT '位置',
    category VARCHAR(50) DEFAULT '生活记录' COMMENT '分类：生活记录、同城发现、探店动态、邻里闲情、物业反馈',
    likes INT DEFAULT 0 COMMENT '点赞数',
    comments_count INT DEFAULT 0 COMMENT '评论数',
    images JSON COMMENT '图片列表(JSON)',
    shares INT DEFAULT 0 COMMENT '分享数',
    collections INT DEFAULT 0 COMMENT '收藏数',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_author (author_id),
    INDEX idx_create_time (create_time DESC),
    INDEX idx_likes (likes DESC),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社区动态表';

-- ================================================
-- 评论表
-- ================================================
DROP TABLE IF EXISTS t_comment;
CREATE TABLE t_comment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '评论ID',
    news_id BIGINT NOT NULL COMMENT '动态ID',
    user_id VARCHAR(64) NOT NULL COMMENT '用户ID',
    user_name VARCHAR(50) NOT NULL COMMENT '用户名',
    user_avatar VARCHAR(255) DEFAULT '' COMMENT '用户头像',
    content TEXT NOT NULL COMMENT '评论内容',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_news_id (news_id),
    INDEX idx_user_id (user_id),
    INDEX idx_news_create (news_id, create_time DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- ================================================
-- 闲置物品表
-- ================================================
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='闲置物品表';

-- ================================================
-- 生活服务表
-- ================================================
DROP TABLE IF EXISTS t_service;
CREATE TABLE t_service (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '服务ID',
    title VARCHAR(200) NOT NULL COMMENT '标题',
    description TEXT COMMENT '描述',
    category VARCHAR(50) DEFAULT '' COMMENT '分类',
    price DECIMAL(10,2) NOT NULL COMMENT '价格',
    image VARCHAR(255) DEFAULT '' COMMENT '封面图',
    seller_id VARCHAR(64) NOT NULL COMMENT '服务商ID',
    rating DOUBLE DEFAULT 0 COMMENT '评分',
    reviews INT DEFAULT 0 COMMENT '评价数',
    distance VARCHAR(50) DEFAULT '' COMMENT '距离',
    unit VARCHAR(20) DEFAULT '' COMMENT '单位',
    highlights JSON COMMENT '亮点(JSON)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_seller (seller_id),
    INDEX idx_category (category),
    INDEX idx_rating (rating DESC),
    INDEX idx_create_time (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='生活服务表';

-- ================================================
-- 预约表
-- ================================================
CREATE TABLE IF NOT EXISTS t_booking (
    id BIGINT PRIMARY KEY COMMENT '预约ID',
    service_id BIGINT NOT NULL COMMENT '服务ID',
    buyer_id VARCHAR(64) NOT NULL COMMENT '买家ID',
    seller_id VARCHAR(64) NOT NULL COMMENT '卖家ID',
    booking_date DATETIME NOT NULL COMMENT '预约日期',
    booking_time VARCHAR(50) NOT NULL COMMENT '预约时间',
    duration INT DEFAULT 1 COMMENT '服务时长(小时)',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态:pending confirmed completed cancelled',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_service_id (service_id),
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_seller_id (seller_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预约表';

-- ================================================
-- 消息表
-- ================================================
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息表';

-- ================================================
-- 初始化测试数据
-- ================================================

-- 插入测试用户
INSERT INTO t_user (id, name, email, password, avatar, tag, is_verified, followers_count, following_count) VALUES
('u001', '李阿姨', 'li_ayi@example.com', '123456', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200', '社区达人', 1, 3420, 156),
('u002', '王大厨', 'wang_dachu@example.com', '123456', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200', '美食达人', 1, 1240, 320),
('u003', '小林', 'photo_xiaolin@example.com', '123456', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', '摄影达人', 0, 850, 412);

-- 插入测试动态
INSERT INTO t_news (author_id, content, location, category, likes, comments_count, images, shares, collections) VALUES
('u001', '今天在小区门口发现了一家新开的花店，品种好齐全，老板人也特别好！强烈推荐给各位邻居~ 🌸🌷', '金地格林世界', '同城发现', 24, 6, '["https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=800"]', 2, 5),
('u002', '有人在公园看到一只走失的柯基吗？邻居家的狗跑丢了，大家帮忙关注下，特征是背部有一块深色花纹。', '滨江公园', '邻里闲情', 86, 15, '[]', 12, 8);

-- 插入测试服务
INSERT INTO t_service (title, description, category, price, image, seller_id, rating, reviews, distance, unit, highlights) VALUES
('专业家庭保洁 - 全屋深度除尘除螨及高温消毒', '我们提供的不只是保洁，更是为您打造一个健康舒心的居家环境。我们的服务包括：全屋360°除尘、厨卫重垢去除、全屋除螨以及紫外线/高温蒸汽消毒。', 'domestic', 150.00, 'https://images.unsplash.com/photo-1581578731548-c64695cc6954?auto=format&fit=crop&q=80&w=800', 'u001', 4.81, 128, '1.2km', '次', '["4小时", "自备工具", "环保药剂"]'),
('上门宠物洗护 - 狗狗SPA与深度清洁', '专业宠物洗护师，3年大厂经验。', 'pet', 88.00, 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800', 'u001', 5.0, 86, '0.8km', '次', '["自带设备", "温和沐浴"]');

-- 插入测试闲置
INSERT INTO t_market_item (title, description, price, item_condition, image, images, seller_id, category, original_price, location, verified, free_shipping) VALUES
('德龙 (De''Longhi) 意式半自动咖啡机 - 95成新', '成色很好，用了不到半年。', 3200.00, '95成新', 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&q=80&w=800', '["https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&q=80&w=800"]', 'u002', 'market', 5480.00, '浦东新区', 1, 1),
('Nintendo Switch 日版蓝红 - 带健身环', '吃灰半年，全套包装齐全。', 1800.00, '99新', 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&q=80&w=800', '["https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&q=80&w=800"]', 'u003', 'market', 2400.00, '徐汇区', 1, 1);