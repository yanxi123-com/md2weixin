# 微信公众号 Markdown 编辑器

这款编辑器可以将 Markdown 转换成微信公众号编辑器的样式，可以直接复制到公众号后台。

这让你在公众号创作时，把更多的时间专注于文章本身，而不是繁琐地调整文章样式。

[在线使用](https://yanxi123.com/md2wechat/)

## 功能

- 支持序号列表和圆点列表，解决了样式会被重置的问题
- 外链会自动转换为参考文献索引，并且附在文章末尾
- 支持多种字体和样式
- 支持日语注音假名、汉语拼音样式
- 支持不同于微信的代码配色方案

## Github 源码

[本仓库](https://github.com/yanxi123-com/md2wechat) Fork 自 [zkqiang/wechat-mdeditor](https://github.com/zkqiang/wechat-mdeditor) 和 [lyricat/wechat-format](https://github.com/lyricat/wechat-format)，并根据自用需求进行修改开发。

主题样式参考 [Markdown 编辑器](https://markdown.com.cn/editor)。

感谢他们的创意和贡献！

## 开发

```
yarn start
```

## 更新记录

- 2024-09-17
  - 由于公众号不支持锚链接，自动去掉锚链接，只保留文字
  - 增加 17 个新的主题样式，参考 [Markdown.com.cn](https://markdown.com.cn)
  - 修改样式,可以进入/md2wechat/src/assets/less/themes/目录下修改
- 2024-01-01
  - 上线 [微信公众号 Markdown 编辑器](https://yanxi123.com/md2wechat/)
  
