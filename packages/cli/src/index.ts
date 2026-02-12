#!/usr/bin/env node

import fs from "fs";
import path from "path";
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
  -h, --help    Show help
`;

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

  const markdown = fs.readFileSync(mdPath, "utf-8");
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
