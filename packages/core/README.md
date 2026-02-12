# md2weixin-core

Shared core package for Markdown -> WeChat HTML rendering.

Current capabilities:

- shared option contracts and normalization
- `getHtml` full render chain for Node (format -> marked renderer -> highlight -> inline styles)
- shared `renderer` / `FuriganaMD` implementation
- shared inline-css options for Node and browser paths
- browser renderer bundle output: `dist/browser/wx-renderer.js`
- browser `juice.js` is generated during build from dependency (`juice-browser`)

Next stage:

- keep converging browser and Node highlight/inlining path
