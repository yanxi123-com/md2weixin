import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { WX_INLINE_CSS_OPTIONS } = require("../dist/wx/inlineOptions.js");

function transformFurigana(source) {
  return source
    .replace(/^\/\/ @ts-nocheck\s*/m, "")
    .replace(
      /export const FuriganaMD = createFuriganaMD\(\);\s*$/,
      "const FuriganaMD = createFuriganaMD();"
    )
    .trim();
}

function transformRenderer(source) {
  return source
    .replace(/^\/\/ @ts-nocheck\s*/m, "")
    .replace(/^import .*\n/gm, "")
    .replace(/export const WxRenderer = function \(\) {/, "const WxRenderer = function () {")
    .trim();
}

const furiganaSource = readFileSync("src/wx/FuriganaMD.ts", "utf8");
const rendererSource = readFileSync("src/wx/renderer.ts", "utf8");

const browserBundle = `(function (global) {
  "use strict";

${transformFurigana(furiganaSource)}

${transformRenderer(rendererSource)}

  function renderWechatMarkdown(source) {
    const wxRenderer = new WxRenderer();
    let output = marked(source, { renderer: wxRenderer.getRenderer() });
    if (wxRenderer.hasFootnotes()) {
      output = output.replace(/(style=".*?)"/, '$1;margin-top: 0"');
      output += wxRenderer.buildFootnotes();
      output += wxRenderer.buildAddition();
    }
    return output;
  }

  function runWechatPrettyPrint() {
    if (global.PR && typeof global.PR.prettyPrint === "function") {
      global.PR.prettyPrint();
    }
  }

  function extractWechatCssRules() {
    const rules = [];
    if (!global.document || !global.document.styleSheets) {
      return "";
    }

    for (const sheet of global.document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule instanceof global.CSSStyleRule || rule instanceof global.CSSMediaRule) {
            rules.push(rule.cssText);
          }
        }
      } catch (err) {
        // Ignore cross-origin or inaccessible stylesheets.
      }
    }

    return rules.join("\\n");
  }

  function exportWechatHtml(rootId) {
    const id = rootId || "md-root";
    if (!global.document) {
      return "";
    }

    const root = global.document.getElementById(id);
    if (!root) {
      return "";
    }

    if (typeof global.inlineCss !== "function") {
      return root.outerHTML;
    }

    const cssText = extractWechatCssRules();
    return global.inlineCss(root.outerHTML, cssText);
  }

  global.MD2WEIXIN_INLINE_OPTIONS = ${JSON.stringify(
    WX_INLINE_CSS_OPTIONS,
    null,
    2
  )};
  global.FuriganaMD = FuriganaMD;
  global.WxRenderer = WxRenderer;
  global.renderWechatMarkdown = renderWechatMarkdown;
  global.runWechatPrettyPrint = runWechatPrettyPrint;
  global.extractWechatCssRules = extractWechatCssRules;
  global.exportWechatHtml = exportWechatHtml;
})(typeof globalThis !== "undefined" ? globalThis : window);
`;

mkdirSync("dist/browser", { recursive: true });
writeFileSync("dist/browser/wx-renderer.js", browserBundle, "utf8");
