import marked from "marked";
import { highlightHtml } from "./wx/highlight";
import { WxRenderer } from "./wx/renderer";

export const WX_DEFAULT_THEME = "default";
export const WX_DEFAULT_FONT = "cx";
const DEFAULT_MARKDOWN = "请输入 markdown 内容";

export type WxFont = "cx" | "no-cx";

export interface WxRenderOptions {
  markdown: string;
  theme?: string;
  font?: WxFont | string;
}

export function normalizeRenderOptions(
  opts: WxRenderOptions
): Required<WxRenderOptions> {
  const markdown = opts.markdown ?? "";
  const theme = opts.theme?.trim() || WX_DEFAULT_THEME;
  const font = opts.font === "no-cx" ? "no-cx" : WX_DEFAULT_FONT;

  return {
    markdown,
    theme,
    font,
  };
}

export async function getHtml(
  opts: WxRenderOptions = { markdown: DEFAULT_MARKDOWN }
): Promise<string> {
  const { font, theme, markdown: md } = normalizeRenderOptions({
    markdown: opts.markdown ?? DEFAULT_MARKDOWN,
    theme: opts.theme,
    font: opts.font,
  });

  // @ts-ignore
  const wxRenderer = new WxRenderer();
  let output = marked(md, { renderer: wxRenderer.getRenderer() });
  if (wxRenderer.hasFootnotes()) {
    // 去除第一行的 margin-top
    // @ts-ignore
    output = output.replace(/(style=".*?)"/, '$1;margin-top: 0"');
    // 引用注脚
    output += wxRenderer.buildFootnotes();
    // 附加的一些 style
    output += wxRenderer.buildAddition();
  }

  return highlightHtml(output, theme, font);
}
