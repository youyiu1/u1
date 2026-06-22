-- ================================================
-- 鍚屽煄鐢熸椿绀惧尯骞冲彴 - 鏁版嵁搴撳垵濮嬪寲鑴氭湰
-- MySQL 8.0+
-- 璐﹀彿: root / root
-- 鏁版嵁搴? neighborhood_db
-- ================================================

CREATE DATABASE IF NOT EXISTS neighborhood_db
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
    admin_role VARCHAR(32) DEFAULT 'USER' COMMENT '鍚庡彴瑙掕壊: USER/READONLY_ADMIN/ADMIN/SUPER_ADMIN',
    avatar VARCHAR(255) DEFAULT '' COMMENT '澶村儚URL',
    tag VARCHAR(50) DEFAULT '' COMMENT '鏍囩',
    bio VARCHAR(255) DEFAULT '' COMMENT '涓汉绠€浠?,
    is_verified TINYINT(1) DEFAULT 0 COMMENT '鏄惁璁よ瘉',
    followers_count INT DEFAULT 0 COMMENT '绮変笣鏁?,
    following_count INT DEFAULT 0 COMMENT '鍏虫敞鏁?,
    rating DOUBLE DEFAULT 0 COMMENT '璇勫垎',
    sold_count INT DEFAULT 0 COMMENT '鎴愪氦鏁?,
    phone VARCHAR(32) DEFAULT '' COMMENT '鎵嬫満鍙?,
    region VARCHAR(100) DEFAULT '' COMMENT '鍦板尯',
    status VARCHAR(20) DEFAULT 'normal' COMMENT '鐢ㄦ埛鐘舵€?,
    profile_visible VARCHAR(20) DEFAULT 'public' COMMENT '璧勬枡鍙鑼冨洿',
    posts_visible VARCHAR(20) DEFAULT 'public' COMMENT '鍔ㄦ€佸彲瑙佽寖鍥?,
    show_location TINYINT(1) DEFAULT 1 COMMENT '鏄惁灞曠ず浣嶇疆',
    push_enabled TINYINT(1) DEFAULT 1 COMMENT '鏄惁寮€鍚帹閫?,
    message_notify TINYINT(1) DEFAULT 1 COMMENT '娑堟伅閫氱煡',
    follow_notify TINYINT(1) DEFAULT 1 COMMENT '鍏虫敞閫氱煡',
    like_notify TINYINT(1) DEFAULT 1 COMMENT '鐐硅禐閫氱煡',
    comment_notify TINYINT(1) DEFAULT 1 COMMENT '璇勮閫氱煡',
    system_notify TINYINT(1) DEFAULT 0 COMMENT '绯荤粺閫氱煡',
    latitude DOUBLE DEFAULT NULL COMMENT '绾害',
    longitude DOUBLE DEFAULT NULL COMMENT '缁忓害',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    UNIQUE KEY uk_user_name (name),
    INDEX idx_admin_role (admin_role)
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
    category VARCHAR(50) DEFAULT '鐢熸椿璁板綍' COMMENT '鍒嗙被',
    likes INT DEFAULT 0 COMMENT '鐐硅禐鏁?,
    comments_count INT DEFAULT 0 COMMENT '璇勮鏁?,
    images JSON COMMENT '鍥剧墖鍒楄〃(JSON)',
    status VARCHAR(20) DEFAULT 'approved' COMMENT '鍐呭鐘舵€?,
    reject_reason VARCHAR(255) DEFAULT '' COMMENT '椹冲洖鍘熷洜',
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
    news_id BIGINT NOT NULL COMMENT '鍔ㄦ€両D',
    parent_id BIGINT DEFAULT 0 COMMENT '鐖惰瘎璁篒D',
    user_id VARCHAR(64) NOT NULL COMMENT '鐢ㄦ埛ID',
    user_name VARCHAR(50) NOT NULL COMMENT '鐢ㄦ埛鍚?,
    user_avatar VARCHAR(255) DEFAULT '' COMMENT '鐢ㄦ埛澶村儚',
    content TEXT NOT NULL COMMENT '璇勮鍐呭',
    likes INT DEFAULT 0 COMMENT '鐐硅禐鏁?,
    status VARCHAR(20) DEFAULT 'normal' COMMENT '鐘舵€?,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_news_id (news_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_user_id (user_id),
    INDEX idx_news_create (news_id, create_time DESC),
    INDEX idx_comment_news_status_time (news_id, status, create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='璇勮琛?;

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

-- ================================================
-- 闂茬疆鍟嗗搧琛?-- ================================================
DROP TABLE IF EXISTS t_market_item;
CREATE TABLE t_market_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '鍟嗗搧ID',
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
    status VARCHAR(20) DEFAULT 'active' COMMENT '鐘舵€?,
    reject_reason VARCHAR(255) DEFAULT '' COMMENT '椹冲洖鍘熷洜',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_seller (seller_id),
    INDEX idx_category (category),
    INDEX idx_create_time (created_at DESC),
    INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='闂茬疆鍟嗗搧琛?;

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
    status VARCHAR(20) DEFAULT 'active' COMMENT '鐘舵€?,
    reject_reason VARCHAR(255) DEFAULT '' COMMENT '椹冲洖鍘熷洜',
    area VARCHAR(100) DEFAULT '' COMMENT '鏈嶅姟鍖哄煙',
    phone VARCHAR(32) DEFAULT '' COMMENT '鑱旂郴鐢佃瘽',
    latitude DOUBLE DEFAULT NULL COMMENT '绾害',
    longitude DOUBLE DEFAULT NULL COMMENT '缁忓害',
    images JSON COMMENT '鍥剧墖鍒楄〃(JSON)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_seller (seller_id),
    INDEX idx_category (category),
    INDEX idx_rating (rating DESC),
    INDEX idx_create_time (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鐢熸椿鏈嶅姟琛?;

-- ================================================
-- 鏈嶅姟璇勪环琛?-- ================================================
CREATE TABLE IF NOT EXISTS t_service_review (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '璇勪环ID',
    service_id BIGINT NOT NULL COMMENT '鏈嶅姟ID',
    user_id VARCHAR(64) NOT NULL COMMENT '鐢ㄦ埛ID',
    user_name VARCHAR(50) NOT NULL COMMENT '鐢ㄦ埛鍚?,
    user_avatar VARCHAR(255) DEFAULT '' COMMENT '鐢ㄦ埛澶村儚',
    rating INT NOT NULL COMMENT '璇勫垎',
    content TEXT NOT NULL COMMENT '璇勪环鍐呭',
    likes INT DEFAULT 0 COMMENT '鐐硅禐鏁?,
    status VARCHAR(20) DEFAULT 'normal' COMMENT '鐘舵€?,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_service_id (service_id),
    INDEX idx_service_review_status_time (service_id, status, create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='鏈嶅姟璇勪环琛?;

-- ================================================
-- 棰勭害琛?-- ================================================
DROP TABLE IF EXISTS t_booking;
CREATE TABLE t_booking (
    id BIGINT PRIMARY KEY COMMENT '棰勭害ID',
    service_id BIGINT NOT NULL COMMENT '鏈嶅姟ID',
    buyer_id VARCHAR(64) NOT NULL COMMENT '涔板ID',
    seller_id VARCHAR(64) NOT NULL COMMENT '鍗栧ID',
    booking_date DATETIME NOT NULL COMMENT '棰勭害鏃ユ湡',
    booking_time VARCHAR(50) NOT NULL COMMENT '棰勭害鏃堕棿',
    duration INT DEFAULT 1 COMMENT '鏈嶅姟鏃堕暱(灏忔椂)',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '鐘舵€? pending confirmed completed cancelled',
    notification_id BIGINT DEFAULT NULL COMMENT '鍏宠仈閫氱煡ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_service_id (service_id),
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_booking_buyer_status_time (buyer_id, status, create_time),
    INDEX idx_booking_seller_status_time (seller_id, status, create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='棰勭害琛?;

-- ================================================
-- 娑堟伅琛?-- ================================================
DROP TABLE IF EXISTS t_message;
CREATE TABLE t_message (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '娑堟伅ID',
    sender_id VARCHAR(64) NOT NULL COMMENT '鍙戦€佽€匢D',
    receiver_id VARCHAR(64) NOT NULL COMMENT '鎺ユ敹鑰匢D',
    content TEXT NOT NULL COMMENT '娑堟伅鍐呭',
    message_type VARCHAR(20) DEFAULT 'text' COMMENT '娑堟伅绫诲瀷(text/image)',
    media_url VARCHAR(500) DEFAULT '' COMMENT '濯掍綋鍦板潃',
    is_read TINYINT(1) DEFAULT 0 COMMENT '鏄惁宸茶',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_conversation (sender_id, receiver_id),
    INDEX idx_create_time (create_time DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='娑堟伅琛?;

-- ================================================
-- 閫氱煡琛?-- ================================================
DROP TABLE IF EXISTS t_notification;
CREATE TABLE t_notification (
    id BIGINT PRIMARY KEY COMMENT '通知ID',
    user_id VARCHAR(64) NOT NULL COMMENT '接收用户ID',
    title VARCHAR(200) NOT NULL COMMENT '标题',
    content TEXT NOT NULL COMMENT '内容',
    service_name VARCHAR(200) DEFAULT '' COMMENT '服务或商品名称',
    time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '通知时间',
    is_read TINYINT(1) DEFAULT 0 COMMENT '是否已读',
    is_processed TINYINT(1) DEFAULT 0 COMMENT '是否已处理',
    order_id BIGINT DEFAULT NULL COMMENT '关联订单ID',
    related_booking_id BIGINT DEFAULT NULL COMMENT '关联预约ID',
    related_user_id VARCHAR(64) DEFAULT NULL COMMENT '关联用户ID',
    related_market_item_id BIGINT DEFAULT NULL COMMENT '关联闲置商品ID',
    INDEX idx_notify_user_time (user_id, time),
    INDEX idx_notify_booking (related_booking_id),
    INDEX idx_notify_order (order_id),
    INDEX idx_notify_related_user (related_user_id),
    INDEX idx_notify_market_item (related_market_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知表';

-- ================================================
-- 璁㈠崟琛?-- ================================================
DROP TABLE IF EXISTS t_order;
CREATE TABLE t_order (
    id BIGINT PRIMARY KEY COMMENT '璁㈠崟ID',
    booking_id BIGINT DEFAULT NULL COMMENT '鍏宠仈棰勭害ID',
    buyer_id VARCHAR(64) NOT NULL COMMENT '涔板ID',
    seller_id VARCHAR(64) NOT NULL COMMENT '鍗栧ID',
    service_id BIGINT DEFAULT NULL COMMENT '鏈嶅姟ID',
    service_title VARCHAR(200) DEFAULT '' COMMENT '鏈嶅姟鏍囬',
    price DECIMAL(10,2) DEFAULT NULL COMMENT '浠锋牸',
    booking_date DATETIME DEFAULT NULL COMMENT '棰勭害鏃ユ湡',
    booking_time VARCHAR(50) DEFAULT NULL COMMENT '棰勭害鏃堕棿',
    duration INT DEFAULT 1 COMMENT '鏈嶅姟鏃堕暱(灏忔椂)',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '鐘舵€? pending confirmed in_progress completed cancelled',
    cancel_reason VARCHAR(255) DEFAULT '' COMMENT '鍙栨秷鍘熷洜',
    completed_time DATETIME DEFAULT NULL COMMENT '瀹屾垚鏃堕棿',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_service_id (service_id),
    INDEX idx_status_time (status, create_time DESC),
    INDEX idx_buyer_status_ctime (buyer_id, status, create_time),
    INDEX idx_seller_status_ctime (seller_id, status, create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='璁㈠崟琛?;

-- ================================================
-- 鍒嗙被琛?-- ================================================
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='鍒嗙被琛?;

-- ================================================
-- 绠＄悊绔粦鍚嶅崟琛?-- ================================================
DROP TABLE IF EXISTS t_admin_blacklist;
CREATE TABLE t_admin_blacklist (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    target_type VARCHAR(20) NOT NULL,
    target_value VARCHAR(255) NOT NULL,
    reason VARCHAR(255) DEFAULT '',
    creator VARCHAR(64) DEFAULT '',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_target (target_type, target_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='绠＄悊绔粦鍚嶅崟琛?;

-- ================================================
-- 绠＄悊绔搷浣滄棩蹇楄〃
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='绠＄悊绔搷浣滄棩蹇楄〃';

-- ================================================
-- 绠＄悊绔櫥褰曟棩蹇楄〃
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='绠＄悊绔櫥褰曟棩蹇楄〃';

-- ================================================
-- 绠＄悊绔浘鐗囩姸鎬佽〃
-- ================================================
DROP TABLE IF EXISTS t_admin_image_status;
CREATE TABLE t_admin_image_status (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    image_url VARCHAR(500) NOT NULL,
    status VARCHAR(20) DEFAULT 'approved',
    UNIQUE KEY uk_image_url (image_url)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='绠＄悊绔浘鐗囩姸鎬佽〃';

-- ================================================
-- 绠＄悊绔潈闄愯〃
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='绠＄悊绔潈闄愯〃';

-- ================================================
-- 绠＄悊绔彍鍗曡〃
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='绠＄悊绔彍鍗曡〃';

-- ================================================
-- 绠＄悊绔鑹茶〃
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='绠＄悊绔鑹茶〃';

-- ================================================
-- 璇勪环鐐硅禐琛?-- ================================================
DROP TABLE IF EXISTS t_review_like;
CREATE TABLE t_review_like (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '璇勪环鐐硅禐ID',
    review_id BIGINT NOT NULL COMMENT '璇勪环ID',
    user_id VARCHAR(64) NOT NULL COMMENT '鐢ㄦ埛ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_review_user (review_id, user_id),
    INDEX idx_review_id (review_id),
    INDEX idx_review_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='璇勪环鐐硅禐琛?;

-- ================================================
-- 鍒濆鍖栨祴璇曟暟鎹?-- ================================================
INSERT INTO t_user (id, name, email, password, avatar, tag, bio, is_verified, followers_count, following_count, rating, sold_count, admin_role) VALUES
('u001', '鏉庨樋濮?, 'li_ayi@example.com', '123456', '/api/file/931f8e1a2d834e03a288800df5a7e6ec.jpg', '绀惧尯杈句汉', '', 1, 3420, 156, 4.8, 36, 'USER'),
('u002', '鐜嬪ぇ鍘?, 'wang_dachu@example.com', '123456', '/api/file/37dc56e3f2b541b79d98e82c4abd371a.jpg', '缇庨杈句汉', '', 1, 1241, 320, 4.5, 89, 'USER'),
('u003', '灏忔灄', 'photo_xiaolin@example.com', '123456', '/api/file/64edb6bef14c4c1b8bd23ffe817e54a5.jpg', '鎽勫奖杈句汉', '', 0, 850, 412, 4.6, 18, 'USER'),
('admin_test', 'test', 'test@example.com', 'test', '', 'admin', '', 1, 0, 0, 0, 0, 'SUPER_ADMIN'),
('admin_readonly', 'test1', 'test1@example.com', '123456', '', 'admin', '', 1, 0, 0, 0, 0, 'READONLY_ADMIN'),
('admin_manager', 'manager', 'manager@example.com', 'manager', '', 'admin', '', 1, 0, 0, 0, 0, 'ADMIN'),
('normal_user', 'normal', 'normal@example.com', 'normal', '', 'user', '', 0, 0, 0, 0, 0, 'USER');

INSERT INTO t_news (author_id, title, content, location, category, likes, comments_count, images, shares, collections) VALUES
('u001', '鑺卞簵鎺ㄨ崘', '浠婂ぉ鍦ㄥ皬鍖洪棬鍙ｅ彂鐜颁簡涓€瀹舵柊寮€鐨勮姳搴楋紝鍝佺寰堥綈鍏紝鑰佹澘浜轰篃鐗瑰埆濂斤紝鎺ㄨ崘缁欏ぇ瀹躲€?, '閲戝湴鏍兼灄涓栫晫', '鍚屽煄鍙戠幇', 24, 6, '["/api/file/c2675e0851d940799368c483682ddf3d.jpg"]', 2, 5),
('u002', '甯繖鐣欐剰璧板け鏌熀', '鏈変汉鍦ㄥ叕鍥湅鍒颁竴鍙蛋澶辩殑鏌熀鍚楋紵閭诲眳瀹剁殑鐙楄窇涓簡锛屽ぇ瀹跺府蹇欑暀鎰忎竴涓嬶紝鑳岄儴鏈変竴鍧楁繁鑹茶姳绾广€?, '婊ㄦ睙鍏洯', '閭婚噷浜掑姪', 86, 15, '[]', 12, 8);

INSERT INTO t_service (title, description, category, price, image, seller_id, rating, reviews, distance, unit, highlights, status, area, phone, images) VALUES
('涓撲笟瀹跺涵淇濇磥 - 鍏ㄥ眿娣卞害闄ゅ皹闄よ灗', '鎻愪緵鍏ㄥ眿娣卞害淇濇磥銆佸帹鎴块噸娌规薄娓呮磥銆佸崼鐢熼棿闄ゅ灑鍜岄珮娓╂秷姣掓湇鍔°€?, 'domestic', 150.00, '/api/file/b6c049a9c65744a6a7dcd58e76cf9f65.jpg', 'u001', 4.81, 128, '1.2km', '娆?, '["4灏忔椂", "鑷宸ュ叿", "鐜繚鑽墏"]', 'active', '娴︿笢鏂板尯', '13800000001', '["/api/file/b6c049a9c65744a6a7dcd58e76cf9f65.jpg"]'),
('涓婇棬瀹犵墿娲楁姢 - 鐙楃嫍SPA涓庢繁搴︽竻娲?, '涓撲笟瀹犵墿娲楁姢甯堜笂闂ㄦ湇鍔★紝娓╁拰娲楁姢锛岄€傚悎鏃ュ父娓呮磥涓庢姢鐞嗐€?, 'pet', 88.00, '/api/file/b6c049a9c65744a6a7dcd58e76cf9f65.jpg', 'u001', 5.0, 86, '0.8km', '娆?, '["鑷甫璁惧", "娓╁拰娌愭荡"]', 'active', '寰愭眹鍖?, '13800000002', '["/api/file/b6c049a9c65744a6a7dcd58e76cf9f65.jpg"]'),
('Test Service', 'desc', '', 100.00, '/api/file/images/2026/05/25da6aa966dabf41deb7bb9f78295bb04c.jpg', 'u002', 0.0, 0, '', '', NULL, 'active', '', '', '["/api/file/images/2026/05/25da6aa966dabf41deb7bb9f78295bb04c.jpg"]');

INSERT INTO t_market_item (title, description, price, item_condition, image, images, seller_id, category, original_price, location, verified, free_shipping, status) VALUES
('寰烽緳 (De''Longhi) 鎰忓紡鍗婅嚜鍔ㄥ挅鍟℃満 - 95鎴愭柊', '鎴愯壊寰堝ソ锛屼娇鐢ㄦ椂闂翠笉闀匡紝鍔熻兘姝ｅ父锛岄厤浠堕綈鍏ㄣ€?, 3200.00, '95鎴愭柊', '/api/file/44dc84a59ccd486b9b0a383c556c9d9b.jpg', '["/api/file/44dc84a59ccd486b9b0a383c556c9d9b.jpg"]', 'u002', 'home', 5480.00, '娴︿笢鏂板尯', 1, 1, 'active'),
('Nintendo Switch 鏃ョ増绾㈣摑 - 甯﹀仴韬幆', '闂茬疆鍗婂勾锛屾暣鏈轰繚瀛樿壇濂斤紝鍖呰鍜岄厤浠堕綈鍏ㄣ€?, 1800.00, '99鏂?, '/api/file/d0f83c5066454d7c958a3fb0e954c5a2.jpg', '["/api/file/d0f83c5066454d7c958a3fb0e954c5a2.jpg"]', 'u003', 'tech', 2400.00, '寰愭眷鍖?, 1, 1, 'active');

INSERT INTO t_category (name, icon, type, status, sort_order) VALUES
('鐢熸椿鏈嶅姟', 'category', 'service', 'normal', 10),
('闂茬疆鍟嗗搧', 'category', 'goods', 'normal', 20),
('鍔ㄦ€佸唴瀹?, 'category', 'dynamic', 'normal', 30);

INSERT INTO t_admin_permission (id, name, code, category, description, status) VALUES
('perm-user-view', '鐢ㄦ埛鍒楄〃鏌ョ湅', 'user:view', '鐢ㄦ埛椋庢帶', '鏌ョ湅鐢ㄦ埛鍒楄〃鍜屽熀纭€璧勬枡', 'active'),
('perm-user-ban', '鐢ㄦ埛鐘舵€佺鐞?, 'user:ban', '鐢ㄦ埛椋庢帶', '绂佺敤鎴栨仮澶嶇敤鎴?, 'active'),
('perm-user-verify', '鐢ㄦ埛璁よ瘉绠＄悊', 'user:verify', '鐢ㄦ埛椋庢帶', '璋冩暣鐢ㄦ埛璁よ瘉鐘舵€?, 'active'),
('perm-user-role', '鐢ㄦ埛瑙掕壊鍒嗛厤', 'user:role', '鐢ㄦ埛椋庢帶', '鍒嗛厤鍚庡彴瑙掕壊', 'active'),
('perm-blacklist-view', '榛戝悕鍗曟煡鐪?, 'blacklist:view', '鐢ㄦ埛椋庢帶', '鏌ョ湅椋庢帶榛戝悕鍗?, 'active'),
('perm-blacklist-edit', '榛戝悕鍗曠淮鎶?, 'blacklist:edit', '鐢ㄦ埛椋庢帶', '鏂板鎴栧垹闄ら粦鍚嶅崟', 'active'),
('perm-posts-view', '鍔ㄦ€佹煡鐪?, 'posts:view', '鍐呭杩愯惀', '鏌ョ湅鍔ㄦ€佺鐞嗗垪琛?, 'active'),
('perm-posts-audit', '鍔ㄦ€佸鏍?, 'posts:audit', '鍐呭杩愯惀', '瀹℃牳鍜屽缃姩鎬佸唴瀹?, 'active'),
('perm-comments-view', '璇勮鏌ョ湅', 'comments:view', '鍐呭杩愯惀', '鏌ョ湅璇勮鍐呭', 'active'),
('perm-comments-manage', '璇勮娌荤悊', 'comments:manage', '鍐呭杩愯惀', '闅愯棌銆佸垹闄ゅ拰骞查璇勮', 'active'),
('perm-messages-view', '娑堟伅鏌ョ湅', 'messages:view', '鍐呭杩愯惀', '鏌ョ湅绉佷俊娑堟伅', 'active'),
('perm-messages-manage', '娑堟伅娌荤悊', 'messages:manage', '鍐呭杩愯惀', '鏍囪宸茶鍜屽垹闄ゆ秷鎭?, 'active'),
('perm-images-view', '鍥剧墖鏌ョ湅', 'images:view', '鍐呭杩愯惀', '鏌ョ湅鍥剧墖璧勬簮', 'active'),
('perm-images-audit', '鍥剧墖瀹℃牳', 'images:audit', '鍐呭杩愯惀', '瀹℃牳鍜屽垹闄ゅ浘鐗?, 'active'),
('perm-goods-view', '鍟嗗搧鏌ョ湅', 'goods:view', '鐢熸椿鏈嶅姟', '鏌ョ湅闂茬疆鍟嗗搧', 'active'),
('perm-goods-audit', '鍟嗗搧瀹℃牳', 'goods:audit', '鐢熸椿鏈嶅姟', '涓婃灦銆佷笅鏋跺拰鏍囪鍟嗗搧', 'active'),
('perm-services-view', '鏈嶅姟鏌ョ湅', 'services:view', '鐢熸椿鏈嶅姟', '鏌ョ湅鐢熸椿鏈嶅姟', 'active'),
('perm-services-manage', '鏈嶅姟绠＄悊', 'services:manage', '鐢熸椿鏈嶅姟', '鏂板銆佷笂鏋跺拰涓嬫灦鏈嶅姟', 'active'),
('perm-orders-view', '璁㈠崟鏌ョ湅', 'orders:view', '鐢熸椿鏈嶅姟', '鏌ョ湅璁㈠崟鍒楄〃鍜岃鎯?, 'active'),
('perm-orders-cancel', '璁㈠崟鍏抽棴', 'orders:cancel', '鐢熸椿鏈嶅姟', '寮哄埗鍏抽棴璁㈠崟', 'active'),
('perm-notifications-view', '閫氱煡鏌ョ湅', 'notifications:view', '绯荤粺璁剧疆', '鏌ョ湅閫氱煡鍒楄〃', 'active'),
('perm-notifications-create', '閫氱煡鍙戝竷', 'notifications:create', '绯荤粺璁剧疆', '鍒涘缓鍜屽彂閫侀€氱煡', 'active'),
('perm-categories-view', '鍒嗙被鏌ョ湅', 'categories:view', '绯荤粺璁剧疆', '鏌ョ湅鍒嗙被閰嶇疆', 'active'),
('perm-categories-edit', '鍒嗙被缁存姢', 'categories:edit', '绯荤粺璁剧疆', '鏂板鍜屽惎鍋滃垎绫?, 'active'),
('perm-menus-view', '鑿滃崟鏌ョ湅', 'menus:view', '绯荤粺璁剧疆', '鏌ョ湅鑿滃崟閰嶇疆', 'active'),
('perm-roles-view', '瑙掕壊鏌ョ湅', 'roles:view', '绯荤粺璁剧疆', '鏌ョ湅瑙掕壊閰嶇疆', 'active'),
('perm-roles-manage', '瑙掕壊绠＄悊', 'roles:manage', '绯荤粺璁剧疆', '淇敼瑙掕壊鑿滃崟鍜屾潈闄?, 'active'),
('perm-permissions-view', '鏉冮檺鏌ョ湅', 'permissions:view', '绯荤粺璁剧疆', '鏌ョ湅绯荤粺鏉冮檺娓呭崟', 'active'),
('perm-logs-login', '鐧诲綍鏃ュ織鏌ョ湅', 'logs:login', '绯荤粺瀹夊叏', '鏌ョ湅鐧诲綍鏃ュ織', 'active'),
('perm-logs-operation', '鎿嶄綔鏃ュ織鏌ョ湅', 'logs:operation', '绯荤粺瀹夊叏', '鏌ョ湅鎿嶄綔鏃ュ織', 'active'),
('perm-logs-retention', '鏃ュ織娓呯悊', 'logs:retention', '绯荤粺瀹夊叏', '鎵ц鏃ュ織淇濈暀绛栫暐', 'active');

INSERT INTO t_admin_menu (id, parent_id, name, path, icon, sort_order, status, type, permission_code) VALUES
('dir-users', NULL, '鐢ㄦ埛椋庢帶', '', 'admin_panel_settings', 10, 'active', 'directory', NULL),
('menu-users', 'dir-users', '鐢ㄦ埛绠＄悊', '/admin/users', 'group', 11, 'active', 'menu', 'user:view'),
('menu-blacklist', 'dir-users', '椋庢帶榛戝悕鍗?, '/admin/blacklist', 'gavel', 12, 'active', 'menu', 'blacklist:view'),
('dir-content', NULL, '鍐呭杩愯惀', '', 'forum', 20, 'active', 'directory', NULL),
('menu-posts', 'dir-content', '鍔ㄦ€佺鐞?, '/admin/posts', 'explore', 21, 'active', 'menu', 'posts:view'),
('menu-comments', 'dir-content', '璇勮绠＄悊', '/admin/comments', 'chat_bubble', 22, 'active', 'menu', 'comments:view'),
('menu-messages', 'dir-content', '娑堟伅绠＄悊', '/admin/messages', 'forum', 23, 'active', 'menu', 'messages:view'),
('menu-images', 'dir-content', '鍥剧墖绠＄悊', '/admin/images', 'photo_library', 24, 'active', 'menu', 'images:view'),
('dir-services', NULL, '鐢熸椿鏈嶅姟', '', 'storefront', 30, 'active', 'directory', NULL),
('menu-market', 'dir-services', '闂茬疆鍟嗗搧绠＄悊', '/admin/market', 'shopping_bag', 31, 'active', 'menu', 'goods:view'),
('menu-services', 'dir-services', '鏈嶅姟绠＄悊', '/admin/services', 'home_repair_service', 32, 'active', 'menu', 'services:view'),
('menu-orders', 'dir-services', '璁㈠崟绠＄悊', '/admin/orders', 'receipt_long', 33, 'active', 'menu', 'orders:view'),
('dir-system', NULL, '绯荤粺璁剧疆', '', 'settings_suggest', 40, 'active', 'directory', NULL),
('menu-notifications', 'dir-system', '閫氱煡绠＄悊', '/admin/notifications', 'campaign', 41, 'active', 'menu', 'notifications:view'),
('menu-categories', 'dir-system', '鍒嗙被绠＄悊', '/admin/categories', 'category', 42, 'active', 'menu', 'categories:view'),
('menu-menus', 'dir-system', '鑿滃崟绠＄悊', '/admin/menus', 'menu', 43, 'active', 'menu', 'menus:view'),
('menu-roles', 'dir-system', '瑙掕壊绠＄悊', '/admin/roles', 'badge', 44, 'active', 'menu', 'roles:view'),
('menu-permissions', 'dir-system', '鏉冮檺绠＄悊', '/admin/permissions', 'key', 45, 'active', 'menu', 'permissions:view'),
('dir-logs', NULL, '绯荤粺瀹夊叏', '', 'security', 50, 'active', 'directory', NULL),
('menu-login-logs', 'dir-logs', '鐧诲綍鏃ュ織', '/admin/login-logs', 'fingerprint', 51, 'active', 'menu', 'logs:login'),
('menu-op-logs', 'dir-logs', '鎿嶄綔鏃ュ織', '/admin/op-logs', 'receipt_long', 52, 'active', 'menu', 'logs:operation');

INSERT INTO t_admin_role (id, name, code, description, status, is_system, menu_ids, permission_codes) VALUES
('role-user', '鏅€氱敤鎴?, 'USER', '鍓嶅彴鏅€氱敤鎴凤紝涓嶅彲杩涘叆绠＄悊绔?, 'active', 1, '[]', '[]'),
('role-readonly', '鍙绠＄悊鍛?, 'READONLY_ADMIN', '鍙煡鐪嬪悗鍙版暟鎹紝涓嶅彲鎵ц鍐欐搷浣?, 'active', 1,
 '["dir-users","menu-users","menu-blacklist","dir-content","menu-posts","menu-comments","menu-messages","menu-images","dir-services","menu-market","menu-services","menu-orders","dir-system","menu-notifications","menu-categories","menu-menus","menu-roles","menu-permissions","dir-logs","menu-login-logs","menu-op-logs"]',
 '["user:view","blacklist:view","posts:view","comments:view","messages:view","images:view","goods:view","services:view","orders:view","notifications:view","categories:view","menus:view","roles:view","permissions:view","logs:login","logs:operation"]'),
('role-admin', '绠＄悊鍛?, 'ADMIN', '璐熻矗鏃ュ父瀹℃牳涓庤繍钀ワ紝涓嶅彲璋冩暣瑙掕壊鍜屾潈闄?, 'active', 1,
 '["dir-users","menu-users","menu-blacklist","dir-content","menu-posts","menu-comments","menu-messages","menu-images","dir-services","menu-market","menu-services","menu-orders","dir-system","menu-notifications","menu-categories","menu-menus","menu-roles","menu-permissions","dir-logs","menu-login-logs","menu-op-logs"]',
 '["user:view","user:ban","user:verify","blacklist:view","blacklist:edit","posts:view","posts:audit","comments:view","comments:manage","messages:view","messages:manage","images:view","images:audit","goods:view","goods:audit","services:view","services:manage","orders:view","orders:cancel","notifications:view","notifications:create","categories:view","categories:edit","menus:view","roles:view","permissions:view","logs:login","logs:operation"]'),
('role-super', '瓒呯骇绠＄悊鍛?, 'SUPER_ADMIN', '鎷ユ湁绠＄悊绔叏閮ㄨ彍鍗曞拰鎿嶄綔鏉冮檺', 'active', 1,
 '["dir-users","menu-users","menu-blacklist","dir-content","menu-posts","menu-comments","menu-messages","menu-images","dir-services","menu-market","menu-services","menu-orders","dir-system","menu-notifications","menu-categories","menu-menus","menu-roles","menu-permissions","dir-logs","menu-login-logs","menu-op-logs"]',
 '["user:view","user:ban","user:verify","user:role","blacklist:view","blacklist:edit","posts:view","posts:audit","comments:view","comments:manage","messages:view","messages:manage","images:view","images:audit","goods:view","goods:audit","services:view","services:manage","orders:view","orders:cancel","notifications:view","notifications:create","categories:view","categories:edit","menus:view","roles:view","roles:manage","permissions:view","logs:login","logs:operation","logs:retention"]');
