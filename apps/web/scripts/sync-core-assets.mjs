import { copyFileSync, cpSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const coreDist = resolve(__dirname, "../../../packages/core/dist");
const markedDir = dirname(require.resolve("marked/package.json"));
const vueDir = dirname(require.resolve("vue/package.json"));
const axiosDir = dirname(require.resolve("axios/package.json"));
const jqueryDir = dirname(require.resolve("jquery/package.json"));
const elementUiDir = dirname(require.resolve("element-ui/package.json"));

const fileMappings = [
  {
    sourcePath: resolve(coreDist, "browser/wx-renderer.js"),
    targetPath: resolve(__dirname, "../src/assets/scripts/renderers/wx-renderer.js"),
  },
  {
    sourcePath: resolve(coreDist, "assets/app.css"),
    targetPath: resolve(__dirname, "../src/assets/css/app.css"),
  },
  {
    sourcePath: resolve(coreDist, "assets/themes.css"),
    targetPath: resolve(__dirname, "../src/assets/css/themes.css"),
  },
  {
    sourcePath: resolve(coreDist, "assets/prettify/github-v2.min.css"),
    targetPath: resolve(
      __dirname,
      "../src/libs/prettify/color-themes/github-v2.min.css"
    ),
  },
  {
    sourcePath: resolve(coreDist, "assets/scripts/prettify.min.js"),
    targetPath: resolve(__dirname, "../src/assets/scripts/prettify.min.js"),
  },
  {
    sourcePath: resolve(coreDist, "assets/scripts/juice.js"),
    targetPath: resolve(__dirname, "../src/assets/scripts/juice.js"),
  },
  {
    sourcePath: resolve(markedDir, "marked.min.js"),
    targetPath: resolve(__dirname, "../src/assets/scripts/marked.min.js"),
  },
  {
    sourcePath: resolve(vueDir, "dist/vue.min.js"),
    targetPath: resolve(__dirname, "../src/assets/vendor/vue.min.js"),
  },
  {
    sourcePath: resolve(axiosDir, "dist/axios.min.js"),
    targetPath: resolve(__dirname, "../src/assets/vendor/axios.min.js"),
  },
  {
    sourcePath: resolve(jqueryDir, "dist/jquery.min.js"),
    targetPath: resolve(__dirname, "../src/assets/vendor/jquery.min.js"),
  },
  {
    sourcePath: resolve(elementUiDir, "lib/index.js"),
    targetPath: resolve(__dirname, "../src/assets/vendor/element-ui/index.js"),
  },
];

for (const { sourcePath, targetPath } of fileMappings) {
  mkdirSync(dirname(targetPath), { recursive: true });
  copyFileSync(sourcePath, targetPath);
}

cpSync(
  resolve(elementUiDir, "lib/theme-chalk"),
  resolve(__dirname, "../src/assets/vendor/element-ui/theme-chalk"),
  { recursive: true, force: true }
);
