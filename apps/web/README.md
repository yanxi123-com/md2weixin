# 微信公众号 Markdown 编辑器

这款编辑器可以将 Markdown 转换成微信公众号编辑器的样式，可以直接复制到公众号后台。

这让你在公众号创作时，把更多的时间专注于文章本身，而不是繁琐地调整文章样式。

[在线使用](https://yanxi123.com/md2weixin/)

## 功能

- 支持序号列表和圆点列表，解决了样式会被重置的问题
- 外链会自动转换为参考文献索引，并且附在文章末尾
- 支持多种字体和样式
- 支持日语注音假名、汉语拼音样式
- 支持不同于微信的代码配色方案

## Github 源码

[本仓库](https://github.com/yanxi123-com/md2weixin) Fork 自 [zkqiang/wechat-mdeditor](https://github.com/zkqiang/wechat-mdeditor) 和 [lyricat/wechat-format](https://github.com/lyricat/wechat-format)，并根据自用需求进行修改开发。

主题样式参考 [Markdown 编辑器](https://markdown.com.cn/editor)。

感谢他们的创意和贡献！

## 开发

```
pnpm start
```

`pnpm start` 会先同步本地依赖与 `packages/core` 构建产物（`wx-renderer.js`、主题样式、prettify、juice）及前端 vendor（`marked`、`vue`、`axios`、`element-ui`、`jquery`）到 `apps/web/src/`，再启动 web。

这些同步文件不作为源码维护（已在 `.gitignore` 中忽略），以 `packages/core` 为单一来源。

如果你要本地改 Less 并实时编译，可以使用：

```bash
pnpm start:with-less
```

构建静态文件（输出到 `dist/`）：

```bash
pnpm build
pnpm preview
```

## 更新记录

- 2024-09-17
  - 由于公众号不支持锚链接，自动去掉锚链接，只保留文字
  - 增加 17 个新的主题样式，参考 [Markdown.com.cn](https://markdown.com.cn)
- 2024-01-01
  - 上线 [微信公众号 Markdown 编辑器](https://yanxi123.com/md2weixin/)
