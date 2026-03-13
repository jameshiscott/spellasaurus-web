#!/usr/bin/env node
/**
 * Spellasaurus Health Check
 *
 * Runs type-check + lint + unit tests, then outputs a structured markdown
 * report categorising each failure as a Frontend (FE) or Backend (BE) issue.
 *
 * Usage:
 *   node scripts/check.mjs              # print to stdout
 *   node scripts/check.mjs --out        # also write report.md
 *
 * The tester agent runs this, then pastes the relevant section into the
 * FE or BE agent conversation.
 */

import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const writeReport = process.argv.includes("--out");

const FE_PATHS = ["src/app", "src/components", "src/hooks", "src/lib/utils"];
const BE_PATHS = ["src/app/api", "src/lib/supabase", "src/services", "supabase"];

function run(cmd) {
  try {
    const output = execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: "pipe" });
    return { ok: true, output };
  } catch (err) {
    return { ok: false, output: err.stdout ?? "", stderr: err.stderr ?? "" };
  }
}

function classify(line) {
  if (BE_PATHS.some((p) => line.includes(p))) return "BE";
  if (FE_PATHS.some((p) => line.includes(p))) return "FE";
  return "UNKNOWN";
}

function parseErrors(raw) {
  const lines = raw.split("\n").filter(Boolean);
  const fe = [];
  const be = [];
  const unknown = [];
  let current = null;

  for (const line of lines) {
    const cat = classify(line);
    if (line.match(/error TS\d+|Error:|✗|FAIL/)) {
      current = { line, context: [] };
      if (cat === "BE") be.push(current);
      else if (cat === "FE") fe.push(current);
      else unknown.push(current);
    } else if (current) {
      current.context.push(line);
    }
  }
  return { fe, be, unknown };
}

const checks = [
  { name: "TypeScript", cmd: "npx tsc --noEmit 2>&1" },
  { name: "ESLint", cmd: "npx next lint --format compact 2>&1" },
  { name: "Unit tests", cmd: "npx vitest run --reporter=verbose 2>&1" },
];

const now = new Date().toISOString();
const results = [];

console.log("🦕 Spellasaurus Health Check\n");

for (const check of checks) {
  process.stdout.write(`Running ${check.name}... `);
  const result = run(check.cmd);
  console.log(result.ok ? "✅ Pass" : "❌ Fail");
  results.push({ ...check, ...result });
}

// ── Build report ────────────────────────────────────────────────────────────

const lines = [
  `# Spellasaurus Health Check — ${now}`,
  "",
  "## Summary",
  "",
  "| Check | Status |",
  "|-------|--------|",
  ...results.map((r) => `| ${r.name} | ${r.ok ? "✅ Pass" : "❌ Fail"} |`),
  "",
];

const allFailed = results.filter((r) => !r.ok);

if (allFailed.length === 0) {
  lines.push("All checks passed — nothing to action.");
} else {
  const allFE = [];
  const allBE = [];
  const allUnknown = [];

  for (const failed of allFailed) {
    const combined = (failed.output ?? "") + (failed.stderr ?? "");
    const { fe, be, unknown } = parseErrors(combined);
    allFE.push(...fe.map((e) => ({ check: failed.name, ...e })));
    allBE.push(...be.map((e) => ({ check: failed.name, ...e })));
    allUnknown.push(...unknown.map((e) => ({ check: failed.name, ...e })));
  }

  if (allFE.length > 0) {
    lines.push("## 🎨 Frontend (FE) Issues", "");
    lines.push("> Paste this section into the **Frontend agent** conversation.", "");
    for (const e of allFE) {
      lines.push(`### [${e.check}] ${e.line}`);
      if (e.context.length) lines.push("```", ...e.context.slice(0, 5), "```");
      lines.push("");
    }
  }

  if (allBE.length > 0) {
    lines.push("## ⚙️ Backend (BE) Issues", "");
    lines.push("> Paste this section into the **Backend agent** conversation.", "");
    for (const e of allBE) {
      lines.push(`### [${e.check}] ${e.line}`);
      if (e.context.length) lines.push("```", ...e.context.slice(0, 5), "```");
      lines.push("");
    }
  }

  if (allUnknown.length > 0) {
    lines.push("## ❓ Unclassified Issues", "");
    for (const e of allUnknown) {
      lines.push(`### [${e.check}] ${e.line}`);
      if (e.context.length) lines.push("```", ...e.context.slice(0, 5), "```");
      lines.push("");
    }
  }

  // Raw output for context
  lines.push("---", "## Raw output", "");
  for (const failed of allFailed) {
    lines.push(`<details><summary>${failed.name}</summary>`, "");
    lines.push("```");
    lines.push(((failed.output ?? "") + (failed.stderr ?? "")).slice(0, 4000));
    lines.push("```", "</details>", "");
  }
}

const report = lines.join("\n");
console.log("\n" + report);

if (writeReport) {
  const outPath = join(ROOT, "test-report.md");
  writeFileSync(outPath, report, "utf8");
  console.log(`\nReport written to ${outPath}`);
}

process.exit(allFailed.length > 0 ? 1 : 0);
