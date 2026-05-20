# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个同城生活社区平台，包含：
- **前端**: React 19 + Vite + TypeScript + Tailwind CSS v4 + React Router v7
- **后端**: Spring Boot 3.2 + MyBatis-Plus + MySQL + Redis
- **AI 集成**: 通过 `@google/genai` 调用 Gemini API 实现聊天功能

## 开发命令

### 前端
```bash
cd frontend
npm install          # 安装依赖
npm run dev          # 启动开发服务器（支持 HMR）
npm run build        # 生产环境构建
npm run lint         # TypeScript 类型检查
```

### 后端
```bash
cd backend-java-reference
mvn clean package    # 构建 JAR 包
mvn spring-boot:run  # 本地运行
```

## 架构说明

### 前端结构
- `src/App.tsx` - 主路由配置，嵌套路由挂载在 Layout 组件下
- `src/pages/` - 页面组件（Home、ServiceList、MarketList、News、Profile 等）
- `src/components/` - 按功能模块组织：chat、common、home、layout、profile、publish
- `src/context/` - AuthContext（认证）、ChatContext（AI 聊天浮层）、NotificationContext、ToastContext、useAuthCheck
- `src/services/api.ts` - 统一 API 调用入口
- `src/constants.ts` - API 端点和共享常量
- `vite.config.ts` - 当 `DISABLE_HMR=true` 时禁用 HMR，防止编辑时闪烁

### 后端结构
标准 Spring Boot 分层架构，位于 `src/main/java/com/neighborhood/app/`：
- `controller/` - REST 控制器（Home、Market、News、Service、User、Notification、Category、Search、Message）
- `service/` - 业务逻辑层（包含 impl 实现类）
- `mapper/` - MyBatis 数据访问接口
- `entity/` - 数据库表模型
- `common/` - 通用响应封装（Result/ResultCode/ResultUtils）
- `config/` - 配置类（RedisConfig、WebConfig、JacksonConfig）
- `interceptor/` - JWT 认证拦截器（AuthInterceptor）
- `util/` - 工具类（JwtUtil、StringUtils）

### 缓存架构
后端使用 Redis 实现多级缓存策略：
- 用户缓存：30分钟
- 列表缓存：10分钟
- 详情缓存：15分钟
- 热点数据缓存：5分钟

### API 设计
后端运行在 8080 端口。响应数据统一使用 `Result<T>` 封装，包含状态码。

### 数据库
使用 MySQL + MyBatis-Plus ORM。SQL 脚本位于 `backend-java-reference/sql/`：
- `schema.sql` - 表结构定义
- `init.sql` - 初始化数据

## 重要规则

**每次完成任务用中文提交到git**
**每次添加接口，接口添加中文注释**

## 配置说明

### 前端
- 复制 `.env.example` 为 `.env.local` 并配置 `GEMINI_API_KEY`
- `APP_URL` 由 AI Studio 运行时注入

### 后端
数据库配置位于 `src/main/resources/application.yml`：
- 默认：`jdbc:mysql://localhost:3306/neighborhood_db`，用户名/密码为 `root/root`