import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const version = args.find((arg) => !arg.startsWith("--"));

if (!version) {
  console.error(
    "Usage: pnpm release:version <version> [--dry-run]\nExample: pnpm release:version 0.2.0"
  );
  process.exit(1);
}

const semverPattern =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
if (!semverPattern.test(version)) {
  console.error(`Invalid semver version: ${version}`);
  process.exit(1);
}

function collectWorkspacePackageJson(baseDir) {
  const basePath = resolve(process.cwd(), baseDir);
  if (!existsSync(basePath)) {
    return [];
  }

  return readdirSync(basePath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => resolve(basePath, entry.name, "package.json"))
    .filter((packageJsonPath) => existsSync(packageJsonPath));
}

const packageJsonPaths = [
  resolve(process.cwd(), "package.json"),
  ...collectWorkspacePackageJson("apps"),
  ...collectWorkspacePackageJson("packages"),
];

let updatedCount = 0;

for (const packageJsonPath of packageJsonPaths) {
  const content = readFileSync(packageJsonPath, "utf8");
  const pkg = JSON.parse(content);
  const oldVersion = pkg.version;

  if (!oldVersion || oldVersion === version) {
    continue;
  }

  pkg.version = version;
  updatedCount += 1;

  if (!dryRun) {
    writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
  }

  console.log(`${dryRun ? "[dry-run] " : ""}${packageJsonPath}: ${oldVersion} -> ${version}`);
}

console.log(
  `${dryRun ? "Would update" : "Updated"} ${updatedCount} package.json file(s) to ${version}.`
);
