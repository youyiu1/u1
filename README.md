<div align="center">

# 同城生活社区平台

现代化同城社区系统｜生活服务｜闲置交易｜同城动态｜即时沟通｜后台管理

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.11-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=111)
![Vite](https://img.shields.io/badge/Vite-6.2.3-646CFF?style=flat-square&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?style=flat-square&logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.8+-FF6600?style=flat-square&logo=rabbitmq&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)

[项目概述](#项目概述) · [项目亮点](#项目亮点) · [技术架构](#技术架构) · [项目结构](#项目结构) · [功能特性](#功能特性) · [快速开始](#快速开始) · [部署运维](#部署运维)

</div>

---

## 项目概述

**同城生活社区平台** 是一个面向本地生活场景的前后端分离项目，覆盖同城生活服务、闲置交易、社区动态、即时消息、订单预约、评价互动和后台治理。系统包含用户端与管理端两套前端入口，后端通过统一 REST API 提供业务能力，并结合 Redis、RabbitMQ、对象存储和监控组件完成缓存、异步消息、文件管理和运行观测。

---

## 项目亮点

- **生活服务**：支持服务分类浏览、详情查看、服务发布、预约留痕、评价反馈。
- **闲置交易**：支持闲置商品展示、详情页、发布商品、购买请求和卖家信息展示。
- **同城动态**：支持社区动态发布、评论、点赞、收藏和用户主页跳转。
- **即时沟通**：提供消息会话、通知中心、已读状态和直接联系能力。
- **账号安全**：JWT + Redis 登录态、图形验证码、邮箱验证码、登录限流、重置密码限流。
- **文件存储**：图片上传走后端统一代理，默认头像自动托管到 RustFS/S3。
- **后台治理**：管理用户、服务、闲置、订单、动态、评论、图片、通知、角色和权限。
- **性能优化**：Spring Cache + Caffeine 缓存热点数据，RabbitMQ 异步处理通知和管理日志。
- **部署完整**：提供 Docker Compose、Nginx、Prometheus、Grafana、RustFS、RabbitMQ 等部署配置。

---

## 技术架构

| 后端技术栈 | 说明 |
| --- | --- |
| Spring Boot 3.5.11 | 后端主框架 |
| Java 17 | 后端运行环境 |
| MyBatis-Plus 3.5.6 | ORM 与数据访问 |
| MySQL 8.0 | 主业务数据库 |
| Redis 7 | 登录态、验证码、缓存、限流 |
| Spring Cache + Caffeine | 本地缓存与业务缓存 |
| RabbitMQ | 异步通知、管理日志写入 |
| JWT + Redis | Token 签发与登录态双校验 |
| Spring Mail | 邮箱验证码发送 |
| S3 SDK + RustFS | 对象存储与图片访问 |
| Actuator + Micrometer | 应用指标暴露 |
| Prometheus + Grafana | 监控采集与可视化 |

| 前端技术栈 | 说明 |
| --- | --- |
| React 19 | 用户端与管理端 UI |
| Vite 6.2.3 | 前端构建工具 |
| TypeScript 5.8 | 类型约束 |
| Tailwind CSS v4 | 样式系统 |
| React Router v7 | 路由管理 |
| Motion / Framer Motion | 页面与角色动画 |
| Lucide React | 图标库 |
| Recharts | 管理端图表 |
| Leaflet | 地图与位置选择 |

---

## 系统架构

```text
┌─────────────────────────────────────────────┐
│                  客户端层                    │
│  用户端 React + Vite   │   管理端 React + Vite │
└───────────────────────┬─────────────────────┘
                        │
┌───────────────────────▼─────────────────────┐
│                  网关层                      │
│        Nginx / HTTPS / 静态资源 / 反向代理     │
└───────────────────────┬─────────────────────┘
                        │
┌───────────────────────▼─────────────────────┐
│                  服务层                      │
│ Spring Boot REST API / JWT / 缓存 / 消息投递 │
└──────────────┬────────┬────────┬────────────┘
               │        │        │
        ┌──────▼───┐ ┌──▼───┐ ┌──▼────────┐
        │ MySQL    │ │Redis │ │ RabbitMQ  │
        │ 业务数据 │ │缓存  │ │ 异步消息  │
        └──────────┘ └──────┘ └───────────┘
               │
        ┌──────▼──────────────────────────────┐
        │ RustFS/S3 文件存储 + Prometheus/Grafana │
        └─────────────────────────────────────┘
```

---

## 项目结构

```text
neighborhood/
├─ backend-java-reference/                         # 后端 Spring Boot 项目
│  ├─ Dockerfile                                   # 后端镜像构建文件
│  ├─ pom.xml                                      # Maven 依赖配置
│  ├─ application-secret.example.yml               # 私有配置示例
│  ├─ sql/                                         # 数据库脚本
│  │  ├─ init.sql                                  # 初始化 SQL
│  │  ├─ schema.sql                                # 基础结构 SQL
│  │  ├─ performance_indexes.sql                   # 性能索引脚本
│  │  ├─ booking_order_notification_migration.sql  # 预约订单通知迁移
│  │  └─ update_booking_order.sql                  # 订单字段更新脚本
│  └─ src/main/java/com/neighborhood/app/
│     ├─ common/                                   # 统一响应、全局异常
│     ├─ config/                                   # Redis、RabbitMQ、S3、缓存、监控配置
│     ├─ controller/                               # 用户端与管理端 REST 接口
│     │  ├─ client/                                # 用户端接口
│     │  └─ admin/                                 # 管理端接口
│     ├─ dto/                                      # 请求 DTO
│     ├─ entity/                                   # 数据库实体
│     ├─ mapper/                                   # MyBatis-Plus Mapper
│     ├─ messaging/                                # RabbitMQ 消息模型与监听器
│     ├─ service/                                  # 业务服务接口
│     │  └─ impl/                                  # 业务服务实现
│     ├─ interceptor/                              # JWT 鉴权拦截器
│     ├─ utils/                                    # 通用工具
│     └─ vo/                                       # 返回视图模型
│
├─ frontend/                                       # 前端 React 项目
│  ├─ Dockerfile                                   # 前端镜像构建文件
│  ├─ package.json                                 # 前端依赖与脚本
│  ├─ public/                                      # 静态资源
│  ├─ docker-entrypoint.d/                         # 容器启动脚本
│  └─ src/
│     ├─ admin/                                    # 管理端
│     │  ├─ components/                            # 管理端页面组件
│     │  ├─ hooks/                                 # 管理端 Hooks
│     │  ├─ services/                              # 管理端 API
│     │  └─ utils/                                 # 管理端工具
│     └─ user/                                     # 用户端
│        ├─ components/                            # 通用组件、布局、聊天、资料、发布等
│        ├─ context/                               # 登录、主题、消息、通知上下文
│        ├─ hooks/                                 # 关注、点赞收藏等 Hooks
│        ├─ pages/                                 # 首页、服务、闲置、动态、个人页等
│        ├─ services/                              # 用户端 API
│        └─ utils/                                 # 图片、路由、展示、存储等工具
│
├─ deploy/                                         # 部署与监控配置
│  ├─ docker-compose.ps1                           # Docker Compose 启动封装
│  ├─ nginx-docker.conf                            # 容器 Nginx 配置
│  ├─ prometheus.yml                               # Prometheus 配置
│  └─ grafana-dashboard-neighborhood.json          # Grafana 仪表盘
│
├─ docs/                                           # 项目文档
├─ docker-compose.yml                              # 本地/服务器编排
├─ AGENTS.md                                      # Codex 协作规则
└─ README.md                                      # 项目介绍
```

---

## 功能特性

### 用户系统

| 功能 | 说明 |
| --- | --- |
| 用户注册 | 邮箱验证码校验，注册前检查邮箱和昵称重复 |
| 用户登录 | 图形验证码后端校验，JWT + Redis 登录态 |
| 忘记密码 | 邮箱验证码重置密码，重置过程限流 |
| 个人资料 | 昵称、头像、简介、电话、地区等资料维护 |
| 默认头像 | 新用户自动引用统一默认头像，历史空头像可补齐 |
| 关注系统 | 用户关注、取消关注、关注状态查询 |
| 隐私设置 | 资料可见性、动态可见性、位置展示开关 |

### 同城服务

| 功能 | 说明 |
| --- | --- |
| 服务列表 | 按分类浏览同城服务，支持分页 |
| 服务详情 | 展示服务信息、服务者信息、评价信息 |
| 服务发布 | 登录用户可发布生活服务 |
| 服务预约 | 预约服务并生成订单与通知 |
| 服务评价 | 对服务进行评分、评价、点赞 |

### 闲置交易

| 功能 | 说明 |
| --- | --- |
| 闲置列表 | 展示同城闲置商品 |
| 闲置详情 | 展示商品、卖家和交易信息 |
| 商品发布 | 登录用户可发布闲置物品 |
| 购买请求 | 买家提交购买意向并触发通知 |
| 卖家主页 | 可从详情页进入卖家公开主页 |

### 同城动态

| 功能 | 说明 |
| --- | --- |
| 动态列表 | 浏览社区动态与热门内容 |
| 动态详情 | 查看正文、图片、作者和互动状态 |
| 发布动态 | 登录用户发布社区内容 |
| 评论互动 | 评论、点赞评论、删除自己的动态 |
| 收藏点赞 | 支持动态点赞和收藏状态同步 |

### 消息通知

| 功能 | 说明 |
| --- | --- |
| 消息会话 | 用户之间直接沟通 |
| 通知中心 | 服务预约、购买请求、系统通知 |
| 已读管理 | 单条已读、会话已读、全部已读 |
| 异步写入 | RabbitMQ 处理通知写入 |

### 管理后台

| 功能 | 说明 |
| --- | --- |
| 仪表盘 | 统计用户、服务、动态、订单等数据 |
| 用户管理 | 用户列表、封禁、认证、角色设置 |
| 内容管理 | 动态、评论、图片审核 |
| 交易管理 | 服务、闲置、订单管理 |
| 系统管理 | 分类、通知、消息、菜单、角色、权限管理 |
| 安全日志 | 登录日志、操作日志、黑名单管理 |

### 性能与安全

| 能力 | 说明 |
| --- | --- |
| 缓存策略 | 用户、列表、详情、热点数据分层缓存 |
| 登录限流 | 用户端和管理端分别做登录失败限制 |
| 验证码安全 | 图形验证码答案只保存在后端 Redis |
| 静态资源 | Nginx 缓存策略和安全响应头 |
| 文件访问 | 上传、公开读取、系统默认头像分路径处理 |
| 监控指标 | Actuator + Micrometer + Prometheus + Grafana |

---

## 环境要求

| 组件 | 版本 | 说明 |
| --- | --- | --- |
| JDK | 17+ | 后端运行环境 |
| Maven | 3.9+ | 后端构建工具 |
| Node.js | 20+ | 前端开发环境 |
| MySQL | 8.0+ | 主数据库 |
| Redis | 7.0+ | 缓存、登录态、验证码 |
| RabbitMQ | 3.8+ | 消息队列 |
| Docker | 20.0+ | 容器化部署 |
| RustFS/S3 | latest | 图片与文件存储 |

---

## 快速开始

### 后端启动

```bash
# 初始化数据库
mysql -u root -proot neighborhood_db < backend-java-reference/sql/init.sql

# 启动后端
cd backend-java-reference
mvn spring-boot:run
```

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

### Docker 方式（推荐）

```powershell
# 使用封装脚本启动所有容器
powershell -ExecutionPolicy Bypass -File deploy/docker-compose.ps1 up -d --build
```

启动前需要准备本地私有配置：

| 文件 | 说明 |
| --- | --- |
| `.env.docker.local` | Docker Compose 环境变量 |
| `backend-java-reference/application-secret.yml` | 后端私有密钥配置 |

---

## 访问地址

| 服务 | 地址 | 说明 |
| --- | --- | --- |
| 用户端 | `http://localhost` | Docker 前端入口 |
| 后端 API | `http://127.0.0.1:18081` | Docker 后端映射 |
| 本地前端开发 | `http://localhost:5173` | Vite Dev Server |
| RabbitMQ 管理端 | `http://127.0.0.1:15674` | 消息队列控制台 |
| RustFS 控制台 | `http://127.0.0.1:19001` | 对象存储控制台 |
| Prometheus | `http://127.0.0.1:19090` | 指标采集 |
| Grafana | `http://127.0.0.1:13000` | 监控看板 |

---

## 常用命令

```bash
# 前端类型检查
cd frontend
npm run lint

# 后端编译检查
cd backend-java-reference
mvn -q -DskipTests compile

# 查看容器状态
docker compose --env-file .env.docker.local ps

# 查看 RabbitMQ 队列
docker exec neighborhood-rabbitmq rabbitmqctl list_queues name durable messages consumers
```

---

## 部署说明

- 仓库不提交 `.env.docker.local`、`application-secret.yml`、证书私钥、数据库备份、镜像导出包、`node_modules`、`target` 等本地或敏感文件。
- 生产部署前需要替换 JWT 密钥、数据库密码、RabbitMQ 密码、RustFS 密钥、Grafana 管理员密码和邮箱授权码。
- Nginx 已配置静态资源缓存、安全响应头、敏感路径拦截和后端反向代理。
- 后端默认统一响应格式为 `{"success": true, "message": "success", "data": {}, "total": null}`。
