# Agent 指引

- **语言**：所有回答使用中文。
- **必读**：动手前先看项目根目录 `README.md`。以下摘要与 README 一致；若 README 中约定或命令有变更，请同步更新本文件。
- **何时改代码**：**直接下命令**（如「把 X 改成 Y」）时，若无疑问可直接改，若有疑问先询问、明确后再改；**讨论方案**时，在用户确认方案之前不要改代码，先讨论、再动手。

## 开发约定（摘要）

- 需要文档/函数注释，突出重点即可。

## 常用命令（摘录）

- `node packages/cli/dist/index.js extract-xml <billdef.xml> --out <output.json>`：提取旧 BillDef XML 为 DSL + IR。
- `node packages/cli/dist/index.js gen-apollo <ir-or-extract.json> --profile <profile.json> --out-dir <outputDir>`：基于 IR 与 Profile 生成 Apollo 代码。

## Git 提交

- 提交信息使用中文；首行摘要；空一行；再用列表写改动要点（每行一条）。
- 默认只提交本次 session 相关改动，避免夹带无关文件或未跟踪目录。
- 提交信息换行：在 `-m "..."` 内直接输入换行（不要写 `\n` 字面量），例如：

```bash
git commit -m "这是摘要

- 改动点1
- 改动点2"
```
