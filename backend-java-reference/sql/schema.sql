-- 数据库初始化脚本 (MySQL 8.0)
-- 字符集推荐使用 mb4 以支持 Emoji 表情

CREATE DATABASE IF NOT EXISTS neighborhood_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE neighborhood_db;

-- 1. 用户表
CREATE TABLE `t_user` (
  `id` varchar(64) NOT NULL COMMENT '用户ID',
  `name` varchar(100) NOT NULL COMMENT '用户名',
  `email` varchar(255) DEFAULT NULL COMMENT '邮箱',
  `avatar` varchar(500) DEFAULT NULL COMMENT '头像URL',
  `tag` varchar(50) DEFAULT NULL COMMENT '标签',
  `is_verified` tinyint(1) DEFAULT '0' COMMENT '是否认证',
  `latitude` double DEFAULT NULL COMMENT '用户纬度',
  `longitude` double DEFAULT NULL COMMENT '用户经度',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户基本信息表';

-- 2. 动态表
CREATE TABLE `t_news` (
  `id` bigint NOT NULL COMMENT '主键ID',
  `author_id` varchar(64) NOT NULL COMMENT '作者ID',
  `content` text NOT NULL COMMENT '动态内容',
  `location` varchar(255) DEFAULT NULL COMMENT '地点',
  `likes` int DEFAULT '0' COMMENT '点赞数',
  `comments_count` int DEFAULT '0' COMMENT '评论数',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='社区动态表';

-- 3. 闲置交易表
CREATE TABLE `t_market_item` (
  `id` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `condition` varchar(50) DEFAULT NULL COMMENT '成色',
  `image` varchar(500) DEFAULT NULL,
  `seller_id` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='闲置宝贝表';

-- 4. 服务表
CREATE TABLE `t_service` (
  `id` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `seller_id` varchar(64) DEFAULT NULL,
  `latitude` double DEFAULT NULL COMMENT '服务位置纬度',
  `longitude` double DEFAULT NULL COMMENT '服务位置经度',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生活服务表';

-- 5. 收藏表
CREATE TABLE `t_favorite` (
  `id` bigint NOT NULL COMMENT '主键ID',
  `user_id` varchar(64) NOT NULL COMMENT '用户ID',
  `target_type` varchar(20) NOT NULL COMMENT '类型：news/market/service',
  `target_id` bigint NOT NULL COMMENT '目标ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_target` (`user_id`, `target_type`, `target_id`),
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

-- 6. 评价点赞表
CREATE TABLE IF NOT EXISTS `t_review_like` (
  `id` bigint NOT NULL COMMENT '主键ID',
  `review_id` bigint NOT NULL COMMENT '评价ID',
  `user_id` varchar(64) NOT NULL COMMENT '用户ID',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_review_user` (`review_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评价点赞表';

-- 7. 服务评价表
CREATE TABLE IF NOT EXISTS `t_service_review` (
  `id` bigint NOT NULL COMMENT '主键ID',
  `service_id` bigint NOT NULL COMMENT '服务ID',
  `user_id` varchar(64) NOT NULL COMMENT '用户ID',
  `user_name` varchar(100) NOT NULL COMMENT '用户名',
  `user_avatar` varchar(500) DEFAULT NULL COMMENT '用户头像',
  `rating` int NOT NULL COMMENT '评分1-5',
  `content` text NOT NULL COMMENT '评价内容',
  `likes` int DEFAULT '0' COMMENT '点赞数',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_service_id` (`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务评价表';
