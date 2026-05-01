/**
 * One-off internal markdown link checker for Phase B doc cleanup.
 * Run from anywhere: node docs/process/_maintenance/check-doc-links.mjs
 * (cwd should be RealEstatePortfolio for consistent paths)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORTFOLIO_ROOT = path.resolve(__dirname, "..", "..", "..");
const DOCS_ROOT = path.join(PORTFOLIO_ROOT, "docs");

const INLINE_LINK = /!?\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const REF_LINK_DEF = /^\s*\[([^\]]+)\]:\s*(\S+)/gm;

const TIER1_REL = [
  "docs/README.md",
  "docs/audits/synthesis/README.md",
  "README.md",
  "docs/audits/README.md",
  "docs/cursor-agent-setup.md",
  "docs/tasks.md",
];

function norm(p) {
  return path.normalize(p).replace(/\\/g, "/");
}

function isExternal(href) {
  return (
    /^[a-z][a-z0-9+.-]*:/i.test(href) ||
    href.startsWith("//") ||
    href.startsWith("#")
  );
}

function stripAnchor(href) {
  const i = href.indexOf("#");
  return i === -1 ? href : href.slice(0, i);
}

function existsCaseSensitive(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  try {
    const names = fs.readdirSync(dir);
    return names.includes(base);
  } catch {
    return true;
  }
}

function resolveMarkdownTarget(fromFile, hrefRaw) {
  const href = stripAnchor(hrefRaw.trim());
  if (!href || href === "." || href === "..") return { kind: "skip" };
  if (isExternal(href)) return { kind: "external" };

  const fromDir = path.dirname(fromFile);
  const resolved = path.resolve(fromDir, href);
  const relToPortfolio = path.relative(PORTFOLIO_ROOT, resolved);
  const relNorm = norm(relToPortfolio);

  // Stay within portfolio tree for "internal doc" checks
  if (relNorm.startsWith("..")) {
    return { kind: "outside_portfolio", resolved, relNorm };
  }

  let filePath = resolved;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "README.md");
  } else if (!path.extname(filePath)) {
    if (fs.existsSync(filePath + ".md")) filePath = filePath + ".md";
    else if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "README.md");
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const isMd = ext === ".md" || ext === ".mdc";

  return {
    kind: "internal",
    resolved: filePath,
    relNorm: norm(path.relative(PORTFOLIO_ROOT, filePath)),
    isMd,
    hrefRaw,
  };
}

function collectLinks(filePath, text) {
  const links = [];
  let m;
  INLINE_LINK.lastIndex = 0;
  while ((m = INLINE_LINK.exec(text)) !== null) {
    links.push({ text: m[1], href: m[2], line: text.slice(0, m.index).split("\n").length });
  }
  REF_LINK_DEF.lastIndex = 0;
  while ((m = REF_LINK_DEF.exec(text)) !== null) {
    links.push({ text: m[1], href: m[2], line: null });
  }
  return links;
}

function isAmbiguousPattern(fromFile, href) {
  const fromNorm = norm(path.relative(DOCS_ROOT, fromFile));
  const inArchive =
    fromNorm.startsWith("archive/") || fromFile.includes(`${path.sep}archive${path.sep}`);
  if (inArchive && /^(docs\/|\.\/docs\/)/.test(href)) return "docs/-prefix from archive may resolve under archive/";
  if (/^\.cursor\/skills\//.test(href) && fromFile.includes("RealEstatePortfolio"))
    return ".cursor/skills under portfolio path — skills live at workspace .cursor/skills/";
  return null;
}

function priorityForSource(sourceRel) {
  const s = norm(sourceRel).replace(/^\/+/, "");
  if (s === "docs/README.md" || s === "docs/audits/synthesis/README.md") return "P0";
  const p1 =
    s === "README.md" ||
    s === "docs/audits/README.md" ||
    s === "docs/cursor-agent-setup.md" ||
    s === "docs/tasks.md" ||
    s.startsWith("docs/process/_maintenance/");
  if (p1) return "P1";
  if (s.startsWith("docs/archive/")) return "P2";
  return "P2";
}

function* walkMarkdownFiles(root) {
  const stack = [root];
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
      if (e.isDirectory()) stack.push(full);
      else if (/\.md$/i.test(e.name)) yield full;
    }
  }
}

// --- main ---
const seeds = TIER1_REL.map((r) => path.join(PORTFOLIO_ROOT, r.replace(/\//g, path.sep)));
const maintenanceDir = path.join(DOCS_ROOT, "process", "_maintenance");
for (const f of fs.readdirSync(maintenanceDir)) {
  if (f.endsWith(".md")) seeds.push(path.join(maintenanceDir, f));
}

const markdownUnderDocs = new Set([...walkMarkdownFiles(DOCS_ROOT)].map(norm));

const initialSeeds = [...new Set(seeds.map(norm))].filter((f) => fs.existsSync(f));
const toScan = new Set(initialSeeds);
const ordered = [...initialSeeds];

// BFS: from seeds, add every docs/**/*.md reachable via internal markdown links
let head = 0;
while (head < ordered.length) {
  const filePath = ordered[head++];
  if (!fs.existsSync(filePath)) continue;
  let text;
  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch {
    continue;
  }
  for (const { href } of collectLinks(filePath, text)) {
    const r = resolveMarkdownTarget(filePath, href);
    if (r.kind !== "internal" || !r.isMd) continue;
    if (!existsCaseSensitive(r.resolved)) continue;
    const n = norm(r.resolved);
    if (markdownUnderDocs.has(n) && !toScan.has(n)) {
      toScan.add(n);
      ordered.push(n);
    }
  }
}

const issues = [];
const seen = new Set();

for (const filePath of toScan) {
  if (!fs.existsSync(filePath)) continue;
  let text;
  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch {
    continue;
  }
  const sourceRel = norm(path.relative(PORTFOLIO_ROOT, filePath));
  for (const { text: linkText, href } of collectLinks(filePath, text)) {
    if (isExternal(href)) continue;
    const amb = isAmbiguousPattern(filePath, href.split("#")[0].trim());
    const r = resolveMarkdownTarget(filePath, href);
    if (r.kind === "external" || r.kind === "skip") continue;

    if (r.kind === "outside_portfolio") {
      const key = `${sourceRel}|${href}|outside`;
      if (seen.has(key)) continue;
      seen.add(key);
      issues.push({
        priority: priorityForSource(sourceRel),
        source: sourceRel,
        linkText: linkText.slice(0, 80),
        target: href,
        issue: `Resolves outside portfolio: ${r.relNorm}`,
      });
      continue;
    }

    const filePathTarget = r.resolved;
    const ext = path.extname(filePathTarget).toLowerCase();
    if (ext && ext !== ".md" && ext !== ".mdc") {
      if (existsCaseSensitive(filePathTarget)) continue;
    }

    if (!existsCaseSensitive(filePathTarget)) {
      const key = `${sourceRel}|${href}|missing`;
      if (seen.has(key)) continue;
      seen.add(key);
      issues.push({
        priority: priorityForSource(sourceRel),
        source: sourceRel,
        linkText: linkText.slice(0, 80),
        target: href,
        issue: "internal_missing: target file not found",
      });
      continue;
    }

    if (amb) {
      const key = `${sourceRel}|${href}|amb`;
      if (seen.has(key)) continue;
      seen.add(key);
      issues.push({
        priority: priorityForSource(sourceRel),
        source: sourceRel,
        linkText: linkText.slice(0, 80),
        target: href,
        issue: `suspicious: ${amb}`,
      });
    }

    // Anchor-only check: file exists; optional — skip to reduce noise
  }
}

// Orphans: docs/**/*.md never reached from tier-1 seeds-only BFS (same expansion rule as above)
const tier1Closure = new Set();
const tier1SeedsAll = [
  ...TIER1_REL.map((r) => norm(path.join(PORTFOLIO_ROOT, r.replace(/\//g, path.sep)))),
  ...fs
    .readdirSync(maintenanceDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => norm(path.join(maintenanceDir, f))),
];
const q2 = [...new Set(tier1SeedsAll)].filter((f) => fs.existsSync(f));
let h2 = 0;
while (h2 < q2.length) {
  const fp = q2[h2++];
  if (!fs.existsSync(fp)) continue;
  tier1Closure.add(fp);
  let t;
  try {
    t = fs.readFileSync(fp, "utf8");
  } catch {
    continue;
  }
  for (const { href } of collectLinks(fp, t)) {
    const r = resolveMarkdownTarget(fp, href);
    if (r.kind === "internal" && r.isMd && existsCaseSensitive(r.resolved)) {
      const n = norm(r.resolved);
      if (markdownUnderDocs.has(n) && !tier1Closure.has(n)) {
        tier1Closure.add(n);
        q2.push(n);
      }
    }
  }
}

let orphanCount = 0;
const orphanSample = [];
for (const md of markdownUnderDocs) {
  if (!tier1Closure.has(md)) {
    orphanCount++;
    if (orphanSample.length < 25) orphanSample.push(norm(path.relative(PORTFOLIO_ROOT, md)));
  }
}

const p0 = issues.filter((i) => i.priority === "P0");
const p1 = issues.filter((i) => i.priority === "P1");
const p2 = issues.filter((i) => i.priority === "P2");

const report = {
  runDate: new Date().toISOString().slice(0, 10),
  method: "Node script docs/process/_maintenance/check-doc-links.mjs (inline + ref links; BFS within docs from seeds)",
  portfolioRoot: norm(PORTFOLIO_ROOT),
  scannedFiles: toScan.size,
  tier1ClosureFiles: tier1Closure.size,
  orphanCount,
  orphanSample,
  counts: { P0: p0.length, P1: p1.length, P2: p2.length, total: issues.length },
  p0,
  p1,
  p2,
};

console.log(JSON.stringify(report, null, 2));
