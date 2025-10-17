# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个个人名片生成器项目，主要功能是生成个人名片。该项目使用 TypeSpec 定义 API 规范，并配置了 GitHub Actions 进行 CI/CD 部署到 GitHub Pages。

## 项目结构

```
persornal_card/
├── .github/workflows/     # GitHub Actions 工作流配置
├── spec/                  # TypeSpec API 规范定义
│   ├── api.tsp           # API 接口定义
│   └── sla.yaml          # 服务等级协议定义
├── logs/                 # 日志目录
└── README.md             # 项目说明文档
```

## API 规范

项目使用 TypeSpec 定义 API 接口，位于 `spec/api.tsp`：

- **服务名称**: PersonalCard Generator
- **版本**: 1.0.0
- **命名空间**: CardGen

**主要接口**:
- `GET /card` - 预览名片（返回 HTML）
- `POST /card/download` - 下载名片图片（返回 PNG）

**名片输入模型**:
```typescript
model CardInput {
  avatar: bytes;          // base64 裁剪后头像
  name: string;
  phone: string;
  email: string;
  homepage: url;
  github: string;
  x: string;
  bio: string;
  theme: "minimal" | "business" | "neon" | "pastel" | "dark" | "sunset" | "ocean" | "forest" | "retro" | "cyber";
}
```

## 开发命令

基于 GitHub Actions 配置，项目支持以下 npm 脚本：

```bash
# 安装依赖
npm ci

# 运行测试（CI 环境）
npm run test:ci

# 构建项目
npm run build
```

注意：当前测试和构建命令为预留，实际项目中可能需要实现相应逻辑。

## 部署配置

项目配置了自动部署到 GitHub Pages：

- **触发条件**: 推送到 main 分支或对 main 分支创建 PR
- **运行环境**: Ubuntu latest，Node.js 20
- **部署目标**: GitHub Pages

## 服务等级协议

在 `spec/sla.yaml` 中定义了以下 SLO：

- 下载成功率：99.9%（7天窗口）
- 下载 P95 延迟：300ms（1天窗口）
- 预览可用性：99.95%（30天窗口）

## 开发注意事项

1. 这是一个纯前端项目，无后端日志、指标和追踪
2. API 规范使用 TypeSpec 定义，修改时需要更新 `spec/api.tsp`
3. 主题支持多种风格：minimal、business、neon、pastel、dark、sunset、ocean、forest、retro、cyber
4. 头像使用 base64 编码的 bytes 格式