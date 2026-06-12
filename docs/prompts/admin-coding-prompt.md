# 同城生活管理端编程提示词

请基于当前项目实现“同城生活社区平台管理端”，功能必须与管理端页面提示词对应，代码简洁、清晰、可维护。

## 技术栈
- 前端：React 19 + Vite + TypeScript + Tailwind CSS v4 + React Router v7
- 后端：Spring Boot 3.2 + MyBatis-Plus + MySQL + Redis
- 不引入大型 UI 库，不破坏现有用户端功能。

## 实现范围
- 管理端登录鉴权
- 管理端布局：侧边栏、顶部栏、主内容区
- 仪表盘
- 用户管理
- 动态管理
- 闲置商品管理
- 服务管理
- 订单管理
- 通知管理
- 分类管理

## 前端要求
- 新增管理端路由：`/admin/login`、`/admin/dashboard`、`/admin/users`、`/admin/posts`、`/admin/market`、`/admin/services`、`/admin/orders`、`/admin/notifications`、`/admin/categories`
- 未登录访问 `/admin/*` 自动跳转 `/admin/login`
- API 请求统一封装到 `adminApi.ts`
- token 本地保存，请求携带 `Authorization: Bearer token`
- 登录失效清除 token 并跳转登录页
- 表格支持搜索、筛选、分页、详情、危险操作二次确认
- 所有页面处理 loading、空状态、错误状态、操作反馈

## 推荐前端目录
- `frontend/src/pages/admin/`
- `frontend/src/components/admin/`
- `frontend/src/services/adminApi.ts`
- `frontend/src/context/AdminAuthContext.tsx`

## 必要组件
- `AdminLayout`
- `AdminSidebar`
- `AdminHeader`
- `AdminProtectedRoute`
- `StatCard`
- `StatusBadge`
- `ConfirmDialog`
- `AdminTable`
- `FilterBar`
- `DetailModal`

## 后端要求
- 新增管理端接口统一放在 `/api/admin/**`
- 接口返回统一使用 `Result`
- 新增 Controller 方法上方必须写中文注释
- 管理端接口必须校验管理员身份
- Long 类型 ID 返回前端时避免 JS 精度丢失
- 新增表或字段必须同步更新 `backend-java-reference/sql/init.sql`

## 推荐后端目录
- `controller/AdminController.java`
- `service/AdminService.java`
- `service/impl/AdminServiceImpl.java`
- 必要时新增 DTO/VO，避免直接暴露敏感字段

## 模块接口
- 登录：管理员登录、退出、获取当前管理员信息
- 仪表盘：统计数量、最新动态、最新订单、待处理事项
- 用户管理：列表、搜索、详情、启用、禁用、删除
- 动态管理：列表、搜索、详情、删除、评论管理
- 商品管理：列表、搜索、详情、下架、删除
- 服务管理：列表、搜索、详情、审核、下架、删除
- 订单管理：列表、搜索、详情、处理异常、取消订单
- 通知管理：列表、详情、发送系统通知、发送指定用户通知
- 分类管理：列表、新增、编辑、删除、启用、停用、排序

## 数据安全
- 管理员权限与普通用户权限分离
- 删除、禁用、下架、取消订单等操作记录原因
- 不向前端返回密码、token、隐私配置等敏感字段
- 查询列表默认分页，避免一次返回过多数据

## 验证要求
- 前端改动后运行 `npm run lint`
- 后端改动后运行 `mvn -q -DskipTests compile`
- 确认现有用户端路由和功能不受影响

## 输出要求
- 按模块逐步实现，先完成登录、布局、仪表盘、用户管理
- 再扩展动态、商品、服务、订单、通知、分类
- 代码优先复用现有工具、类型、组件和接口风格
- 不输出无关说明，不实现页面提示词之外的功能
