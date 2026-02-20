#!/usr/bin/env node

const COVER_RATIO_MAP = {
  "16:9": "2560x1440",
  "9:16": "1440x2560",
  "1:1": "2048x2048",
  "4:3": "2560x1920",
} as const;

type CoverRatio = keyof typeof COVER_RATIO_MAP;

interface IArgs {
  prompt: string;
  ratio: CoverRatio;
  style: string;
}

const HELP_TEXT = `Usage:
  gencover --prompt <prompt> [--ratio <ratio>] [--style <style>]

Options:
  --prompt      Prompt text for cover image generation
  --ratio       Cover ratio: 16:9 | 9:16 | 1:1 | 4:3 (default: 16:9)
  --style       Cover style text (default: 写实风格)
  -v, --version Show version
  -h, --help    Show help
`;

/**
 * 解析 gencover 参数并进行基础校验，避免无效请求直达远端 API。
 */
function parseArgs(argv: string[]): IArgs {
  let prompt = "";
  let ratio: CoverRatio = "16:9";
  let style = "写实风格";

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "-h" || arg === "--help") {
      process.stdout.write(HELP_TEXT);
      process.exit(0);
    }

    if (arg === "-v" || arg === "--version") {
      const pkg = require("../package.json") as { version?: string };
      process.stdout.write(`${pkg.version || "unknown"}\n`);
      process.exit(0);
    }

    if (arg === "--") {
      continue;
    }

    if (arg === "--prompt") {
      const val = argv[i + 1];
      if (!val || val.startsWith("-")) {
        throw new Error("Missing value for --prompt");
      }
      prompt = val;
      i += 1;
      continue;
    }

    if (arg === "--ratio") {
      const val = argv[i + 1];
      if (!val || val.startsWith("-")) {
        throw new Error("Missing value for --ratio");
      }
      if (!(val in COVER_RATIO_MAP)) {
        throw new Error(`Invalid ratio: ${val}. Allowed: ${Object.keys(COVER_RATIO_MAP).join(", ")}`);
      }
      ratio = val as CoverRatio;
      i += 1;
      continue;
    }

    if (arg === "--style") {
      const val = argv[i + 1];
      if (!val || val.startsWith("-")) {
        throw new Error("Missing value for --style");
      }
      style = val;
      i += 1;
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    throw new Error(`Unexpected argument: ${arg}`);
  }

  if (!prompt || typeof prompt !== "string") {
    throw new Error("Missing prompt. Please pass --prompt <text>.");
  }

  if (prompt.length > 2000) {
    throw new Error("Prompt length cannot exceed 2000 characters.");
  }

  return { prompt, ratio, style };
}

/**
 * 调用 Coze 图像生成接口，返回统一结果结构。
 */
async function genCover(options: IArgs) {
  const { ImageGenerationClient, Config } = require("coze-coding-dev-sdk") as {
    ImageGenerationClient: new (config: unknown, headers?: Record<string, string>) => {
      generate: (params: {
        prompt: string;
        size: string;
        watermark: boolean;
        responseFormat: string;
      }) => Promise<unknown>;
      getResponseHelper: (response: unknown) => {
        success: boolean;
        imageUrls?: string[];
        errorMessages?: string[];
      };
    };
    Config: new () => unknown;
  };

  const size = COVER_RATIO_MAP[options.ratio];
  const enhancedPrompt = `${options.prompt}, ${options.style}, best quality, masterpiece`;
  const config = new Config();
  const client = new ImageGenerationClient(config);
  const response = await client.generate({
    prompt: enhancedPrompt,
    size,
    watermark: false,
    responseFormat: "url",
  });
  const helper = client.getResponseHelper(response);

  if (!helper.success) {
    const details = helper.errorMessages?.join(", ") || "unknown error";
    throw new Error(`图像生成失败: ${details}`);
  }

  const imageUrl = helper.imageUrls?.[0];
  if (!imageUrl) {
    throw new Error("图像生成失败: 未返回图片 URL");
  }

  return {
    success: true,
    image_url: imageUrl,
    prompt: options.prompt,
    ratio: options.ratio,
    style: options.style,
    size,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  try {
    const result = await genCover(args);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stdout.write(
      `${JSON.stringify(
        {
          success: false,
          error: message,
        },
        null,
        2,
      )}\n`,
    );
    process.exit(1);
  }
}

main().catch((err: Error) => {
  process.stderr.write(`${err.message}\n`);
  process.exit(1);
});
