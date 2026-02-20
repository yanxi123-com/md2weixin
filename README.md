# md2weixin

这是一套将 Markdown 转换为微信公众号可粘贴 HTML 的工具链，支持主题、字体、代码高亮和样式内联。

你可以把精力集中在内容创作上，而不是在公众号后台反复调样式。

[在线使用](https://yanxi123.com/md2wechat/)

## 功能亮点

- 支持有序列表和无序列表样式，减少在公众号后台被重置的问题
- 外链可自动转换为参考文献索引，并追加到文末
- 内置多种主题和字体组合
- 支持日语注音（假名）与汉语拼音样式
- 支持区别于微信默认样式的代码高亮主题

## 仓库说明（API / CLI / Web）

- `apps/web`：浏览器编辑器，适合手动编辑、实时预览和复制粘贴到公众号后台
- `apps/api`：Node.js API 服务，适合集成到后端系统或自动化流程
- `packages/cli`：命令行工具 `md2weixin`，适合脚本化批处理和 AI 调用
- `packages/core`：共享渲染核心，统一 API / CLI / Web 的渲染能力

## 使用前准备

- Node.js（建议 18+）
- pnpm（本仓库统一使用 pnpm）

```bash
npm install -g pnpm
pnpm install
```

## 1. CLI 安装与使用

### 方式 A：发布到 npm 后全局安装

```bash
npm install -g md2weixin
md2weixin ./article.md --theme chengxin --font cx > output.html
```

### 方式 B：在本仓库内直接使用

```bash
pnpm --silent cli -- ./article.md --theme chengxin --font cx > output.html
```

CLI 参数：

- `<markdown-file-path>`：必填，Markdown 文件路径
- `--theme` / `-t`：可选，主题名，默认 `default`
- `--font` / `-f`：可选，`cx` 或 `no-cx`，默认 `cx`

帮助：

```bash
md2weixin --help
```

## 2. 启动 API 服务（Node.js）并用 curl 测试

构建并启动 API（默认生产端口 `8081`）：

```bash
pnpm --dir apps/api build
pnpm --dir apps/api start
```

`curl` 测试（无需 token）：

```bash
curl -X POST http://localhost:8081/api/wx-md \
  -H "Content-Type: application/json" \
  -d '{"markdown":"## 示例\n\n这是一个示例","theme":"chengxin","font":"cx"}'
```

开发模式（默认端口 `3000`）：

```bash
pnpm --dir apps/api dev
```

## 3. 启动 Web（浏览器编辑器）

```bash
pnpm --dir apps/web start
```

然后打开：

- http://localhost:8086

说明：

- `start` 会先同步 core 资产与本地前端 vendor（renderer / css / prettify / juice / marked / vue / axios / element-ui / jquery）再启动静态服务。
- 若需要本地改 Less 并实时编译主题：

```bash
pnpm --dir apps/web start:with-less
```

- 构建静态产物到 `apps/web/dist`：

```bash
pnpm --dir apps/web build
pnpm --dir apps/web preview
```

## 项目结构

- `apps/api`: Node.js API
- `apps/web`: 浏览器编辑器
- `packages/core`: 共享渲染核心
- `packages/cli`: 独立 CLI（`md2weixin`）

## 致谢

本仓库的最初创意来源于 [zkqiang/wechat-mdeditor](https://github.com/zkqiang/wechat-mdeditor) 和 [lyricat/wechat-format](https://github.com/lyricat/wechat-format)，并在此基础上结合自用场景持续演进。

主题样式参考了 [Markdown 编辑器](https://markdown.com.cn/editor)。

感谢以上项目与作者的创意和贡献。

## 开源信息

- 协议：MIT
- 仓库：[https://github.com/yanxi123-com/md2weixin](https://github.com/yanxi123-com/md2weixin)
- 作者：[https://yanxi123.com/](https://yanxi123.com/)

## 开发文档

- `docs/DEVELOPER.md`

## Changelist

### v1.0.1（2026-02-20）

- CLI 在转换前会忽略 Markdown 文件开头的 front matter，仅处理正文内容。
- front matter 解析改为使用 `gray-matter`，提升 YAML/TOML 场景的兼容性与稳定性。
- 当 front matter 解析异常时，CLI 会自动回退为按原文继续转换，避免中断流程。
