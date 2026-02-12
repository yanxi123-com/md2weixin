import fs from "fs";
import { JSDOM } from "jsdom";
import path from "path";
import juice from "juice";
import { WX_INLINE_CSS_OPTIONS } from "./inlineOptions";

const prettifyJs = fs.readFileSync(
  path.resolve(__dirname, "../assets/scripts/prettify.min.js"),
  "utf8"
);

const appStyle = fs.readFileSync(
  path.resolve(__dirname, "../assets/app.css"),
  "utf8"
);
const prettifyStyle = fs.readFileSync(
  path.resolve(__dirname, "../assets/prettify/github-v2.min.css"),
  "utf8"
);
const themeStyle = fs.readFileSync(
  path.resolve(__dirname, "../assets/themes.css"),
  "utf8"
);

export function highlightHtml(
  html: string,
  theme: string = "default",
  fontClass: string = "cx"
) {
  const rootId = "md-root";
  if (!["cx", "no-cx"].includes(fontClass)) {
    fontClass = "no-cx";
  }
  const dom = new JSDOM(
    `<section id="${rootId}" class="themes ${theme} fonts-${fontClass}">${html}</section>`,
    { runScripts: "dangerously", resources: "usable" }
  );

  dom.window.eval(prettifyJs);
  dom.window.PR.prettyPrint();

  const container = dom.window.document.getElementById(rootId);

  const oldHtml = `<style>
                    ${appStyle}
                    ${themeStyle}
                    ${prettifyStyle}
                  </style>
                  ${container!.outerHTML}`;
  return juice(oldHtml, { ...WX_INLINE_CSS_OPTIONS }).trim();
}
