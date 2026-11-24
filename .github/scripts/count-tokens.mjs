// Count tokens in every opinionated skill (skills/x-*/SKILL.md) and write one shields.io endpoint
// badge per skill, plus a Markdown summary for the PR comment.
//
// Usage: node .github/scripts/count-tokens.mjs <out-dir>
// Writes <out-dir>/<skill>-tokens.json, <out-dir>/gist-patch.json and <out-dir>/summary.md.

import { encoding_for_model } from "tiktoken";
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const COLOR_SCALE_MAX_TOKENS = 3000;

const outDir = process.argv[2];
if (!outDir) {
    console.error("usage: node count-tokens.mjs <out-dir>");
    process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const encoding = encoding_for_model("gpt-5");
const skillNames = readdirSync("skills")
    .filter((name) => name.startsWith("x-") && existsSync(join("skills", name, "SKILL.md")))
    .sort();

// Same scale the badges have always used: green at 0 tokens, red at 3000+.
function badgeColor(tokenCount) {
    const fraction = Math.min(tokenCount / COLOR_SCALE_MAX_TOKENS, 1);
    return `hsl(${Math.round(120 * (1 - fraction))}, 100%, 40%)`;
}

function statusDot(tokenCount) {
    if (tokenCount < 1000) return "🟢";
    if (tokenCount < 2000) return "🟡";
    return "🔴";
}

const gistFiles = {};
const summaryLines = ["**Token count per skill:**"];
for (const skillName of skillNames) {
    const tokenCount = encoding.encode(readFileSync(join("skills", skillName, "SKILL.md"), "utf8")).length;
    const badge = {
        schemaVersion: 1,
        label: `${skillName[0].toUpperCase()}${skillName.slice(1)} Tokens`,
        message: String(tokenCount),
        color: badgeColor(tokenCount),
    };
    const badgeFileName = `${skillName}-tokens.json`;
    writeFileSync(join(outDir, badgeFileName), JSON.stringify(badge));
    gistFiles[badgeFileName] = { content: JSON.stringify(badge) };
    summaryLines.push(`${statusDot(tokenCount)} ${skillName}: ${tokenCount} tokens`);
    console.log(`${skillName}: ${tokenCount} tokens`);
}
encoding.free();

writeFileSync(join(outDir, "gist-patch.json"), JSON.stringify({ files: gistFiles }));
writeFileSync(join(outDir, "summary.md"), `${summaryLines.join("\n")}\n`);
