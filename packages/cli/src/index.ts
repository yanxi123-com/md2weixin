#!/usr/bin/env node

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getHtml } from "md2weixin-core";

interface IArgs {
  mdPath: string;
  theme?: string;
  font?: string;
}

const HELP_TEXT = `Usage:
  md2weixin <markdown-file-path> [--theme <theme>] [--font <font>]

Options:
  -t, --theme   Theme name
  -f, --font    Font class: cx | no-cx
  -v, --version Show version
  -h, --help    Show help
`;

/**
 * 借助 gray-matter 解析 front matter，仅返回正文内容。
 */
function getMarkdownContent(markdown: string): string {
  const normalized = markdown.replace(/^\uFEFF/, "");
  try {
    if (/^\+\+\+[ \t]*\r?\n/.test(normalized)) {
      return matter(normalized, { delimiters: "+++" }).content;
    }

    return matter(normalized).content;
  } catch {
    return normalized;
  }
}

function parseArgs(argv: string[]): IArgs {
  let mdPath = "";
  let theme: string | undefined;
  let font: string | undefined;

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

    if (arg === "-t" || arg === "--theme") {
      const val = argv[i + 1];
      if (!val || val.startsWith("-")) {
        throw new Error("Missing value for --theme");
      }
      theme = val;
      i += 1;
      continue;
    }

    if (arg === "-f" || arg === "--font") {
      const val = argv[i + 1];
      if (!val || val.startsWith("-")) {
        throw new Error("Missing value for --font");
      }
      font = val;
      i += 1;
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (!mdPath) {
      mdPath = arg;
      continue;
    }

    throw new Error(`Unexpected argument: ${arg}`);
  }

  if (!mdPath) {
    throw new Error("Missing markdown file path. Run with --help for usage.");
  }

  return { mdPath, theme, font };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const mdPath = path.resolve(process.cwd(), args.mdPath);
  if (!fs.existsSync(mdPath)) {
    throw new Error(`Markdown file not found: ${mdPath}`);
  }

  const markdown = getMarkdownContent(fs.readFileSync(mdPath, "utf-8"));
  const html = await getHtml({
    markdown,
    theme: args.theme,
    font: args.font,
  });

  process.stdout.write(html);
}

main().catch((err: Error) => {
  process.stderr.write(`${err.message}\n`);
  process.exit(1);
});
