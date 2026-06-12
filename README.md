# 同城生活社区平台

> 面向同城服务、闲置交易和社区动态的前后端分离社区平台，包含用户端、管理端、后端 API、缓存、消息队列、对象存储和监控部署配置。

## 项目概述

同城生活社区平台聚合同城生活服务、闲置交易、社区动态、消息沟通、订单预约和后台管理能力。项目采用前后端分离架构，前端提供用户端和管理端入口，后端提供统一 REST API，并结合 Redis、RabbitMQ、对象存储、Prometheus 和 Grafana 支撑缓存、异步消息、文件存储和运行监控。

## 系统架构

```text
客户端层
  ├─ 用户端：React + Vite
  └─ 管理端：React + Vite

网关层
  └─ Nginx：静态资源托管、HTTPS、反向代理、安全响应头

服务层
  └─ Spring Boot API：认证、用户、服务、闲置、动态、订单、消息、管理端接口

数据与基础设施层
  ├─ MySQL：业务数据
  ├─ Redis：登录态、验证码、缓存、限流
  ├─ RabbitMQ：通知、管理日志异步写入
  ├─ RustFS/S3：图片与默认头像存储
  └─ Prometheus + Grafana：监控指标与可视化
```

## 技术架构

### 后端技术栈

- Java 17
- Spring Boot 3
- MyBatis-Plus
- MySQL 8
- Redis
- Spring Cache + Caffeine
- RabbitMQ
- JWT + Redis 双重认证
- Actuator + Micrometer
- Prometheus + Grafana
- S3/RustFS 对象存储

### 前端技术栈

- React 19
- Vite
- TypeScript
- Tailwind CSS v4
- React Router v7
- Framer Motion
- Lucide React

### 部署与运维

- Docker Compose
- Nginx
- HTTPS 证书挂载
- RustFS 对象存储
- Prometheus 指标采集
- Grafana 仪表盘

## 项目结构

```text
.
├─ backend-java-reference/        # Spring Boot 后端服务
│  ├─ src/main/java/com/neighborhood/app/
│  │  ├─ controller/              # REST 接口
│  │  ├─ service/                 # 业务服务接口与实现
│  │  ├─ mapper/                  # MyBatis-Plus 数据访问
│  │  ├─ entity/                  # 数据库实体
│  │  ├─ dto/                     # 请求 DTO
│  │  ├─ vo/                      # 返回视图对象
│  │  ├─ config/                  # Redis、缓存、S3、RabbitMQ 等配置
│  │  ├─ interceptor/             # JWT 认证拦截器
│  │  └─ utils/                   # 通用工具
│  └─ sql/                        # 初始化与迁移 SQL
├─ frontend/                      # React 前端
│  ├─ src/user/                   # 用户端页面、组件、服务和上下文
│  ├─ src/admin/                  # 管理端页面、组件、服务和工具
│  └─ public/                     # 静态资源
├─ deploy/                        # Nginx、Prometheus、Grafana 等部署配置
├─ docs/                          # 项目文档与提示词
├─ docker-compose.yml             # 本地/服务器 Docker 编排
└─ README.md                      # 项目介绍
```

## 功能特性

### 用户端

- 用户注册、登录、退出登录
- 图形验证码、邮箱验证码、忘记密码
- 个人资料、隐私设置、通知设置
- 同城生活服务浏览、详情、发布、预约、评价
- 闲置交易浏览、详情、发布、购买请求
- 同城动态发布、详情、评论、点赞
- 收藏、关注、消息会话、通知中心
- 默认头像、图片上传与公开文件访问

### 管理端

- 管理员登录与图形验证码
- 用户管理、封禁、认证、角色设置
- 服务、闲置、订单管理
- 动态、评论、图片审核
- 通知、消息、分类、菜单、角色、权限管理
- 登录日志、操作日志、黑名单管理

### 安全与性能

- JWT + Redis 登录态校验
- 用户端与管理端登录限流
- 邮箱验证码发送与校验限流
- 图形验证码后端生成与 Redis 校验
- 默认头像统一托管到对象存储
- 静态资源缓存、安全响应头、敏感路径拦截
- RabbitMQ 异步处理通知和管理日志
- Spring Cache + Caffeine 缓存用户、列表、详情和热点数据

## 快速开始

### 环境要求

- Node.js 20+
- JDK 17+
- Maven 3.9+
- MySQL 8+
- Redis 7+
- RabbitMQ

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

### 后端启动

```bash
cd backend-java-reference
mvn spring-boot:run
```

### 初始化数据库

```bash
mysql -u root -proot neighborhood_db < backend-java-reference/sql/init.sql
```

## Docker 部署

项目提供 Docker Compose 编排，推荐通过封装脚本启动，避免漏传环境变量文件。

```powershell
powershell -ExecutionPolicy Bypass -File deploy/docker-compose.ps1 up -d --build
```

启动前需要准备本地私有配置文件：

- `.env.docker.local`
- `backend-java-reference/application-secret.yml`

示例配置文件已保留在仓库中，真实密钥、邮箱授权码、对象存储密钥和生产密码不要提交到 Git。

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
```

## 默认信息

- 后端默认端口：`8080`
- Docker 后端映射：`127.0.0.1:18081`
- 前端默认端口：`5173`
- 数据库名称：`neighborhood_db`
- 统一响应格式：`{"success": true, "message": "success", "data": {}, "total": null}`

## 说明

仓库中已排除本地构建产物、导出镜像包、数据库备份、证书私钥、`.env` 私密配置、`node_modules` 和 `target` 等文件。上传 GitHub 的内容只保留项目源码、必要脚本、示例配置和部署模板。
