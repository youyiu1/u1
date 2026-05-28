# AGENTS.md

This file provides guidance to Codex when working with code in this repository.

## 项目概述

同城生活社区平台：
- 前端：React 19 + Vite + TypeScript + Tailwind CSS v4 + React Router v7
- 后端：Spring Boot 3.2 + MyBatis-Plus + MySQL + Redis

## 开发命令

### 前端
```bash
cd frontend
npm install
npm run dev
npm run lint
```

### 后端
```bash
cd backend-java-reference
mvn spring-boot:run
mvn -q -DskipTests compile
```

### 数据库
```bash
mysql -u root -proot neighborhood_db < backend-java-reference/sql/init.sql
```

## 架构说明

### 前端
- `src/App.tsx`：主路由配置
- `src/pages/`：页面组件
- `src/components/`：按模块组织，包括 `chat`、`common`、`home`、`layout`、`profile`、`publish`
- `src/context/`：认证、聊天、通知、发布、Toast 等上下文
- `src/services/api.ts`：统一 API 入口
- `src/types.ts`：类型定义
- `src/utils/images.ts`：图片字段解析公共方法，处理数组、JSON 字符串和单图字符串
- `src/utils/followStorage.ts`：关注状态本地缓存
- `src/utils/location.ts`：定位相关公共方法

### 后端
`backend-java-reference/src/main/java/com/neighborhood/app/` 下的分层架构：
- `controller/`：REST 控制器
- `service/`：业务逻辑接口
- `service/impl/`：业务逻辑实现
- `mapper/`：MyBatis-Plus 数据访问
- `entity/`：数据库模型
- `dto/`：请求或设置类 DTO
- `common/Result.java`：统一响应封装
- `config/`：Redis、Web、Jackson、S3 等配置
- `interceptor/AuthInterceptor.java`：JWT + Redis 认证
- `utils/RequestUserUtil.java`：从请求中获取当前用户 ID 的公共方法

## 实体和 ID 规则

- String 类型 ID：使用 `@TableId(type = IdType.ASSIGN_ID)`
- Long 类型 ID：返回给前端时添加 `@JsonSerialize(using = ToStringSerializer.class)`，避免 JS 精度丢失
- 评论、动态、服务等涉及前端传回 ID 的 Long 字段必须重点检查序列化

## 数据库说明

- 初始化脚本：`backend-java-reference/sql/init.sql`
- 评论表：`t_comment`，包含 `likes` 字段
- 评论点赞表：`t_comment_like`，通过 `(comment_id, user_id)` 唯一约束保证同一用户不能重复点赞
- 如果新增接口依赖新表，必须同步更新 `init.sql`

## API 设计

后端默认运行在 8080 端口。统一响应格式：
```json
{"success": true, "message": "success", "data": {...}, "total": null}
```

### 认证机制

- JWT + Redis 双验证
- `AuthInterceptor` 拦截 `/api/**`
- 登录、注册和部分公开读取接口放行
- 公开接口如果带合法 token，也会把 `userId` 写入 request attribute
- 控制器中优先用 `RequestUserUtil.getEffectiveUserId(request, fallbackUserId)` 获取当前用户

## 缓存策略

- 用户：30 分钟
- 列表：10 分钟
- 详情：15 分钟
- 热点：首页 5 分钟
- 点赞、收藏状态以数据库为最终事实来源，Redis 只做缓存加速

## 重要规则

- 每次完成任务后，用中文提交到 git（如用户要求提交）
- 每次新增接口，接口上方添加中文注释
- 技术栈必须符合当前项目，优先复用已有依赖和组件
- 写代码前先看现有实现，优先提取可复用方法或组件，减少重复逻辑
- 前端改动后至少运行 `npm run lint`
- 后端改动后至少运行 `mvn -q -DskipTests compile`
- 不要提交 `backend-java-reference/target/`、前端构建产物或本地日志

## 配置

- 前端：`.env.local` 配置 `GEMINI_API_KEY`
- 后端：`application.yml` 默认连接 `jdbc:mysql://localhost:3306/neighborhood_db`
- 默认数据库用户名/密码：`root/root`
- 测试账号：`1668820870@qq.com / 12345678yyy@`
