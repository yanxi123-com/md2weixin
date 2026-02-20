#!/usr/bin/env node

import { APIError, COZE_CN_BASE_URL, CozeAPI } from "@coze/api";

const DEFAULT_WORKFLOW_ID = "7608985382533005339";

interface IArgs {
  prompt: string;
}

interface ICozeConfig {
  apiKey: string;
  baseUrl: string;
  workflowId: string;
  botId?: string;
  appId?: string;
}

const HELP_TEXT = `Usage:
  gencover --prompt <prompt>

Options:
  --prompt      Prompt text for cover image generation
  -v, --version Show version
  -h, --help    Show help
`;

/**
 * 解析 gencover 参数并进行基础校验，避免无效请求直达远端 API。
 */
function parseArgs(argv: string[]): IArgs {
  let prompt = "";

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

  return { prompt };
}

/**
 * 读取 Coze Workflow 调用配置。
 */
function resolveCozeConfigFromEnv(): ICozeConfig {
  const apiKey = process.env.COZE_API_KEY || "";
  const baseUrl = process.env.COZE_API_BASE_URL || COZE_CN_BASE_URL;
  const workflowId =
    process.env.COZE_WORKFLOW_ID || process.env.COZE_COVER_WORKFLOW_ID || DEFAULT_WORKFLOW_ID;
  const botId = process.env.COZE_BOT_ID;
  const appId = process.env.COZE_APP_ID;

  if (!apiKey) {
    throw new Error(
      "Missing COZE_API_KEY. Please set your Coze Personal Access Token in environment variables.",
    );
  }

  try {
    const url = new URL(baseUrl);
    if (!url.protocol || !url.host) {
      throw new Error("invalid");
    }
  } catch {
    throw new Error(`Invalid COZE API base URL: ${baseUrl}`);
  }

  return { apiKey, baseUrl, workflowId, botId, appId };
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value.trim());
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function extractUrlDeep(value: unknown): string | null {
  if (typeof value === "string") {
    if (isHttpUrl(value)) {
      return value.trim();
    }

    const parsed = tryParseJson(value);
    if (parsed !== value) {
      return extractUrlDeep(parsed);
    }

    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const url = extractUrlDeep(item);
      if (url) {
        return url;
      }
    }
    return null;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const data = value as Record<string, unknown>;
  const priorityFields = ["image_url", "url", "data", "output", "content"];
  for (const key of priorityFields) {
    if (key in data) {
      const url = extractUrlDeep(data[key]);
      if (url) {
        return url;
      }
    }
  }

  for (const val of Object.values(data)) {
    const url = extractUrlDeep(val);
    if (url) {
      return url;
    }
  }

  return null;
}

function formatRunError(err: unknown): string {
  if (err instanceof APIError) {
    const statusText = err.status !== undefined ? `status: ${err.status}, ` : "";
    const codeText = err.code !== undefined && err.code !== null ? `code: ${err.code}, ` : "";
    const msg = err.msg || err.message || "unknown error";
    const logId = err.logid ? `, logid: ${err.logid}` : "";
    return `Coze Workflow 调用失败 (${statusText}${codeText}msg: ${msg}${logId})`;
  }

  if (err instanceof Error) {
    return `Coze Workflow 调用失败: ${err.message}`;
  }

  return `Coze Workflow 调用失败: ${String(err)}`;
}

/**
 * 调用 Coze Workflow，解析工作流返回中的图片 URL。
 */
async function genCover(options: IArgs) {
  const cozeConfig = resolveCozeConfigFromEnv();
  const client = new CozeAPI({
    token: cozeConfig.apiKey,
    baseURL: cozeConfig.baseUrl,
  });

  const request: {
    workflow_id: string;
    parameters: Record<string, string>;
    bot_id?: string;
    app_id?: string;
  } = {
    workflow_id: cozeConfig.workflowId,
    parameters: {
      Prompt: options.prompt,
    },
  };

  if (cozeConfig.botId) {
    request.bot_id = cozeConfig.botId;
  }

  if (cozeConfig.appId) {
    request.app_id = cozeConfig.appId;
  }

  let response: {
    data: string;
    execute_id: string;
    debug_url: string;
    msg: string;
  };
  try {
    response = await client.workflows.runs.create(request);
  } catch (err) {
    throw new Error(formatRunError(err));
  }

  if (response.msg) {
    throw new Error(`Coze Workflow 返回错误: ${response.msg}`);
  }

  const imageUrl = extractUrlDeep(response.data);
  if (!imageUrl) {
    throw new Error("工作流执行成功，但返回结果中未解析出图片 URL。请检查工作流输出字段。");
  }

  return {
    success: true,
    imageUrl,
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
          message,
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
