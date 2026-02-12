# wx-markdown

将 Markdown 转换成适用于微信公众号编辑器粘贴的 HTML（包含样式内联、代码高亮、主题样式和脚注处理）。

核心接口是 `POST /api/wx-md`。

## 开发者文档

- 开发者说明：`../../docs/DEVELOPER.md`
- 迁移计划：`../../docs/monorepo-migration.md`

## 功能特性

- Markdown 转公众号风格 HTML（基于 `marked` 自定义渲染器）
- 代码块高亮与行号（`prettify`）
- 样式内联（`juice`），便于直接粘贴到公众号后台
- 多主题支持（`theme` 参数）
- 字体风格切换（`font` 参数：`cx` / `no-cx`）
- 外链自动转换为文末脚注（公众号内链保持链接）
- 支持注音语法（如 `世界{せかい}`）

## 处理流程

1. 使用 `marked + WxRenderer` 渲染为结构化 HTML
2. 执行 `prettify` 代码高亮
3. 注入 `app.css + themes.css + prettify.css`
4. 用 `juice` 将样式内联后输出最终 HTML

## 快速开始

### 1) 安装依赖

```bash
npm install
```

### 2) 开发启动

```bash
npm run dev
```

默认读取 `env/development.env`，端口默认 `3000`。

### 3) 构建并生产启动

```bash
npm run build
npm run start
```

`npm run start` 会以 `--env=production` 启动，默认读取 `env/production.env`，端口默认 `8081`。

## 访问控制

`/api/wx-md` 当前为公开接口，不需要 token 或其他鉴权头。

## CLI 用法

CLI 已迁移至 monorepo 的 `packages/cli`。

请在仓库根目录使用：

```bash
pnpm --dir packages/cli build
pnpm --dir packages/cli cli -- ./apps/api/spec/tests/md/demo.md --theme chengxin --font cx
```

或直接使用根脚本：

```bash
pnpm cli -- ./apps/api/spec/tests/md/demo.md --theme chengxin --font cx
```

## API 文档

### POST `/api/wx-md`

请求头：

- `Content-Type: application/json`

请求体：

```json
{
  "markdown": "## 示例\n\n这是一个示例",
  "theme": "chengxin",
  "font": "cx"
}
```

字段说明：

- `markdown`：`string`，必填
- `theme`：`string`，可选，默认 `default`
- `font`：`string`，可选，`cx` 或 `no-cx`，默认 `cx`

响应示例（成功）：

```json
{
  "success": true,
  "data": "<section id=\"md-root\" ...>...</section>"
}
```

### curl 示例

```bash
curl -X POST http://localhost:3000/api/wx-md \
  -H "Content-Type: application/json" \
  -d '{"font":"cx","theme":"chengxin","markdown":"## 示例\n\n这是一个示例"}'
```

### theme 可选值

- `default`
- `chengxin`
- `mohei`
- `chazi`
- `nenqing`
- `lvyi`
- `hongfei`
- `wechat-format`
- `lanying`
- `kejilan`
- `lanqing`
- `shanchui`
- `qianduan`
- `jikehei`
- `jian`
- `qiangweizi`
- `menglv`
- `quanzhanlan`

## Markdown 扩展说明

- 外链会在文末生成脚注引用
- `https://mp.weixin.qq.com/...` 链接保留为可点击链接
- 代码块会渲染为公众号友好的样式和行号
- 支持注音语法，例如：
  - `世界{せかい}`
  - `小夜時雨{さ・よ・しぐれ}`

## Docker

### 构建镜像

```bash
docker build -t wx-md .
```

### 使用 docker-compose 启动

```bash
cd docker
docker-compose up -d
docker-compose logs -f
docker-compose down
```

默认映射端口 `8081:8081`。

## 常用脚本

- `pnpm --dir apps/api dev`：开发模式（nodemon + ts-node）
- `pnpm --dir apps/api build`：构建到 `dist`
- `pnpm --dir apps/api start`：生产模式运行 `dist`
- `pnpm --dir apps/api lint`：检查 `src`
- `pnpm --dir apps/api lint:tests`：检查 `spec`
- `pnpm --dir apps/api test`：监听模式测试
- `pnpm --dir apps/api test:no-reloading`：单次测试执行
- `pnpm --dir packages/cli cli -- ./path/to.md --theme chengxin --font cx`：运行独立 CLI（`md2weixin`）

## 项目结构（核心）

```txt
src/
  routes/index.ts              # /api/wx-md 接口
  services/wx/index.ts         # re-export md2weixin-core.getHtml
packages/
  core/                        # renderer/highlight/furigana 主实现
  cli/                         # 独立命令行工具（bin: md2weixin）
```

## 已知注意事项

- 仓库保留了 Express 模板自带的 `users` 示例 CRUD 接口；与 Markdown 转换能力无关。
