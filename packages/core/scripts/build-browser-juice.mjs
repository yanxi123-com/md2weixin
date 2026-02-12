import { execSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const tmpDir = mkdtempSync(path.join(tmpdir(), "md2weixin-juice-"));
const entryPath = path.join(tmpDir, "entry.js");
const outputPath = "dist/assets/scripts/juice.js";
const juiceClientPath = require.resolve("juice-browser/client");

const entryContent = `"use strict";

const juice = require(${JSON.stringify(juiceClientPath)});
const fallbackInlineOptions = {
  applyStyleTags: true,
  removeStyleTags: true,
  preserveMediaQueries: false,
  preserveFontFaces: false,
  applyWidthAttributes: false,
  applyHeightAttributes: false,
  applyAttributesTableElements: false,
  inlinePseudoElements: true,
  xmlMode: false,
  preserveImportant: false,
};

window.inlineCss = function (html, style) {
  const inlineOptions = window.MD2WEIXIN_INLINE_OPTIONS || fallbackInlineOptions;
  return juice(\`<style>\${style}</style>\${html}\`, inlineOptions);
};
`;

try {
  writeFileSync(entryPath, entryContent, "utf8");
  mkdirSync(path.dirname(outputPath), { recursive: true });
  execSync(`pnpm exec browserify "${entryPath}" -o "${outputPath}"`, {
    stdio: "inherit",
  });
} finally {
  rmSync(tmpDir, { recursive: true, force: true });
}
