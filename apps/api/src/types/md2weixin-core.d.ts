declare module "md2weixin-core" {
  export const WX_DEFAULT_THEME: string;
  export const WX_DEFAULT_FONT: string;

  export type WxFont = "cx" | "no-cx";

  export interface WxRenderOptions {
    markdown: string;
    theme?: string;
    font?: WxFont | string;
  }

  export function normalizeRenderOptions(
    opts: WxRenderOptions
  ): Required<WxRenderOptions>;

  export function getHtml(opts?: WxRenderOptions): Promise<string>;
}
