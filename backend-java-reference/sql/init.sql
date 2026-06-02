-- ================================================
-- 鍚屽煄鐢熸椿绀惧尯骞冲彴 - 鏁版嵁搴撳垵濮嬪寲鑴氭湰
-- MySQL 8.0+
-- 璐︽埛: root / root
-- 鏁版嵁搴? neighborhood_db
-- ================================================

-- 鍒涘缓鏁版嵁搴?CREATE DATABASE IF NOT EXISTS neighborhood_db
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE neighborhood_db;

-- ================================================
-- 鐢ㄦ埛琛?-- ================================================
DROP TABLE IF EXISTS t_user;
CREATE TABLE t_user (
    id VARCHAR(64) PRIMARY KEY COMMENT '鐢ㄦ埛ID',
    name VARCHAR(50) NOT NULL COMMENT '鏄电О',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '閭',
    password VARCHAR(100) NOT NULL COMMENT '瀵嗙爜',
    admin_role VARCHAR(32) DEFAULT 'USER' COMMENT 'admin role: USER/READONLY_ADMIN/SUPER_ADMIN',
    avatar VARCHAR(255) DEFAULT '' COMMENT '澶村儚URL',
    tag VARCHAR(50) DEFAULT '' COMMENT '鏍囩',
    bio VARCHAR(255) DEFAULT '' COMMENT '涓汉绠€浠?,
    is_verified TINYINT(1) DEFAULT 0 COMMENT '鏄惁璁よ瘉',
    followers_count INT DEFAULT 0 COMMENT '绮変笣鏁?,
    following_count INT DEFAULT 0 COMMENT '鍏虫敞鏁?,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鐢ㄦ埛琛?;

-- ================================================
-- 鍏虫敞鍏崇郴琛?-- ================================================
DROP TABLE IF EXISTS t_follow;
CREATE TABLE t_follow (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '涓婚敭',
    follower_id VARCHAR(64) NOT NULL COMMENT '鍏虫敞鑰匢D',
    following_id VARCHAR(64) NOT NULL COMMENT '琚叧娉ㄨ€匢D',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_follow (follower_id, following_id),
    INDEX idx_follower (follower_id),
    INDEX idx_following (following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鍏虫敞鍏崇郴琛?;

-- ================================================
-- 绀惧尯鍔ㄦ€佽〃
-- ================================================
DROP TABLE IF EXISTS t_news;
CREATE TABLE t_news (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '鍔ㄦ€両D',
    author_id VARCHAR(64) NOT NULL COMMENT '浣滆€匢D',
    title VARCHAR(200) DEFAULT '' COMMENT '鏍囬',
    content TEXT NOT NULL COMMENT '鍔ㄦ€佸唴瀹?,
    location VARCHAR(100) DEFAULT '' COMMENT '浣嶇疆',
    category VARCHAR(50) DEFAULT '鐢熸椿璁板綍' COMMENT '鍒嗙被锛氱敓娲昏褰曘€佸悓鍩庡彂鐜般€佹帰搴楀姩鎬併€侀偦閲岄棽鎯呫€佺墿涓氬弽棣?,
    likes INT DEFAULT 0 COMMENT '鐐硅禐鏁?,
    comments_count INT DEFAULT 0 COMMENT '璇勮鏁?,
    images JSON COMMENT '鍥剧墖鍒楄〃(JSON)',
    shares INT DEFAULT 0 COMMENT '鍒嗕韩鏁?,
    collections INT DEFAULT 0 COMMENT '鏀惰棌鏁?,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_author (author_id),
    INDEX idx_create_time (create_time DESC),
    INDEX idx_likes (likes DESC),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='绀惧尯鍔ㄦ€佽〃';

-- ================================================
-- 璇勮琛?-- ================================================
DROP TABLE IF EXISTS t_comment;
CREATE TABLE t_comment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '璇勮ID',
    news_id BIGINT NOT NULL COMMENT '鍔ㄦ€両D',`r`n    parent_id BIGINT DEFAULT 0 COMMENT '鐖惰瘎璁篒D',
    user_id VARCHAR(64) NOT NULL COMMENT '鐢ㄦ埛ID',
    user_name VARCHAR(50) NOT NULL COMMENT '鐢ㄦ埛鍚?,
    user_avatar VARCHAR(255) DEFAULT '' COMMENT '鐢ㄦ埛澶村儚',
    content TEXT NOT NULL COMMENT '璇勮鍐呭',
    likes INT DEFAULT 0 COMMENT '鐐硅禐鏁?,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_news_id (news_id),`r`n    INDEX idx_parent_id (parent_id),
    INDEX idx_user_id (user_id),
    INDEX idx_news_create (news_id, create_time DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='璇勮琛?;

-- ================================================
-- 闂茬疆鐗╁搧琛?-- ================================================
-- ================================================
-- 璇勮鐐硅禐琛?-- ================================================
DROP TABLE IF EXISTS t_comment_like;
CREATE TABLE t_comment_like (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '璇勮鐐硅禐ID',
    comment_id BIGINT NOT NULL COMMENT '璇勮ID',
    user_id VARCHAR(64) NOT NULL COMMENT '鐢ㄦ埛ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_comment_user (comment_id, user_id),
    INDEX idx_comment_id (comment_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='璇勮鐐硅禐琛?;

DROP TABLE IF EXISTS t_market_item;
CREATE TABLE t_market_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '鐗╁搧ID',
    title VARCHAR(200) NOT NULL COMMENT '鏍囬',
    description TEXT COMMENT '鎻忚堪',
    price DECIMAL(10,2) NOT NULL COMMENT '鍞环',
    item_condition VARCHAR(20) DEFAULT '' COMMENT '鎴愯壊',
    image VARCHAR(255) DEFAULT '' COMMENT '涓诲浘',
    images JSON COMMENT '鍥剧墖鍒楄〃(JSON)',
    seller_id VARCHAR(64) NOT NULL COMMENT '鍗栧ID',
    category VARCHAR(50) DEFAULT '' COMMENT '鍒嗙被',
    original_price DECIMAL(10,2) COMMENT '鍘熶环',
    location VARCHAR(100) DEFAULT '' COMMENT '浣嶇疆',
    verified TINYINT(1) DEFAULT 0 COMMENT '鏄惁璁よ瘉',
    free_shipping TINYINT(1) DEFAULT 0 COMMENT '鏄惁鍖呴偖',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_seller (seller_id),
    INDEX idx_category (category),
    INDEX idx_create_time (created_at DESC),
    INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='闂茬疆鐗╁搧琛?;

-- ================================================
-- 鐢熸椿鏈嶅姟琛?-- ================================================
DROP TABLE IF EXISTS t_service;
CREATE TABLE t_service (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '鏈嶅姟ID',
    title VARCHAR(200) NOT NULL COMMENT '鏍囬',
    description TEXT COMMENT '鎻忚堪',
    category VARCHAR(50) DEFAULT '' COMMENT '鍒嗙被',
    price DECIMAL(10,2) NOT NULL COMMENT '浠锋牸',
    image VARCHAR(255) DEFAULT '' COMMENT '灏侀潰鍥?,
    seller_id VARCHAR(64) NOT NULL COMMENT '鏈嶅姟鍟咺D',
    rating DOUBLE DEFAULT 0 COMMENT '璇勫垎',
    reviews INT DEFAULT 0 COMMENT '璇勪环鏁?,
    distance VARCHAR(50) DEFAULT '' COMMENT '璺濈',
    unit VARCHAR(20) DEFAULT '' COMMENT '鍗曚綅',
    highlights JSON COMMENT '浜偣(JSON)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_seller (seller_id),
    INDEX idx_category (category),
    INDEX idx_rating (rating DESC),
    INDEX idx_create_time (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鐢熸椿鏈嶅姟琛?;

-- ================================================
-- 棰勭害琛?-- ================================================
CREATE TABLE IF NOT EXISTS t_booking (
    id BIGINT PRIMARY KEY COMMENT '棰勭害ID',
    service_id BIGINT NOT NULL COMMENT '鏈嶅姟ID',
    buyer_id VARCHAR(64) NOT NULL COMMENT '涔板ID',
    seller_id VARCHAR(64) NOT NULL COMMENT '鍗栧ID',
    booking_date DATETIME NOT NULL COMMENT '棰勭害鏃ユ湡',
    booking_time VARCHAR(50) NOT NULL COMMENT '棰勭害鏃堕棿',
    duration INT DEFAULT 1 COMMENT '鏈嶅姟鏃堕暱(灏忔椂)',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '鐘舵€?pending confirmed completed cancelled',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_service_id (service_id),
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_seller_id (seller_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='棰勭害琛?;

-- ================================================
-- 娑堟伅琛?-- ================================================
DROP TABLE IF EXISTS t_message;
CREATE TABLE t_message (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '娑堟伅ID',
    sender_id VARCHAR(64) NOT NULL COMMENT '鍙戦€佽€匢D',
    receiver_id VARCHAR(64) NOT NULL COMMENT '鎺ユ敹鑰匢D',
    content TEXT NOT NULL COMMENT '娑堟伅鍐呭',
    message_type VARCHAR(20) DEFAULT 'text' COMMENT '娑堟伅绫诲瀷锛圡text/image锛?',
    media_url VARCHAR(500) DEFAULT '' COMMENT '鍥剧墖鍦板潃',
    is_read TINYINT(1) DEFAULT 0 COMMENT '鏄惁宸茶',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_conversation (sender_id, receiver_id),
    INDEX idx_create_time (create_time DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='娑堟伅琛?;

-- ================================================
-- 鍒濆鍖栨祴璇曟暟鎹?-- ================================================

-- 鎻掑叆娴嬭瘯鐢ㄦ埛
INSERT INTO t_user (id, name, email, password, avatar, tag, is_verified, followers_count, following_count, admin_role) VALUES
('u001', '鏉庨樋濮?, 'li_ayi@example.com', '123456', '/api/file/931f8e1a2d834e03a288800df5a7e6ec.jpg', '绀惧尯杈句汉', 1, 3420, 156, 'USER'),
('u002', '鐜嬪ぇ鍘?, 'wang_dachu@example.com', '123456', '/api/file/37dc56e3f2b541b79d98e82c4abd371a.jpg', '缇庨杈句汉', 1, 1240, 320, 'USER'),
('u003', '灏忔灄', 'photo_xiaolin@example.com', '123456', '/api/file/64edb6bef14c4c1b8bd23ffe817e54a5.jpg', '鎽勫奖杈句汉', 0, 850, 412, 'USER'),
('admin_test', 'test', 'test@example.com', 'test', '', 'admin', 1, 0, 0, 'SUPER_ADMIN'),
('admin_readonly', 'test1', 'test1@example.com', '123456', '', 'admin', 1, 0, 0, 'READONLY_ADMIN'),
('normal_user', 'normal', 'normal@example.com', 'normal', '', 'user', 0, 0, 0, 'USER');

-- 鎻掑叆娴嬭瘯鍔ㄦ€?INSERT INTO t_news (author_id, content, location, category, likes, comments_count, images, shares, collections) VALUES
('u001', '浠婂ぉ鍦ㄥ皬鍖洪棬鍙ｅ彂鐜颁簡涓€瀹舵柊寮€鐨勮姳搴楋紝鍝佺濂介綈鍏紝鑰佹澘浜轰篃鐗瑰埆濂斤紒寮虹儓鎺ㄨ崘缁欏悇浣嶉偦灞厏 馃尭馃尫', '閲戝湴鏍兼灄涓栫晫', '鍚屽煄鍙戠幇', 24, 6, '["/api/file/c2675e0851d940799368c483682ddf3d.jpg"]', 2, 5),
('u002', '鏈変汉鍦ㄥ叕鍥湅鍒颁竴鍙蛋澶辩殑鏌熀鍚楋紵閭诲眳瀹剁殑鐙楄窇涓簡锛屽ぇ瀹跺府蹇欏叧娉ㄤ笅锛岀壒寰佹槸鑳岄儴鏈変竴鍧楁繁鑹茶姳绾广€?, '婊ㄦ睙鍏洯', '閭婚噷闂叉儏', 86, 15, '[]', 12, 8);

-- 鎻掑叆娴嬭瘯鏈嶅姟
INSERT INTO t_service (title, description, category, price, image, seller_id, rating, reviews, distance, unit, highlights) VALUES
('涓撲笟瀹跺涵淇濇磥 - 鍏ㄥ眿娣卞害闄ゅ皹闄よ灗鍙婇珮娓╂秷姣?, '鎴戜滑鎻愪緵鐨勪笉鍙槸淇濇磥锛屾洿鏄负鎮ㄦ墦閫犱竴涓仴搴疯垝蹇冪殑灞呭鐜銆傛垜浠殑鏈嶅姟鍖呮嫭锛氬叏灞?60掳闄ゅ皹銆佸帹鍗噸鍨㈠幓闄ゃ€佸叏灞嬮櫎铻ㄤ互鍙婄传澶栫嚎/楂樻俯钂告苯娑堟瘨銆?, 'domestic', 150.00, '/api/file/b6c049a9c65744a6a7dcd58e76cf9f65.jpg', 'u001', 4.81, 128, '1.2km', '娆?, '["4灏忔椂", "鑷宸ュ叿", "鐜繚鑽墏"]'),
('涓婇棬瀹犵墿娲楁姢 - 鐙楃嫍SPA涓庢繁搴︽竻娲?, '涓撲笟瀹犵墿娲楁姢甯堬紝3骞村ぇ鍘傜粡楠屻€?, 'pet', 88.00, '/api/file/b6c049a9c65744a6a7dcd58e76cf9f65.jpg', 'u001', 5.0, 86, '0.8km', '娆?, '["鑷甫璁惧", "娓╁拰娌愭荡"]');

-- 鎻掑叆娴嬭瘯闂茬疆
INSERT INTO t_market_item (title, description, price, item_condition, image, images, seller_id, category, original_price, location, verified, free_shipping) VALUES
('寰烽緳 (De''Longhi) 鎰忓紡鍗婅嚜鍔ㄥ挅鍟℃満 - 95鎴愭柊', '鎴愯壊寰堝ソ锛岀敤浜嗕笉鍒板崐骞淬€?, 3200.00, '95鎴愭柊', '/api/file/44dc84a59ccd486b9b0a383c556c9d9b.jpg', '["/api/file/44dc84a59ccd486b9b0a383c556c9d9b.jpg"]', 'u002', 'market', 5480.00, '娴︿笢鏂板尯', 1, 1),
('Nintendo Switch 鏃ョ増钃濈孩 - 甯﹀仴韬幆', '鍚冪伆鍗婂勾锛屽叏濂楀寘瑁呴綈鍏ㄣ€?, 1800.00, '99鏂?, '/api/file/d0f83c5066454d7c958a3fb0e954c5a2.jpg', '["/api/file/d0f83c5066454d7c958a3fb0e954c5a2.jpg"]', 'u003', 'market', 2400.00, '寰愭眹鍖?, 1, 1);


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

-- 添加个人资料与通知设置字段
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


-- ================================================
-- Admin RBAC compatibility patch
-- ================================================

CREATE TABLE IF NOT EXISTS t_admin_permission (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(100) NOT NULL,
    category VARCHAR(100) DEFAULT '',
    description VARCHAR(255) DEFAULT '',
    status VARCHAR(20) DEFAULT 'active',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_permission_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='admin permission table';

CREATE TABLE IF NOT EXISTS t_admin_menu (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='admin menu table';

CREATE TABLE IF NOT EXISTS t_admin_role (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='admin role table';

INSERT INTO t_user (id, name, email, password, avatar, tag, is_verified, followers_count, following_count, admin_role)
VALUES ('admin_manager', 'manager', 'manager@example.com', 'manager', '', 'admin', 1, 0, 0, 'ADMIN')
ON DUPLICATE KEY UPDATE admin_role = VALUES(admin_role), password = VALUES(password);

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
('perm-logs-retention', '日志清理', 'logs:retention', '系统安全', '执行日志保留策略', 'active')
ON DUPLICATE KEY UPDATE
name = VALUES(name),
category = VALUES(category),
description = VALUES(description),
status = VALUES(status);

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
('menu-op-logs', 'dir-logs', '操作日志', '/admin/op-logs', 'receipt_long', 52, 'active', 'menu', 'logs:operation')
ON DUPLICATE KEY UPDATE
parent_id = VALUES(parent_id),
name = VALUES(name),
path = VALUES(path),
icon = VALUES(icon),
sort_order = VALUES(sort_order),
status = VALUES(status),
type = VALUES(type),
permission_code = VALUES(permission_code);

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
 '["user:view","user:ban","user:verify","user:role","blacklist:view","blacklist:edit","posts:view","posts:audit","comments:view","comments:manage","messages:view","messages:manage","images:view","images:audit","goods:view","goods:audit","services:view","services:manage","orders:view","orders:cancel","notifications:view","notifications:create","categories:view","categories:edit","menus:view","roles:view","roles:manage","permissions:view","logs:login","logs:operation","logs:retention"]')
ON DUPLICATE KEY UPDATE
name = VALUES(name),
description = VALUES(description),
status = VALUES(status),
menu_ids = VALUES(menu_ids),
permission_codes = VALUES(permission_codes);
