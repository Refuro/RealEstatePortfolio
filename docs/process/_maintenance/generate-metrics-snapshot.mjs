/**
 * Prints a markdown snippet with approximate Vitest file counts and route surface.
 * Matches Vitest `include` in app/vitest.config.ts (manual sync if patterns change).
 * Run from repo root: node docs/process/_maintenance/generate-metrics-snapshot.mjs
 * Or from app/: npm run docs:metrics
 */
import fs from "fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORTFOLIO_ROOT = path.resolve(__dirname, "..", "..", "..");
const APP_ROOT = path.join(PORTFOLIO_ROOT, "app");
const APP_ROUTER_ROOT = path.join(APP_ROOT, "app");

/** @vitest/config include arrays — keep aligned with app/vitest.config.ts */
const VITEST_PATTERNS = [
  { label: "`lib/**/*.test.ts`", relDir: "lib", suffix: ".test.ts" },
  { label: "`app/**/*.test.ts`", relDir: "app", suffix: ".test.ts" },
  {
    label: "`components/**/*.test.tsx`",
    relDir: "components",
    suffix: ".test.tsx",
  },
];

function norm(p) {
  return path.normalize(p).replace(/\\/g, "/");
}

function* walkFiles(rootDir, pred) {
  if (!fs.existsSync(rootDir)) return;
  const stack = [rootDir];
  while (stack.length) {
    const d = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        if (
          e.name === "node_modules" ||
          e.name === ".next" ||
          e.name === "coverage"
        ) {
          continue;
        }
        stack.push(full);
      } else if (pred(full)) {
        yield full;
      }
    }
  }
}

function collectTestFiles(relDir, suffix) {
  const base = path.join(APP_ROOT, relDir.replace(/\//g, path.sep));
  return [...walkFiles(base, (p) => p.endsWith(suffix))].sort((a, b) =>
    a.localeCompare(b)
  );
}

/** Rough count of runnable cases — regex over source; excludes `describe`, over-counts uncommon patterns. */
function approxTestCasesInFile(absPath) {
  let raw;
  try {
    raw = fs.readFileSync(absPath, "utf8");
  } catch {
    return 0;
  }
  let n = 0;
  const re = /\b(?:it|test)\s*\(/g;
  while (re.exec(raw) !== null) n++;
  return n;
}

function routeSurfaceFromAppRouter() {
  const names = new Set();
  if (!fs.existsSync(APP_ROUTER_ROOT)) return [];
  for (const full of walkFiles(APP_ROUTER_ROOT, (p) =>
    /(^|[\\/])(page\.tsx|route\.ts)$/.test(p)
  )) {
    const rel = norm(path.relative(APP_ROUTER_ROOT, full));
    const trimmed = rel.replace(/\/(?:page\.tsx|route\.ts)$/, "");
    names.add(trimmed === "" ? "/" : `/${trimmed}`);
  }
  return [...names].sort((a, b) => a.localeCompare(b, "en"));
}

const dated = new Date().toISOString().slice(0, 10);
const buckets = [];
let totalFiles = 0;
let totalApproxCases = 0;

for (const { label, relDir, suffix } of VITEST_PATTERNS) {
  const files = collectTestFiles(relDir, suffix);
  const cases = files.reduce((s, f) => s + approxTestCasesInFile(f), 0);
  buckets.push({ label, files: files.length, cases });
  totalFiles += files.length;
  totalApproxCases += cases;
}

const routes = routeSurfaceFromAppRouter();

const md = [];
md.push(`## Metrics snapshot (${dated})`);
md.push("");
md.push(
  "_Vitest counts are **static**: file totals match globs used in \`app/vitest.config.ts\`; **Approx test cases** = count of \`it(\` plus \`test(\` occurrences across those files (fast regex — may differ slightly from Vitest’s runner)._"
);
md.push("");
md.push("| Pattern | Files | Approx cases (it + test) |");
md.push("|--------|------:|-------------------------:|");
for (const b of buckets) {
  md.push(`| ${b.label} | ${b.files} | ${b.cases} |`);
}
md.push(`| **Total** | **${totalFiles}** | **${totalApproxCases}** |`);
md.push("");
md.push(
  "_Re-verify precisely: from `RealEstatePortfolio/app/`, run `npm run test` (Vitest prints the real test count)._"
);
md.push("");
md.push(`### App Router surfaces (files: \`page.tsx\` / \`route.ts\` under \`app/app/\`)`);
md.push("");
md.push(`_${routes.length} paths (leading \`/\` is URL-ish; parallel routes and groups retained in path)._`);
md.push("");
md.push("<details>");
md.push("<summary>Route-ish paths</summary>");
md.push("");
md.push("");
for (const r of routes) md.push(`- \`${r}\``);
md.push("");
md.push("</details>");
md.push("");

console.log(md.join("\n"));
