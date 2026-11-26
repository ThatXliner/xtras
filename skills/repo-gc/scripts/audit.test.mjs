import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const OLD = { GIT_AUTHOR_DATE: "2026-01-01T00:00:00Z", GIT_COMMITTER_DATE: "2026-01-01T00:00:00Z" };
const sh = (cwd, ...argv) =>
  execFileSync("git", ["-C", cwd, ...argv], {
    encoding: "utf8",
    env: { ...process.env, ...OLD, GIT_CONFIG_GLOBAL: "/dev/null", GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" },
  }).trim();
const commit = (cwd, file, text) => {
  writeFileSync(join(cwd, file), text);
  sh(cwd, "add", file);
  sh(cwd, "commit", "-qm", `${file}: ${text}`);
};

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "repo-hygiene-test-"));
  const remote = join(dir, "remote.git");
  const repo = join(dir, "repo");
  sh(dir, "init", "-q", "--bare", "-b", "main", remote);
  sh(dir, "clone", "-q", remote, repo);
  commit(repo, "a.txt", "base");
  sh(repo, "push", "-q", "-u", "origin", "main");

  sh(repo, "switch", "-qc", "pushed");
  commit(repo, "p.txt", "pushed");
  sh(repo, "push", "-q", "origin", "pushed");

  sh(repo, "switch", "-qc", "local-only", "main");
  commit(repo, "l.txt", "local");

  sh(repo, "switch", "-qc", "squashed", "main");
  commit(repo, "s.txt", "squashed");
  sh(repo, "switch", "-q", "main");
  sh(repo, "merge", "-q", "--squash", "squashed");
  sh(repo, "commit", "-qm", "Squash-merge squashed (#1)");
  sh(repo, "push", "-q", "origin", "main");

  sh(repo, "switch", "-qc", "diverged", "main");
  commit(repo, "d.txt", "one");
  sh(repo, "push", "-q", "origin", "diverged");
  sh(repo, "reset", "-q", "--hard", "main");
  commit(repo, "d.txt", "two");

  sh(repo, "switch", "-q", "main");
  writeFileSync(join(repo, "a.txt"), "upstream");
  sh(repo, "stash", "-q");
  commit(repo, "a.txt", "upstream");
  sh(repo, "push", "-q", "origin", "main");
  writeFileSync(join(repo, "a.txt"), "never committed");
  sh(repo, "stash", "-q");

  sh(repo, "worktree", "add", "-q", join(dir, "wt-pushed"), "pushed");
  sh(repo, "worktree", "add", "-q", join(dir, "wt-secret"), "squashed");
  writeFileSync(join(repo, ".git", "info", "exclude"), ".env\nnode_modules\n");
  mkdirSync(join(dir, "wt-pushed", "node_modules"));
  writeFileSync(join(dir, "wt-pushed", "node_modules", "x.js"), "");
  writeFileSync(join(dir, "wt-secret", ".env"), "TOKEN=only-here");
  sh(repo, "switch", "-qc", "wt-only", "main");
  commit(repo, "w.txt", "only in a worktree");
  sh(repo, "switch", "-q", "local-only");
  sh(repo, "worktree", "add", "-q", join(dir, "wt-unpushed"), "wt-only");
  return repo;
}

const run = (...argv) => execFileSync("node", [join(import.meta.dirname, "audit.mjs"), ...argv], { encoding: "utf8" });

function audit(repo) {
  const out = run("--json", "--no-fetch", repo);
  return Object.fromEntries(JSON.parse(out).map((f) => [`${f.kind}:${f.name.replace(/.*\/wt-/, "wt-")}`, f]));
}

test("each leftover gets the verdict that keeps work safe", () => {
  const found = audit(fixture());
  const verdict = (key) => found[key]?.verdict;
  assert.equal(verdict("branch:pushed"), "safe", "a branch on origin whose worktree is removable is safe");
  assert.equal(verdict("worktree:wt-pushed"), "safe", "a clean, old worktree on a pushed branch is safe");
  assert.equal(verdict("worktree:wt-secret"), "safe", "a worktree holding the only copy of a small ignored .env is removable");
  assert.deepEqual(found["worktree:wt-secret"].files, [".env"]);
  assert.match(found["worktree:wt-secret"].cmd, /tar .*-czf .*\.env && git .*worktree remove/, "the .env is archived before the worktree is removed");
  assert.equal(found["worktree:wt-pushed"].archive, undefined, "build output like node_modules is not archived");
  assert.equal(verdict("branch:squashed"), "safe", "a branch whose patches are in main is safe");
  assert.equal(verdict("branch:diverged"), "hold", "a diverged branch is held, never force-pushed");
  assert.equal(verdict("branch:local-only"), "save", "an unpushed branch is pushed, not deleted");
  assert.equal(verdict("worktree:wt-unpushed"), "hold", "a worktree with unpushed commits is held");
  assert.equal(found["worktree:wt-unpushed"].rescuable, true, "pushing its branch would free it, so it counts toward the dry-run total");
  const stashes = Object.values(found).filter((f) => f.kind === "stash");
  assert.deepEqual(stashes.map((f) => f.name.slice(0, 9) + " " + f.verdict), ["stash@{1} safe", "stash@{0} save"], "applied stash is safe, lost stash is saved, highest index first");
  const main = Object.values(found).find((f) => f.kind === "main checkout");
  assert.match(main.cmd, /switch main/, "a main checkout off the default branch is switched back");
  assert.ok(!Object.values(found).some((f) => f.cmd?.includes("--force") || f.cmd?.includes("push -f")), "no command force-pushes");
});

test("archiving keeps the only copy of an ignored file", () => {
  const repo = fixture();
  const home = mkdtempSync(join(tmpdir(), "repo-hygiene-home-"));
  const found = JSON.parse(execFileSync("node", [join(import.meta.dirname, "audit.mjs"), "--json", "--no-fetch", repo], { encoding: "utf8", env: { ...process.env, HOME: home } }));
  const secret = found.find((f) => f.name.endsWith("wt-secret"));
  execFileSync("sh", ["-c", secret.cmd]);
  assert.equal(execFileSync("tar", ["-xOzf", secret.archive, ".env"], { encoding: "utf8" }), "TOKEN=only-here");
  assert.ok(!existsSync(secret.name), "the worktree is gone");
});

test("--freed totals the worktrees that are gone since the saved audit", () => {
  const repo = fixture();
  const before = join(repo, "..", "before.json");
  writeFileSync(before, run("--json", "--no-fetch", repo));
  const wt = join(repo, "..", "wt-pushed");
  sh(repo, "worktree", "remove", "--force", wt);
  const out = run("--freed", before);
  assert.match(out, /wt-pushed/, "the removed worktree is listed");
  assert.doesNotMatch(out, /wt-secret/, "a worktree still on disk is not counted");
  assert.match(out, /Freed \d+\.\d\d GB across 1 worktree/);
});

test("a failed fetch proves nothing safe", () => {
  const repo = fixture();
  sh(repo, "remote", "set-url", "origin", join(repo, "..", "gone.git"));
  const findings = JSON.parse(run("--json", repo));
  assert.ok(findings.length > 0);
  assert.ok(!findings.some((f) => f.verdict === "safe"), "nothing is safe when origin couldn't be fetched");
});
