#!/usr/bin/env node
// Read-only audit of git leftovers. Prints each finding with a verdict and the exact command for it.
//   safe: provably on GitHub or already applied, delete it.
//   save: exists only locally, push it (never force).
//   hold: needs a person, for example uncommitted work, recent activity, or a diverged branch.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { homedir, tmpdir } from "node:os";

const RECENT_HOURS = 24;
// Ignored paths that a build or install recreates. Any other ignored file (.env, local settings) may exist nowhere else.
const DISPOSABLE = new Set(["node_modules", ".next", ".expo", ".turbo", ".cache", ".venv", "venv", "__pycache__", ".pytest_cache", ".mypy_cache", ".ruff_cache", "dist", "build", "out", "target", "coverage", "test-results", "playwright-report", ".gradle", "Pods", "DerivedData", ".DS_Store", ".parcel-cache", ".svelte-kit", ".vercel", ".wrangler", ".wxt", ".output"]);
const isCacheDir = (part) => part === ".cache" || /^\..*_cache$/.test(part) || part === "__pycache__";
const GENERATED_SUFFIXES = ["src-tauri/gen/schemas"];
// Ignored files up to this size are archived before their worktree goes; anything bigger needs a person.
const ARCHIVE_LIMIT_KB = 200 * 1024;
const BACKUP_DIR = join(homedir(), ".repo-hygiene", "backups", new Date().toISOString().slice(0, 10));
const args = process.argv.slice(2);
const json = args.includes("--json");
const freedFrom = args.includes("--freed") ? args[args.indexOf("--freed") + 1] : null;
const fetch = !args.includes("--no-fetch");
const roots = args.filter((a) => !a.startsWith("--") && a !== freedFrom).map((p) => resolve(p));
if (roots.length === 0) roots.push(process.cwd());

function git(cwd, argv, env) {
  return execFileSync("git", ["-C", cwd, ...argv], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    env: env ? { ...process.env, ...env } : process.env,
    maxBuffer: 64 * 1024 * 1024,
  }).trimEnd();
}
function tryGit(cwd, argv, env) {
  try {
    return git(cwd, argv, env);
  } catch {
    return null;
  }
}
const lines = (s) => (s ? s.split("\n").filter(Boolean) : []);
const q = (s) => (/^[\w./@{}:-]+$/.test(s) ? s : `'${s.replaceAll("'", `'\\''`)}'`);

function findRepos(root) {
  if (!existsSync(join(root, ".git"))) {
    return readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith("."))
      .map((d) => join(root, d.name))
      .filter((p) => existsSync(join(p, ".git")) && statSync(join(p, ".git")).isDirectory());
  }
  const common = git(root, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
  return [resolve(common, "..")];
}

function sizeKb(path) {
  try {
    return Number(execFileSync("du", ["-sk", path], { encoding: "utf8" }).split("\t")[0]);
  } catch {
    return 0;
  }
}
const hoursSince = (epochSeconds) => (Date.now() / 1000 - epochSeconds) / 3600;

function newestDirtyMtime(wt, status) {
  let newest = 0;
  for (const line of status) {
    const file = join(wt, line.slice(3).split(" -> ").pop().replace(/^"|"$/g, ""));
    try {
      newest = Math.max(newest, statSync(file).mtimeMs / 1000);
    } catch {}
  }
  return newest;
}

// Ignored files a worktree would take with it, minus build output and copies the main checkout already has.
function unrecoverableIgnored(wt, mainPath) {
  return lines(tryGit(wt, ["status", "--porcelain", "--ignored=matching", "--untracked-files=all"]))
    .filter((l) => l.startsWith("!! "))
    .map((l) => l.slice(3).replace(/^"|"$/g, ""))
    .filter((rel) => {
      const path = rel.replace(/\/$/, "");
      const parts = path.split("/");
      const name = parts.at(-1);
      if (DISPOSABLE.has(name) && (rel.endsWith("/") || name === ".DS_Store")) return false;
      if (name.endsWith(".egg-info") || parts.some(isCacheDir)) return false;
      return !GENERATED_SUFFIXES.some((suffix) => path === suffix || path.endsWith("/" + suffix));
    })
    .map((rel) => rel.replace(/\/$/, ""))
    .filter((rel) => {
      try {
        return !readFileSync(join(wt, rel)).equals(readFileSync(join(mainPath, rel)));
      } catch {
        return true;
      }
    });
}

function mergedPrHeads(repo) {
  const url = tryGit(repo, ["remote", "get-url", "origin"]) ?? "";
  if (!url.includes("github.com")) return new Map();
  try {
    const out = execFileSync(
      "gh",
      ["pr", "list", "--state", "merged", "--limit", "1000", "--json", "headRefName,headRefOid,url"],
      { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    return new Map(JSON.parse(out).map((pr) => [pr.headRefOid, pr.url]));
  } catch {
    return new Map();
  }
}

// Where a commit's work already lives on the remote, or null if it doesn't.
function onRemote(repo, tip, trunk, prs) {
  if (lines(tryGit(repo, ["rev-list", tip, "--not", "--remotes", "--max-count=1"])).length === 0)
    return "every commit is on origin";
  if (prs.has(git(repo, ["rev-parse", tip]))) return `merged in ${prs.get(git(repo, ["rev-parse", tip]))}`;
  const cherry = lines(tryGit(repo, ["cherry", `origin/${trunk}`, tip]));
  if (cherry.length > 0 && cherry.every((l) => l.startsWith("-"))) return `same patches are in origin/${trunk}`;
  return null;
}

function stashApplied(repo, ref, trunk) {
  if (tryGit(repo, ["rev-parse", "--verify", "--quiet", `${ref}^3`]) !== null) return false;
  const patch = tryGit(repo, ["diff", "--no-ext-diff", "--no-color", "--binary", `${ref}^1`, ref]);
  if (!patch) return true;
  const index = join(tmpdir(), `repo-hygiene-${process.pid}.index`);
  const env = { GIT_INDEX_FILE: index };
  if (tryGit(repo, ["read-tree", `origin/${trunk}`], env) === null) return false;
  try {
    execFileSync("git", ["-C", repo, "apply", "--cached", "--check", "-R", "-"], {
      input: patch + "\n",
      env: { ...process.env, ...env },
      stdio: ["pipe", "ignore", "ignore"],
    });
    return true;
  } catch {
    return false;
  } finally {
    rmSync(index, { force: true });
  }
}

function auditRepo(repo) {
  const findings = [];
  const add = (f) => findings.push({ repo, ...f });
  const hasOrigin = tryGit(repo, ["remote", "get-url", "origin"]) !== null;
  if (!hasOrigin) {
    add({ kind: "repo", name: repo, verdict: "hold", reason: "no origin remote, so nothing here is on GitHub" });
    return findings;
  }
  const fetchFailed = fetch && tryGit(repo, ["fetch", "--prune", "--quiet", "origin"]) === null;
  const trunk =
    (tryGit(repo, ["symbolic-ref", "--short", "refs/remotes/origin/HEAD"]) ?? "").replace(/^origin\//, "") ||
    ["main", "master"].find((b) => tryGit(repo, ["rev-parse", "--verify", `origin/${b}`]) !== null) ||
    "main";
  const prs = mergedPrHeads(repo);

  const worktrees = git(repo, ["worktree", "list", "--porcelain"])
    .split("\n\n")
    .map((block) => {
      const field = (k) => block.split("\n").find((l) => l.startsWith(k + " "))?.slice(k.length + 1);
      return {
        path: field("worktree"),
        branch: field("branch")?.replace("refs/heads/", ""),
        head: field("HEAD"),
        locked: block.includes("\nlocked"),
        prunable: block.includes("\nprunable"),
      };
    });
  const checkedOut = new Map(worktrees.map((w) => [w.branch, w.path]));

  for (const [i, wt] of worktrees.entries()) {
    const main = i === 0;
    const label = main ? "main checkout" : "worktree";
    if (wt.prunable) {
      add({ kind: "worktree", name: wt.path, verdict: "safe", reason: "directory is gone", cmd: `git -C ${q(repo)} worktree prune` });
      continue;
    }
    const status = lines(tryGit(wt.path, ["status", "--porcelain", "--untracked-files=all"])).filter(
      (l) => !/(^|\/)\.DS_Store"?$/.test(l.slice(3)),
    );
    const kb = main ? 0 : sizeKb(wt.path);
    if (status.length > 0) {
      const recent = hoursSince(newestDirtyMtime(wt.path, status)) < RECENT_HOURS;
      add({
        kind: label,
        name: wt.path,
        verdict: "hold",
        reason: `${status.length} uncommitted path(s)${recent ? ", edited in the last 24h (a session may be using it)" : ""}`,
        recent,
        files: status.slice(0, 10),
        kb,
      });
      continue;
    }
    if (main) {
      if (wt.branch !== trunk)
        add({
          kind: label,
          name: wt.path,
          verdict: "safe",
          reason: `on ${wt.branch ?? "detached HEAD"}, not ${trunk}`,
          cmd: `git -C ${q(wt.path)} switch ${trunk} && git -C ${q(wt.path)} pull --ff-only`,
        });
      continue;
    }
    if (wt.locked) {
      add({ kind: label, name: wt.path, verdict: "hold", reason: "locked by another tool", kb });
      continue;
    }
    const where = onRemote(repo, wt.head, trunk, prs);
    if (!where) {
      add({ kind: label, name: wt.path, verdict: "hold", reason: `${wt.branch ?? "detached HEAD"} has commits not on GitHub; save the branch first`, kb });
      continue;
    }
    const ignored = unrecoverableIgnored(wt.path, worktrees[0].path);
    const ignoredKb = ignored.reduce((n, rel) => n + sizeKb(join(wt.path, rel)), 0);
    if (ignoredKb > ARCHIVE_LIMIT_KB) {
      add({ kind: label, name: wt.path, verdict: "hold", reason: `${ignored.length} ignored file(s) not in the main checkout, ${(ignoredKb / 1024).toFixed(0)} MB, too big to archive unasked`, files: ignored.slice(0, 10), kb });
      continue;
    }
    const recent = hoursSince(Number(git(wt.path, ["log", "-1", "--format=%ct"]))) < RECENT_HOURS;
    const archive = join(BACKUP_DIR, `${basename(repo)}--${basename(wt.path)}.tgz`);
    const remove = `git -C ${q(repo)} worktree remove ${q(wt.path)}`;
    add({
      kind: label,
      name: wt.path,
      verdict: recent ? "hold" : "safe",
      reason: [recent && "last commit in the last 24h (a session may be using it)", where, ignored.length > 0 && `archives ${ignored.length} ignored file(s) to ${archive} first`].filter(Boolean).join("; "),
      recent,
      files: ignored.length > 0 ? ignored.slice(0, 10) : undefined,
      archive: ignored.length > 0 ? archive : undefined,
      cmd: ignored.length > 0 ? `mkdir -p ${q(BACKUP_DIR)} && tar -C ${q(wt.path)} -czf ${q(archive)} ${ignored.map(q).join(" ")} && ${remove}` : remove,
      kb,
    });
  }

  for (const ref of lines(git(repo, ["for-each-ref", "--format=%(refname:short)", "refs/heads"]))) {
    if (ref === trunk) continue;
    const where = onRemote(repo, ref, trunk, prs);
    const holder = checkedOut.get(ref);
    const holderSafe = findings.some((f) => f.name === holder && f.verdict === "safe");
    const inUse = holder && !holderSafe;
    if (where) {
      add({
        kind: "branch",
        name: ref,
        verdict: inUse ? "hold" : "safe",
        reason: inUse ? `${where}, but ${holder} has it checked out` : holder ? `${where}; delete after removing its worktree` : where,
        cmd: inUse ? undefined : `git -C ${q(repo)} branch -D ${q(ref)}`,
      });
      continue;
    }
    const upstream = tryGit(repo, ["rev-parse", "--verify", "--quiet", `origin/${ref}`]);
    if (upstream && tryGit(repo, ["merge-base", "--is-ancestor", `origin/${ref}`, ref]) === null) {
      add({ kind: "branch", name: ref, verdict: "hold", reason: `diverged from origin/${ref}; pushing would need a force-push` });
      continue;
    }
    const ahead = git(repo, ["rev-list", "--count", ref, "--not", "--remotes"]);
    add({ kind: "branch", name: ref, verdict: "save", reason: `${ahead} commit(s) only on this machine`, cmd: `git -C ${q(repo)} push -u origin ${q(ref)}` });
  }

  // Highest index first, because dropping a stash renumbers the ones after it.
  for (const line of lines(git(repo, ["stash", "list", "--format=%gd%x09%ct%x09%gs"])).reverse()) {
    const [ref, ct, subject] = line.split("\t");
    const days = Math.floor(hoursSince(Number(ct)) / 24);
    if (stashApplied(repo, ref, trunk))
      add({ kind: "stash", name: `${ref} ${subject}`, verdict: "safe", reason: `its changes are already in origin/${trunk}`, cmd: `git -C ${q(repo)} stash drop ${ref}` });
    else
      add({
        kind: "stash",
        name: `${ref} ${subject}`,
        verdict: "save",
        reason: `${days} day(s) old, not in origin/${trunk}`,
        cmd: `git -C ${q(repo)} stash branch stash/${ref.replace(/\D/g, "")}-$(date +%Y%m%d) ${ref}`,
      });
  }
  if (fetchFailed) {
    // Stale origin refs can make unpushed work look pushed, so nothing here is proven safe.
    for (const f of findings.filter((x) => x.verdict === "safe")) {
      f.verdict = "hold";
      f.reason = `fetch failed, so origin may be stale; ${f.reason}`;
      delete f.cmd;
    }
  }
  return findings;
}

const gb = (kb) => (kb / 1024 / 1024).toFixed(2);

// Compare a saved `--json` audit with the disk now: every worktree that is gone counts toward space freed.
if (freedFrom) {
  const removed = JSON.parse(readFileSync(freedFrom, "utf8")).filter((f) => f.kb && !existsSync(f.name));
  const kb = removed.reduce((n, f) => n + f.kb, 0);
  for (const f of removed) console.log(`${gb(f.kb).padStart(7)} GB  ${f.name}`);
  console.log(`Freed ${gb(kb)} GB across ${removed.length} worktree(s)`);
  process.exit(0);
}

const findings = roots.flatMap(findRepos).flatMap(auditRepo);

if (json) {
  console.log(JSON.stringify(findings, null, 2));
} else {
  for (const repo of [...new Set(findings.map((f) => f.repo))]) {
    console.log(`\n## ${repo}`);
    for (const f of findings.filter((x) => x.repo === repo)) {
      const size = f.kb ? ` (${(f.kb / 1024).toFixed(0)} MB)` : "";
      console.log(`${f.verdict.padEnd(4)}  ${f.kind}: ${f.name}${size}\n      ${f.reason}${f.cmd ? `\n      $ ${f.cmd}` : ""}`);
      for (const file of f.files ?? []) console.log(`        ${file}`);
    }
  }
  const count = (v) => findings.filter((f) => f.verdict === v).length;
  const freeKb = findings.filter((f) => f.verdict === "safe").reduce((n, f) => n + (f.kb ?? 0), 0);
  console.log(`\n${count("safe")} safe, ${count("save")} to save, ${count("hold")} on hold; removing the safe worktrees frees about ${gb(freeKb)} GB`);
}
