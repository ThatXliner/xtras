#!/usr/bin/env node
// Count a skill's tokens by load level: description (every session),
// SKILL.md body (when the skill triggers), and each bundled file (only when opened).
//
// Usage: node count_tokens.mjs <skill-dir> [<skill-dir> ...]
//
// Uses tiktoken (o200k) when it can be resolved from the current directory
// (`npm i tiktoken` there for exact counts); otherwise estimates 4 chars/token.
// Claude's tokenizer differs from tiktoken, so treat the numbers as relative:
// compare before and after with the same counter, not against a hard limit.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { createRequire } from "node:module";

let encode;
let isExact = false;
try {
    const require = createRequire(join(process.cwd(), "noop.js"));
    const { get_encoding } = require("tiktoken");
    const encoding = get_encoding("o200k_base");
    encode = (text) => encoding.encode(text).length;
    isExact = true;
} catch {
    encode = (text) => Math.ceil(text.length / 4);
}

function splitFrontmatter(text) {
    const match = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match) return { description: "", body: text };
    const lines = match[1].split("\n");
    const start = lines.findIndex((line) => line.startsWith("description:"));
    if (start === -1) return { description: "", body: match[2] };
    const descriptionLines = [lines[start].replace(/^description:\s*[|>]?-?\s*/, "")];
    for (const line of lines.slice(start + 1)) {
        if (/^\S/.test(line)) break;
        descriptionLines.push(line.trim());
    }
    return { description: descriptionLines.join(" ").trim(), body: match[2] };
}

function listFiles(dir) {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (name.startsWith(".")) return [];
        return statSync(path).isDirectory() ? listFiles(path) : [path];
    });
}

const skillDirs = process.argv.slice(2);
if (skillDirs.length === 0) {
    console.error("usage: node count_tokens.mjs <skill-dir> [<skill-dir> ...]");
    process.exit(1);
}

for (const skillDir of skillDirs) {
    const skillPath = join(skillDir, "SKILL.md");
    if (!existsSync(skillPath)) {
        console.error(`${skillDir}: no SKILL.md`);
        process.exitCode = 1;
        continue;
    }
    const { description, body } = splitFrontmatter(readFileSync(skillPath, "utf8"));
    const bundled = listFiles(skillDir).filter(
        (path) => path !== skillPath && !path.endsWith("README.md") && /\.(md|txt|json|ya?ml)$/.test(path),
    );
    const approx = isExact ? "" : "≈";
    const labelWidth = Math.max("SKILL.md body".length, ...bundled.map((path) => relative(skillDir, path).length)) + 2;

    console.log(`\n${skillDir}${isExact ? "" : "  (estimated: tiktoken not found)"}`);
    console.log(`  every session   ${"description".padEnd(labelWidth)}${approx}${encode(description)}`);
    console.log(`  on trigger      ${"SKILL.md body".padEnd(labelWidth)}${approx}${encode(body)}`);
    for (const path of bundled) {
        console.log(`  when opened     ${relative(skillDir, path).padEnd(labelWidth)}${approx}${encode(readFileSync(path, "utf8"))}`);
    }
}
