# Developer Guide

面向仓库开发者的统一说明文档。原先分散在根 `README`、`apps/README` 的开发信息已集中到这里。

## Monorepo 结构

```txt
apps/
  api/   # Node.js API
  web/   # Browser editor
packages/
  core/  # Shared core logic
  cli/   # md2weixin CLI
docs/
  DEVELOPER.md
  monorepo-migration.md
```

## 当前迁移状态

- `apps/api`：已迁入
- `apps/web`：已迁入
- `packages/core`：已接入参数规范化、renderer/furigana 和 API/CLI 渲染主链路
- `apps/web`：已切换为消费 `packages/core` 构建产物（`wx-renderer.js`），并调用 core 暴露的 render/prettify/export helper
- `API/CLI/Web`：在 `demo.md` 输入下输出已对齐
- `apps/web` 的 `app.css/themes.css/marked/prettify/juice/wx-renderer` 及 `assets/vendor`（vue/axios/element-ui/jquery）由 `sync:core-assets` 生成，不再作为源码维护
- 样式内联参数与浏览器导出逻辑均由 core 统一管理；不同运行时仅保留必要的执行环境差异（browser/node）

迁移历史记录见：`docs/monorepo-migration.md`（已归档）

## 依赖管理（pnpm）

本仓库统一使用 `pnpm` 管理 workspace 依赖。

### 1) 安装 pnpm

```bash
npm install -g pnpm
```

### 2) 在仓库根目录安装依赖

```bash
pnpm install
```

### 3) 常用 workspace 命令

按 CLI / API / Web 分组如下：

#### CLI

```bash
# 构建 CLI（会先构建 core）
pnpm --dir packages/cli build

# 运行 CLI（编译产物）
pnpm --dir packages/cli cli -- ./apps/api/spec/tests/md/demo.md --theme chengxin --font cx

# 从根脚本运行 CLI（如需重定向，建议加 --silent）
pnpm --silent cli -- ./apps/api/spec/tests/md/demo.md --theme chengxin --font cx
```

#### API

```bash
# 构建 API（会在构建流程中构建 core）
pnpm --dir apps/api build

# 启动 API 开发模式（默认 3000）
pnpm --dir apps/api dev

# 启动 API 生产模式（默认 8081）
pnpm start:api
```

#### Web

```bash
# 启动 Web（会先同步 core 资产与本地 vendor）
pnpm --dir apps/web start

# 构建 Web（输出到 apps/web/dist）
pnpm --dir apps/web build

# 预览 Web 构建产物
pnpm --dir apps/web preview

# 仅同步 Web 使用的资产（core renderer/css/prettify/juice + 本地 marked/vue/axios/element-ui/jquery）
pnpm --dir apps/web sync:core-assets

# 本地修改 less 并实时编译 themes.css
pnpm --dir apps/web start:with-less
```

#### Core（共享渲染包）

```bash
# 单独构建 core
pnpm --filter md2weixin-core build
```

## 版本号批量更新（release:version）

根脚本 `release:version` 用于批量更新 monorepo 内包版本（含 semver 校验）。

```bash
# 预览将要更新的文件，不写入
pnpm release:version -- 1.0.0 --dry-run

# 执行更新
pnpm release:version -- 1.0.0
```

说明：

- 更新范围：根 `package.json`、`apps/*/package.json`、`packages/*/package.json`
- 仅更新存在 `version` 且与目标版本不同的包
- 该命令不会自动创建 git tag 或 commit

## 发布到 npm（release:publish）

发布前请先登录 npm：

```bash
npm login
```

先做 dry-run 检查：

```bash
pnpm release:publish:dry-run
```

正式发布：

```bash
pnpm release:publish
```

说明：

- 发布顺序固定为：`md2weixin-core` -> `md2weixin`（避免 CLI 依赖未发布）
- `release:publish` 会先执行 `release:build`，确保产物为最新
- 如需版本变更，先执行 `pnpm release:version -- <version>`

## 文档约定

- 面向开发者的流程、命令、迁移设计统一放在 `docs/`
- 根 `README` 保持项目概览，不承载详细开发流程
- 应用目录下的 `README` 仅保留入口说明并指向 `docs/`
