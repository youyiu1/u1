<div align="center">

# 同城生活社区平台

现代化同城社区系统｜生活服务｜闲置交易｜同城动态｜实时沟通｜后台管理

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

**同城生活社区平台** 是一个面向本地社区的生活服务平台，提供同城服务、闲置交易、社区动态、消息沟通和后台管理等功能。

---

## 项目亮点

- **生活服务**：支持服务分类浏览、详情查看、服务发布、预约留痕、评价反馈。
- **闲置交易**：支持闲置商品展示、详情页、发布商品、购买请求和卖家信息展示。
- **同城动态**：支持社区动态发布、评论、点赞、收藏和用户主页跳转。
- **即时沟通**：提供消息会话、通知中心、已读状态和直接联系能力。
- **账号安全**：JWT + Redis 登录态、图形验证码、邮箱验证码、登录限流、重置密码限流。
- **文件存储**：图片上传走后端统一代理，默认头像自动托管到 RustFS/S3。
- **后台治理**：管理用户、服务、闲置、订单、动态、评论、图片、通知、角色和权限。
- **实时通知**：WebSocket/STOMP 推送私信与通知，RabbitMQ 异步处理通知和管理日志。
- **性能优化**：Spring Cache + Caffeine 缓存热点数据，Spring AOP 记录管理操作和慢方法。
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
| Spring Security | 无状态安全配置、安全响应头，与现有拦截器鉴权逻辑配合 |
| Spring AOP | 管理端操作审计、慢方法日志 |
| Spring Cache + Caffeine | 本地缓存与业务缓存 |
| RabbitMQ | 异步通知、管理日志写入 |
| JWT + Redis | Token 签发与登录态双校验 |
| WebSocket/STOMP | 私信和通知实时推送 |
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
┌────────────────────────────────────────────────────────────┐
│                         访问层                              │
│        用户端 Web        │        管理端 Web                 │
│        React + Vite      │        React + Vite               │
└──────────────────────────────┬─────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────┐
│                         网关层                              │
│        Nginx：静态资源托管 / HTTPS / 反向代理 / 安全响应头    │
└──────────────────────────────┬─────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────┐
│                         应用层                              │
│        Spring Boot REST API + WebSocket：认证、用户、服务、交易、动态、管理 │
└──────────────┬───────────────┬───────────────┬─────────────┘
               │               │               │
┌──────────────▼──────┐ ┌──────▼────────┐ ┌────▼────────────┐
│       MySQL         │ │     Redis     │ │    RabbitMQ     │
│  业务数据与关系存储  │ │ 登录态/验证码/缓存/限流 │ │ 通知/日志异步处理 │
└─────────────────────┘ └───────────────┘ └─────────────────┘
               │
┌──────────────▼─────────────────────────────────────────────┐
│                         支撑层                              │
│        RustFS/S3 文件存储        │        Prometheus + Grafana 监控 │
└────────────────────────────────────────────────────────────┘
```

---

## 项目结构

```text
neighborhood/
├─ backend-java-reference/                         # 后端 Spring Boot 项目
│  ├─ sql/                                         # 数据库初始化、迁移、索引脚本
│  ├─ src/main/java/com/neighborhood/app/          # 后端主代码
│  │  ├─ common/                                   # 统一响应、异常处理、上下文工具
│  │  ├─ config/                                   # Web、安全、WebSocket、Redis、缓存、RabbitMQ、S3、监控配置
│  │  ├─ aspect/                                   # 管理操作审计与慢方法日志切面
│  │  ├─ controller/                               # REST 接口层
│  │  │  ├─ client/                                # 用户端接口
│  │  │  ├─ admin/                                 # 管理端接口
│  │  │  └─ admin/module/                          # 管理端模块化查询与处理逻辑
│  │  ├─ dto/                                      # 请求参数对象
│  │  │  ├─ user/                                  # 用户、登录、注册、设置相关请求
│  │  │  ├─ service/                               # 服务预约与评价请求
│  │  │  ├─ market/                                # 闲置交易请求
│  │  │  ├─ content/                               # 内容相关扩展请求
│  │  │  ├─ interaction/                           # 评论、收藏等互动请求
│  │  │  ├─ message/                               # 消息发送请求
│  │  │  ├─ notification/                          # 通知处理请求
│  │  │  └─ admin/                                 # 管理端请求对象
│  │  ├─ entity/                                   # 数据库实体
│  │  │  ├─ user/                                  # 用户与关注
│  │  │  ├─ service/                               # 服务、预约、订单、评价、通知
│  │  │  ├─ market/                                # 闲置商品与收藏
│  │  │  ├─ content/                               # 动态、评论、点赞
│  │  │  ├─ message/                               # 私信消息
│  │  │  ├─ system/                                # 分类、搜索
│  │  │  └─ admin/                                 # 管理角色、日志、黑名单、审核状态
│  │  ├─ mapper/                                   # MyBatis-Plus 数据访问层
│  │  ├─ service/                                  # 业务服务接口
│  │  │  └─ impl/                                  # 业务服务实现
│  │  ├─ messaging/                                # RabbitMQ 消息模型与监听器
│  │  ├─ realtime/                                 # WebSocket 实时通信身份、事件与握手认证
│  │  ├─ interceptor/                              # 鉴权、性能拦截器
│  │  ├─ handler/                                  # 自定义类型处理器
│  │  ├─ util/                                     # 兼容工具类
│  │  ├─ utils/                                    # 通用业务工具类
│  │  └─ vo/                                       # 返回视图对象
│  ├─ src/test/                                    # 后端测试目录
│  └─ 项目配置                                      # 后端依赖、镜像、私有配置示例
│
├─ frontend/                                      # 前端 React 项目
│  ├─ src/                                       # 前端源码
│  │  ├─ admin/                                 # 管理端
│  │  │  ├─ components/                         # 管理端页面与通用组件
│  │  │  ├─ hooks/                              # 管理端 Hooks
│  │  │  ├─ services/                           # 管理端 API 封装
│  │  │  └─ utils/                              # 管理端工具函数
│  │  └─ user/                                  # 用户端
│  │     ├─ assets/                             # 用户端资源
│  │     ├─ components/                         # 用户端组件
│  │     │  ├─ auth/                            # 登录注册相关组件
│  │     │  ├─ chat/                            # 聊天组件
│  │     │  ├─ common/                          # 通用组件
│  │     │  ├─ home/                            # 首页组件
│  │     │  ├─ layout/                          # 页面布局组件
│  │     │  ├─ profile/                         # 个人主页组件
│  │     │  ├─ publish/                         # 发布相关组件
│  │     │  └─ settings/                        # 设置弹层组件
│  │     ├─ context/                            # 登录、主题、聊天、通知等上下文
│  │     ├─ hooks/                              # 关注、点赞、收藏等业务 Hooks
│  │     ├─ pages/                              # 页面目录
│  │     │  ├─ auth/                            # 登录注册页
│  │     │  ├─ home/                            # 首页
│  │     │  ├─ market/                          # 闲置交易页
│  │     │  ├─ news/                            # 同城动态页
│  │     │  ├─ profile/                         # 个人主页
│  │     │  ├─ service/                         # 生活服务页
│  │     │  ├─ search/                          # 搜索页
│  │     │  └─ legal/                           # 协议与隐私页
│  │     ├─ services/                           # 用户端 API 封装
│  │     └─ utils/                              # 用户端工具函数
│  ├─ public/                                   # 静态资源
│  ├─ docker-entrypoint.d/                      # 前端容器启动脚本
│  └─ 项目配置                                   # 前端依赖、构建、类型检查、镜像配置
│
├─ deploy/                                       # 部署与监控配置
│  ├─ certs/                                    # 证书挂载目录
│  ├─ nginx/                                    # Nginx 反向代理与静态资源配置
│  ├─ prometheus/                               # Prometheus 指标采集配置
│  ├─ grafana/                                  # Grafana 数据源与仪表盘配置
│  └─ scripts/                                  # 容器启动与部署辅助脚本
│
├─ docs/                                         # 项目文档
│  └─ prompts/                                  # 需求与提示词记录
├─ 容器编排配置                                  # Docker Compose 与服务编排
├─ 环境变量示例                                  # Docker、本地运行示例配置
├─ 协作规则文档                                  # AI 协作与项目约束说明
└─ 项目说明文档                                  # README 项目介绍
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
