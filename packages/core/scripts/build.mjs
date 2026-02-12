import { cpSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";

execSync("pnpm exec tsc -p tsconfig.json", { stdio: "inherit" });
mkdirSync("dist", { recursive: true });
cpSync("src/assets", "dist/assets", { recursive: true });
execSync("node ./scripts/build-browser-juice.mjs", { stdio: "inherit" });
execSync("node ./scripts/build-browser-renderer.mjs", { stdio: "inherit" });
