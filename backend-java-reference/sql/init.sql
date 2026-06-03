-- ================================================
-- 同城生活社区平台 - 数据库初始化脚本
-- MySQL 8.0+
-- 账号: root / root
-- 数据库: neighborhood_db
-- ================================================

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
    admin_role VARCHAR(32) DEFAULT 'USER' COMMENT '后台角色: USER/READONLY_ADMIN/ADMIN/SUPER_ADMIN',
    avatar VARCHAR(255) DEFAULT '' COMMENT '头像URL',
    tag VARCHAR(50) DEFAULT '' COMMENT '标签',
    bio VARCHAR(255) DEFAULT '' COMMENT '个人简介',
    is_verified TINYINT(1) DEFAULT 0 COMMENT '是否认证',
    followers_count INT DEFAULT 0 COMMENT '粉丝数',
    following_count INT DEFAULT 0 COMMENT '关注数',
    rating DOUBLE DEFAULT 0 COMMENT '评分',
    sold_count INT DEFAULT 0 COMMENT '成交数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_name (name),
    INDEX idx_admin_role (admin_role)
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
    title VARCHAR(200) DEFAULT '' COMMENT '标题',
    content TEXT NOT NULL COMMENT '动态内容',
    location VARCHAR(100) DEFAULT '' COMMENT '位置',
    category VARCHAR(50) DEFAULT '生活记录' COMMENT '分类',
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
    parent_id BIGINT DEFAULT 0 COMMENT '父评论ID',
    user_id VARCHAR(64) NOT NULL COMMENT '用户ID',
    user_name VARCHAR(50) NOT NULL COMMENT '用户名',
    user_avatar VARCHAR(255) DEFAULT '' COMMENT '用户头像',
    content TEXT NOT NULL COMMENT '评论内容',
    likes INT DEFAULT 0 COMMENT '点赞数',
    status VARCHAR(20) DEFAULT 'normal' COMMENT '状态',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_news_id (news_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_user_id (user_id),
    INDEX idx_news_create (news_id, create_time DESC),
    INDEX idx_comment_news_status_time (news_id, status, create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- ================================================
-- 评论点赞表
-- ================================================
DROP TABLE IF EXISTS t_comment_like;
CREATE TABLE t_comment_like (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '评论点赞ID',
    comment_id BIGINT NOT NULL COMMENT '评论ID',
    user_id VARCHAR(64) NOT NULL COMMENT '用户ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_comment_user (comment_id, user_id),
    INDEX idx_comment_id (comment_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论点赞表';

-- ================================================
-- 闲置商品表
-- ================================================
DROP TABLE IF EXISTS t_market_item;
CREATE TABLE t_market_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '商品ID',
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
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态',
    reject_reason VARCHAR(255) DEFAULT '' COMMENT '驳回原因',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_seller (seller_id),
    INDEX idx_category (category),
    INDEX idx_create_time (created_at DESC),
    INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='闲置商品表';

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
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态',
    reject_reason VARCHAR(255) DEFAULT '' COMMENT '驳回原因',
    area VARCHAR(100) DEFAULT '' COMMENT '服务区域',
    phone VARCHAR(32) DEFAULT '' COMMENT '联系电话',
    latitude DOUBLE DEFAULT NULL COMMENT '纬度',
    longitude DOUBLE DEFAULT NULL COMMENT '经度',
    images JSON COMMENT '图片列表(JSON)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_seller (seller_id),
    INDEX idx_category (category),
    INDEX idx_rating (rating DESC),
    INDEX idx_create_time (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='生活服务表';

-- ================================================
-- 服务评价表
-- ================================================
CREATE TABLE IF NOT EXISTS t_service_review (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '评价ID',
    service_id BIGINT NOT NULL COMMENT '服务ID',
    user_id VARCHAR(64) NOT NULL COMMENT '用户ID',
    user_name VARCHAR(50) NOT NULL COMMENT '用户名',
    user_avatar VARCHAR(255) DEFAULT '' COMMENT '用户头像',
    rating INT NOT NULL COMMENT '评分',
    content TEXT NOT NULL COMMENT '评价内容',
    likes INT DEFAULT 0 COMMENT '点赞数',
    status VARCHAR(20) DEFAULT 'normal' COMMENT '状态',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_service_id (service_id),
    INDEX idx_service_review_status_time (service_id, status, create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='服务评价表';

-- ================================================
-- 预约表
-- ================================================
DROP TABLE IF EXISTS t_booking;
CREATE TABLE t_booking (
    id BIGINT PRIMARY KEY COMMENT '预约ID',
    service_id BIGINT NOT NULL COMMENT '服务ID',
    buyer_id VARCHAR(64) NOT NULL COMMENT '买家ID',
    seller_id VARCHAR(64) NOT NULL COMMENT '卖家ID',
    booking_date DATETIME NOT NULL COMMENT '预约日期',
    booking_time VARCHAR(50) NOT NULL COMMENT '预约时间',
    duration INT DEFAULT 1 COMMENT '服务时长(小时)',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending confirmed completed cancelled',
    notification_id BIGINT DEFAULT NULL COMMENT '关联通知ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_service_id (service_id),
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_booking_buyer_status_time (buyer_id, status, create_time),
    INDEX idx_booking_seller_status_time (seller_id, status, create_time)
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
    message_type VARCHAR(20) DEFAULT 'text' COMMENT '消息类型(text/image)',
    media_url VARCHAR(500) DEFAULT '' COMMENT '媒体地址',
    is_read TINYINT(1) DEFAULT 0 COMMENT '是否已读',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_conversation (sender_id, receiver_id),
    INDEX idx_create_time (create_time DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息表';

-- ================================================
-- 通知表
-- ================================================
DROP TABLE IF EXISTS t_notification;
CREATE TABLE t_notification (
    id BIGINT PRIMARY KEY COMMENT '通知ID',
    user_id VARCHAR(64) NOT NULL COMMENT '接收用户ID',
    title VARCHAR(200) NOT NULL COMMENT '标题',
    content TEXT NOT NULL COMMENT '内容',
    service_name VARCHAR(200) DEFAULT '' COMMENT '服务名称',
    time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '通知时间',
    is_read TINYINT(1) DEFAULT 0 COMMENT '是否已读',
    is_processed TINYINT(1) DEFAULT 0 COMMENT '是否已处理',
    order_id BIGINT DEFAULT NULL COMMENT '关联订单ID',
    related_booking_id BIGINT DEFAULT NULL COMMENT '关联预约ID',
    INDEX idx_notify_user_time (user_id, time),
    INDEX idx_notify_booking (related_booking_id),
    INDEX idx_notify_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知表';

-- ================================================
-- 订单表
-- ================================================
DROP TABLE IF EXISTS t_order;
CREATE TABLE t_order (
    id BIGINT PRIMARY KEY COMMENT '订单ID',
    booking_id BIGINT DEFAULT NULL COMMENT '关联预约ID',
    buyer_id VARCHAR(64) NOT NULL COMMENT '买家ID',
    seller_id VARCHAR(64) NOT NULL COMMENT '卖家ID',
    service_id BIGINT DEFAULT NULL COMMENT '服务ID',
    service_title VARCHAR(200) DEFAULT '' COMMENT '服务标题',
    price DECIMAL(10,2) DEFAULT NULL COMMENT '价格',
    booking_date DATETIME DEFAULT NULL COMMENT '预约日期',
    booking_time VARCHAR(50) DEFAULT NULL COMMENT '预约时间',
    duration INT DEFAULT 1 COMMENT '服务时长(小时)',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending confirmed in_progress completed cancelled',
    cancel_reason VARCHAR(255) DEFAULT '' COMMENT '取消原因',
    completed_time DATETIME DEFAULT NULL COMMENT '完成时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_service_id (service_id),
    INDEX idx_status_time (status, create_time DESC),
    INDEX idx_buyer_status_ctime (buyer_id, status, create_time),
    INDEX idx_seller_status_ctime (seller_id, status, create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- ================================================
-- 分类表
-- ================================================
DROP TABLE IF EXISTS t_category;
CREATE TABLE t_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(64) DEFAULT 'category',
    type VARCHAR(20) DEFAULT 'service',
    status VARCHAR(20) DEFAULT 'normal',
    sort_order INT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type_order (type, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分类表';

-- ================================================
-- 管理端黑名单表
-- ================================================
DROP TABLE IF EXISTS t_admin_blacklist;
CREATE TABLE t_admin_blacklist (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    target_type VARCHAR(20) NOT NULL,
    target_value VARCHAR(255) NOT NULL,
    reason VARCHAR(255) DEFAULT '',
    creator VARCHAR(64) DEFAULT '',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_target (target_type, target_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理端黑名单表';

-- ================================================
-- 管理端操作日志表
-- ================================================
DROP TABLE IF EXISTS t_admin_operation_log;
CREATE TABLE t_admin_operation_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    operator VARCHAR(64) DEFAULT '',
    role_name VARCHAR(64) DEFAULT '',
    action_name VARCHAR(100) DEFAULT '',
    target VARCHAR(255) DEFAULT '',
    ip VARCHAR(64) DEFAULT '',
    status VARCHAR(20) DEFAULT 'success',
    details VARCHAR(500) DEFAULT '',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_create_time (create_time DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理端操作日志表';

-- ================================================
-- 管理端登录日志表
-- ================================================
DROP TABLE IF EXISTS t_admin_login_log;
CREATE TABLE t_admin_login_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(64) DEFAULT '',
    username VARCHAR(64) DEFAULT '',
    ip VARCHAR(64) DEFAULT '',
    device VARCHAR(255) DEFAULT '',
    location VARCHAR(100) DEFAULT '',
    status VARCHAR(20) DEFAULT 'success',
    fail_reason VARCHAR(255) DEFAULT '',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_create_time (create_time DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理端登录日志表';

-- ================================================
-- 管理端图片状态表
-- ================================================
DROP TABLE IF EXISTS t_admin_image_status;
CREATE TABLE t_admin_image_status (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    image_url VARCHAR(500) NOT NULL,
    status VARCHAR(20) DEFAULT 'approved',
    UNIQUE KEY uk_image_url (image_url)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理端图片状态表';

-- ================================================
-- 管理端权限表
-- ================================================
DROP TABLE IF EXISTS t_admin_permission;
CREATE TABLE t_admin_permission (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(100) NOT NULL,
    category VARCHAR(100) DEFAULT '',
    description VARCHAR(255) DEFAULT '',
    status VARCHAR(20) DEFAULT 'active',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_permission_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理端权限表';

-- ================================================
-- 管理端菜单表
-- ================================================
DROP TABLE IF EXISTS t_admin_menu;
CREATE TABLE t_admin_menu (
    id VARCHAR(64) PRIMARY KEY,
    parent_id VARCHAR(64) DEFAULT NULL,
    name VARCHAR(100) NOT NULL,
    path VARCHAR(120) DEFAULT '',
    icon VARCHAR(64) DEFAULT '',
    sort_order INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    type VARCHAR(20) DEFAULT 'menu',
    permission_code VARCHAR(100) DEFAULT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理端菜单表';

-- ================================================
-- 管理端角色表
-- ================================================
DROP TABLE IF EXISTS t_admin_role;
CREATE TABLE t_admin_role (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(64) NOT NULL,
    description VARCHAR(255) DEFAULT '',
    status VARCHAR(20) DEFAULT 'active',
    is_system TINYINT(1) DEFAULT 1,
    menu_ids TEXT,
    permission_codes TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_role_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理端角色表';

-- ================================================
-- 评价点赞表
-- ================================================
DROP TABLE IF EXISTS t_review_like;
CREATE TABLE t_review_like (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '评价点赞ID',
    review_id BIGINT NOT NULL COMMENT '评价ID',
    user_id VARCHAR(64) NOT NULL COMMENT '用户ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_review_user (review_id, user_id),
    INDEX idx_review_id (review_id),
    INDEX idx_review_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价点赞表';

-- ================================================
-- 初始化测试数据
-- ================================================
INSERT INTO t_user (id, name, email, password, avatar, tag, bio, is_verified, followers_count, following_count, rating, sold_count, admin_role) VALUES
('u001', '李阿姨', 'li_ayi@example.com', '123456', '/api/file/931f8e1a2d834e03a288800df5a7e6ec.jpg', '社区达人', '', 1, 3420, 156, 4.8, 36, 'USER'),
('u002', '王大厨', 'wang_dachu@example.com', '123456', '/api/file/37dc56e3f2b541b79d98e82c4abd371a.jpg', '美食达人', '', 1, 1241, 320, 4.5, 89, 'USER'),
('u003', '小林', 'photo_xiaolin@example.com', '123456', '/api/file/64edb6bef14c4c1b8bd23ffe817e54a5.jpg', '摄影达人', '', 0, 850, 412, 4.6, 18, 'USER'),
('admin_test', 'test', 'test@example.com', 'test', '', 'admin', '', 1, 0, 0, 0, 0, 'SUPER_ADMIN'),
('admin_readonly', 'test1', 'test1@example.com', '123456', '', 'admin', '', 1, 0, 0, 0, 0, 'READONLY_ADMIN'),
('admin_manager', 'manager', 'manager@example.com', 'manager', '', 'admin', '', 1, 0, 0, 0, 0, 'ADMIN'),
('normal_user', 'normal', 'normal@example.com', 'normal', '', 'user', '', 0, 0, 0, 0, 0, 'USER');

INSERT INTO t_news (author_id, title, content, location, category, likes, comments_count, images, shares, collections) VALUES
('u001', '花店推荐', '今天在小区门口发现了一家新开的花店，品种很齐全，老板人也特别好，推荐给大家。', '金地格林世界', '同城发现', 24, 6, '["/api/file/c2675e0851d940799368c483682ddf3d.jpg"]', 2, 5),
('u002', '帮忙留意走失柯基', '有人在公园看到一只走失的柯基吗？邻居家的狗跑丢了，大家帮忙留意一下，背部有一块深色花纹。', '滨江公园', '邻里互助', 86, 15, '[]', 12, 8);

INSERT INTO t_service (title, description, category, price, image, seller_id, rating, reviews, distance, unit, highlights, status, area, phone, images) VALUES
('专业家庭保洁 - 全屋深度除尘除螨', '提供全屋深度保洁、厨房重油污清洁、卫生间除垢和高温消毒服务。', 'domestic', 150.00, '/api/file/b6c049a9c65744a6a7dcd58e76cf9f65.jpg', 'u001', 4.81, 128, '1.2km', '次', '["4小时", "自备工具", "环保药剂"]', 'active', '浦东新区', '13800000001', '["/api/file/b6c049a9c65744a6a7dcd58e76cf9f65.jpg"]'),
('上门宠物洗护 - 狗狗SPA与深度清洁', '专业宠物洗护师上门服务，温和洗护，适合日常清洁与护理。', 'pet', 88.00, '/api/file/b6c049a9c65744a6a7dcd58e76cf9f65.jpg', 'u001', 5.0, 86, '0.8km', '次', '["自带设备", "温和沐浴"]', 'active', '徐汇区', '13800000002', '["/api/file/b6c049a9c65744a6a7dcd58e76cf9f65.jpg"]'),
('Test Service', 'desc', '', 100.00, '/api/file/images/2026/05/25da6aa966dabf41deb7bb9f78295bb04c.jpg', 'u002', 0.0, 0, '', '', NULL, 'active', '', '', '["/api/file/images/2026/05/25da6aa966dabf41deb7bb9f78295bb04c.jpg"]');

INSERT INTO t_market_item (title, description, price, item_condition, image, images, seller_id, category, original_price, location, verified, free_shipping, status) VALUES
('德龙 (De''Longhi) 意式半自动咖啡机 - 95成新', '成色很好，使用时间不长，功能正常，配件齐全。', 3200.00, '95成新', '/api/file/44dc84a59ccd486b9b0a383c556c9d9b.jpg', '["/api/file/44dc84a59ccd486b9b0a383c556c9d9b.jpg"]', 'u002', 'market', 5480.00, '浦东新区', 1, 1, 'active'),
('Nintendo Switch 日版红蓝 - 带健身环', '闲置半年，整机保存良好，包装和配件齐全。', 1800.00, '99新', '/api/file/d0f83c5066454d7c958a3fb0e954c5a2.jpg', '["/api/file/d0f83c5066454d7c958a3fb0e954c5a2.jpg"]', 'u003', 'market', 2400.00, '徐汇区', 1, 1, 'active');

INSERT INTO t_category (name, icon, type, status, sort_order) VALUES
('生活服务', 'category', 'service', 'normal', 10),
('闲置商品', 'category', 'goods', 'normal', 20),
('动态内容', 'category', 'dynamic', 'normal', 30);

INSERT INTO t_admin_permission (id, name, code, category, description, status) VALUES
('perm-user-view', '用户列表查看', 'user:view', '用户风控', '查看用户列表和基础资料', 'active'),
('perm-user-ban', '用户状态管理', 'user:ban', '用户风控', '禁用或恢复用户', 'active'),
('perm-user-verify', '用户认证管理', 'user:verify', '用户风控', '调整用户认证状态', 'active'),
('perm-user-role', '用户角色分配', 'user:role', '用户风控', '分配后台角色', 'active'),
('perm-blacklist-view', '黑名单查看', 'blacklist:view', '用户风控', '查看风控黑名单', 'active'),
('perm-blacklist-edit', '黑名单维护', 'blacklist:edit', '用户风控', '新增或删除黑名单', 'active'),
('perm-posts-view', '动态查看', 'posts:view', '内容运营', '查看动态管理列表', 'active'),
('perm-posts-audit', '动态审核', 'posts:audit', '内容运营', '审核和处置动态内容', 'active'),
('perm-comments-view', '评论查看', 'comments:view', '内容运营', '查看评论内容', 'active'),
('perm-comments-manage', '评论治理', 'comments:manage', '内容运营', '隐藏、删除和干预评论', 'active'),
('perm-messages-view', '消息查看', 'messages:view', '内容运营', '查看私信消息', 'active'),
('perm-messages-manage', '消息治理', 'messages:manage', '内容运营', '标记已读和删除消息', 'active'),
('perm-images-view', '图片查看', 'images:view', '内容运营', '查看图片资源', 'active'),
('perm-images-audit', '图片审核', 'images:audit', '内容运营', '审核和删除图片', 'active'),
('perm-goods-view', '商品查看', 'goods:view', '生活服务', '查看闲置商品', 'active'),
('perm-goods-audit', '商品审核', 'goods:audit', '生活服务', '上架、下架和标记商品', 'active'),
('perm-services-view', '服务查看', 'services:view', '生活服务', '查看生活服务', 'active'),
('perm-services-manage', '服务管理', 'services:manage', '生活服务', '新增、上架和下架服务', 'active'),
('perm-orders-view', '订单查看', 'orders:view', '生活服务', '查看订单列表和详情', 'active'),
('perm-orders-cancel', '订单关闭', 'orders:cancel', '生活服务', '强制关闭订单', 'active'),
('perm-notifications-view', '通知查看', 'notifications:view', '系统设置', '查看通知列表', 'active'),
('perm-notifications-create', '通知发布', 'notifications:create', '系统设置', '创建和发送通知', 'active'),
('perm-categories-view', '分类查看', 'categories:view', '系统设置', '查看分类配置', 'active'),
('perm-categories-edit', '分类维护', 'categories:edit', '系统设置', '新增和启停分类', 'active'),
('perm-menus-view', '菜单查看', 'menus:view', '系统设置', '查看菜单配置', 'active'),
('perm-roles-view', '角色查看', 'roles:view', '系统设置', '查看角色配置', 'active'),
('perm-roles-manage', '角色管理', 'roles:manage', '系统设置', '修改角色菜单和权限', 'active'),
('perm-permissions-view', '权限查看', 'permissions:view', '系统设置', '查看系统权限清单', 'active'),
('perm-logs-login', '登录日志查看', 'logs:login', '系统安全', '查看登录日志', 'active'),
('perm-logs-operation', '操作日志查看', 'logs:operation', '系统安全', '查看操作日志', 'active'),
('perm-logs-retention', '日志清理', 'logs:retention', '系统安全', '执行日志保留策略', 'active');

INSERT INTO t_admin_menu (id, parent_id, name, path, icon, sort_order, status, type, permission_code) VALUES
('dir-users', NULL, '用户风控', '', 'admin_panel_settings', 10, 'active', 'directory', NULL),
('menu-users', 'dir-users', '用户管理', '/admin/users', 'group', 11, 'active', 'menu', 'user:view'),
('menu-blacklist', 'dir-users', '风控黑名单', '/admin/blacklist', 'gavel', 12, 'active', 'menu', 'blacklist:view'),
('dir-content', NULL, '内容运营', '', 'forum', 20, 'active', 'directory', NULL),
('menu-posts', 'dir-content', '动态管理', '/admin/posts', 'explore', 21, 'active', 'menu', 'posts:view'),
('menu-comments', 'dir-content', '评论管理', '/admin/comments', 'chat_bubble', 22, 'active', 'menu', 'comments:view'),
('menu-messages', 'dir-content', '消息管理', '/admin/messages', 'forum', 23, 'active', 'menu', 'messages:view'),
('menu-images', 'dir-content', '图片管理', '/admin/images', 'photo_library', 24, 'active', 'menu', 'images:view'),
('dir-services', NULL, '生活服务', '', 'storefront', 30, 'active', 'directory', NULL),
('menu-market', 'dir-services', '闲置商品管理', '/admin/market', 'shopping_bag', 31, 'active', 'menu', 'goods:view'),
('menu-services', 'dir-services', '服务管理', '/admin/services', 'home_repair_service', 32, 'active', 'menu', 'services:view'),
('menu-orders', 'dir-services', '订单管理', '/admin/orders', 'receipt_long', 33, 'active', 'menu', 'orders:view'),
('dir-system', NULL, '系统设置', '', 'settings_suggest', 40, 'active', 'directory', NULL),
('menu-notifications', 'dir-system', '通知管理', '/admin/notifications', 'campaign', 41, 'active', 'menu', 'notifications:view'),
('menu-categories', 'dir-system', '分类管理', '/admin/categories', 'category', 42, 'active', 'menu', 'categories:view'),
('menu-menus', 'dir-system', '菜单管理', '/admin/menus', 'menu', 43, 'active', 'menu', 'menus:view'),
('menu-roles', 'dir-system', '角色管理', '/admin/roles', 'badge', 44, 'active', 'menu', 'roles:view'),
('menu-permissions', 'dir-system', '权限管理', '/admin/permissions', 'key', 45, 'active', 'menu', 'permissions:view'),
('dir-logs', NULL, '系统安全', '', 'security', 50, 'active', 'directory', NULL),
('menu-login-logs', 'dir-logs', '登录日志', '/admin/login-logs', 'fingerprint', 51, 'active', 'menu', 'logs:login'),
('menu-op-logs', 'dir-logs', '操作日志', '/admin/op-logs', 'receipt_long', 52, 'active', 'menu', 'logs:operation');

INSERT INTO t_admin_role (id, name, code, description, status, is_system, menu_ids, permission_codes) VALUES
('role-user', '普通用户', 'USER', '前台普通用户，不可进入管理端', 'active', 1, '[]', '[]'),
('role-readonly', '只读管理员', 'READONLY_ADMIN', '可查看后台数据，不可执行写操作', 'active', 1,
 '["dir-users","menu-users","menu-blacklist","dir-content","menu-posts","menu-comments","menu-messages","menu-images","dir-services","menu-market","menu-services","menu-orders","dir-system","menu-notifications","menu-categories","menu-menus","menu-roles","menu-permissions","dir-logs","menu-login-logs","menu-op-logs"]',
 '["user:view","blacklist:view","posts:view","comments:view","messages:view","images:view","goods:view","services:view","orders:view","notifications:view","categories:view","menus:view","roles:view","permissions:view","logs:login","logs:operation"]'),
('role-admin', '管理员', 'ADMIN', '负责日常审核与运营，不可调整角色和权限', 'active', 1,
 '["dir-users","menu-users","menu-blacklist","dir-content","menu-posts","menu-comments","menu-messages","menu-images","dir-services","menu-market","menu-services","menu-orders","dir-system","menu-notifications","menu-categories","dir-logs","menu-login-logs","menu-op-logs"]',
 '["user:view","user:ban","user:verify","blacklist:view","blacklist:edit","posts:view","posts:audit","comments:view","comments:manage","messages:view","messages:manage","images:view","images:audit","goods:view","goods:audit","services:view","services:manage","orders:view","orders:cancel","notifications:view","notifications:create","categories:view","categories:edit","logs:login","logs:operation"]'),
('role-super', '超级管理员', 'SUPER_ADMIN', '拥有管理端全部菜单和操作权限', 'active', 1,
 '["dir-users","menu-users","menu-blacklist","dir-content","menu-posts","menu-comments","menu-messages","menu-images","dir-services","menu-market","menu-services","menu-orders","dir-system","menu-notifications","menu-categories","menu-menus","menu-roles","menu-permissions","dir-logs","menu-login-logs","menu-op-logs"]',
 '["user:view","user:ban","user:verify","user:role","blacklist:view","blacklist:edit","posts:view","posts:audit","comments:view","comments:manage","messages:view","messages:manage","images:view","images:audit","goods:view","goods:audit","services:view","services:manage","orders:view","orders:cancel","notifications:view","notifications:create","categories:view","categories:edit","menus:view","roles:view","roles:manage","permissions:view","logs:login","logs:operation","logs:retention"]');

-- ================================================
-- 兼容补丁：补充用户扩展字段
-- ================================================
ALTER TABLE t_user ADD COLUMN phone VARCHAR(32) DEFAULT '';
ALTER TABLE t_user ADD COLUMN region VARCHAR(100) DEFAULT '';
ALTER TABLE t_user ADD COLUMN status VARCHAR(20) DEFAULT 'normal';
ALTER TABLE t_user ADD COLUMN profile_visible VARCHAR(20) DEFAULT 'public';
ALTER TABLE t_user ADD COLUMN posts_visible VARCHAR(20) DEFAULT 'public';
ALTER TABLE t_user ADD COLUMN show_location TINYINT(1) DEFAULT 1;
ALTER TABLE t_user ADD COLUMN push_enabled TINYINT(1) DEFAULT 1;
ALTER TABLE t_user ADD COLUMN message_notify TINYINT(1) DEFAULT 1;
ALTER TABLE t_user ADD COLUMN follow_notify TINYINT(1) DEFAULT 1;
ALTER TABLE t_user ADD COLUMN like_notify TINYINT(1) DEFAULT 1;
ALTER TABLE t_user ADD COLUMN comment_notify TINYINT(1) DEFAULT 1;
ALTER TABLE t_user ADD COLUMN system_notify TINYINT(1) DEFAULT 0;
