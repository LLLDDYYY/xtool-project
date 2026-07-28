# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

xTool 激光切割机参数管理系统，基于 NestJS 的全栈应用，用于管理机型、材料、样品参数、图纸等数据。

## 技术栈

- **框架**: NestJS + `@lark-apaas/fullstack-nestjs-core`
- **ORM**: Drizzle ORM + PostgreSQL
- **视图引擎**: HBS (Handlebars) 模板，渲染 `dist/client` 目录下的 HTML 文件
- **AI**: 腾讯混元 API (Hunyuan Vision) 进行材质识别

## 目录结构

```
server/           # 后端代码（含编译后的 JS）
  modules/
    xtool/        # 核心业务模块（样品、材料、机型、图纸、AI识别、管理员）
    view/         # 页面路由（HTML 模板渲染）
    hello/        # 示例模块
  database/
    schema.js     # Drizzle schema，定义所有数据表
  common/         # 公共模块（过滤器、接口定义）
client/           # 前端 HBS 模板源文件（编译输出到 dist/client）
shared/           # 前后端共享类型定义
```

## 核心数据模型

- **machines** - 机型（xTool F1U、F2U UV、M2、M3 等）
- **materials** - 材料（木材、金属、塑料、硅胶等）
- **samples** - 样品参数（关联机型+材料+图纸类型，含功率/速度/次数/密度/频率等加工参数）
- **drawings** - 图纸文件（矢量图/位图/深度图）
- **styles** - 图纸样式
- **siteSettings** - 系统设置（弹窗图片、API Keys）
- **adminAccounts** - 管理员账户

## 关键架构设计

1. **API 路由分为两组**:
   - `api/public/` - 公开读写接口（部分需登录 `@NeedLogin()` 装饰器保护）
   - `api/public/admin/` - 管理后台接口，需 `x-admin-token` 请求头认证

2. **Session 管理**: HMAC-SHA256 签名令牌，24小时有效期，密钥硬编码在 `SESSION_SECRET`

3. **AI 材质识别**: 调用腾讯混元 API 分析图片，返回"颜色+材质+物品名称"

4. **Client 目录**: HBS 模板文件需编译后放入 `dist/client`，服务启动时渲染这些模板

## 运行

```bash
npm install
npm start        # 生产模式（需要先编译 client）
npm run dev      # 开发模式
```

环境变量:
- `SERVER_HOST` - 服务地址（默认 localhost）
- `SERVER_PORT` - 服务端口（默认 3000）

## API 路由

路由定义在 `api-routes.json`（API 接口）和 `page-routes.json`（页面路由）。

主要接口:
- `GET /api/public/machines` - 获取机型列表
- `GET /api/public/materials` - 获取材料列表
- `GET /api/public/samples` - 获取样品参数
- `POST /api/public/admin/ai/recognize` - AI 识别文本参数
- `POST /api/public/admin/ai/analyze-material` - AI 分析图片材质
