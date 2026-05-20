# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

同城生活社区平台：
- **前端**: React 19 + Vite + TypeScript + Tailwind CSS v4 + React Router v7
- **后端**: Spring Boot 3.2 + MyBatis-Plus + MySQL + Redis

## 开发命令

### 前端
```bash
cd frontend && npm install && npm run dev
```

### 后端
```bash
cd backend-java-reference && mvn spring-boot:run
```

### 数据库
```bash
mysql -u root -proot neighborhood_db < sql/init.sql
```

## 架构说明

### 前端
- `src/App.tsx` - 主路由配置
- `src/pages/` - 页面组件
- `src/components/` - 按模块组织：chat、common、home、layout、profile、publish
- `src/context/` - AuthContext、ChatContext、NotificationContext、ToastContext、useAuthCheck
- `src/services/api.ts` - 统一 API 入口
- `src/types.ts` - 类型定义

### 后端
`src/main/java/com/neighborhood/app/` 下的分层架构：
- `controller/` - REST 控制器
- `service/` - 业务逻辑（impl 实现类）
- `mapper/` - MyBatis 数据访问
- `entity/` - 数据库模型
- `common/` - `Result<T>` 统一响应封装
- `config/` - RedisConfig、WebConfig、JacksonConfig
- `interceptor/` - AuthInterceptor（JWT 认证）

### 实体 ID 设计
- String 类型 ID：`@TableId(type = IdType.ASSIGN_ID)`
- Long 类型 ID：需添加 `@JsonSerialize(using = ToStringSerializer.class)` 防止精度丢失

### 缓存策略
用户 30分钟，列表 10分钟，详情 15分钟，热点 5分钟

## API 设计

后端运行在 8080 端口。统一响应格式：
```json
{"success": true, "message": "success", "data": {...}}
```

### 认证机制
JWT + Redis 双验证，AuthInterceptor 拦截 `/api/**`（登录/注册除外）

## 重要规则

**每次完成任务用中文提交到git**
**每次添加接口，接口添加中文注释**
**技术栈用符合项目的，依赖能添加就添加**

## 配置

- 前端：`.env.local` 配置 `GEMINI_API_KEY`
- 后端：`application.yml` 中 `jdbc:mysql://localhost:3306/neighborhood_db`，用户名/密码 `root/root`