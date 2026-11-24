---
name: better-repo-hygiene
description: Audit and clean up git leftovers (uncommitted work, unpushed branches, stashes, stale worktrees, a main checkout off its default branch) in one repo or across every repo in a folder, without losing work, then report storage freed. Use when the user says "clean it up", "clean up the worktrees/branches/stashes", "why isn't the main checkout main", "audit all my projects", or asks to free disk space taken by worktrees.
---

# Repo hygiene

Delete only what is provably on GitHub. Push what isn't, and never force-push. Commit or report stray work, never discard it. Every deletion is a command the audit printed, not one you composed, because the audit is what proves it safe.

## Dry run

If the user asks for a dry run, or passes `--dry-run`, run steps 1 and 2 only. Don't run any `save` or `safe` command, and don't commit, push, archive or delete anything. Then report as in step 6, in the future tense: what would be rescued, pushed, archived, removed and left alone. Use the audit's summary line for space: what the safe set frees, and what saving first would free on top. End by saying the real run is the same request without `--dry-run`.

## 1. Scope and baseline

- One repo: run from it, or pass its path. "All my projects": pass `~/Developer`, or the folder the user names.
- Record free space with `df -k /` before touching anything.

## 2. Audit

```sh
node <this-skill>/scripts/audit.mjs [<repo-or-folder> ...]          # readable
node <this-skill>/scripts/audit.mjs --json <...> > <scratch>/before.json
```

It fetches with `--prune` (if the fetch fails, nothing in that repo is marked `safe`), then gives every leftover a verdict and its exact command:

- `safe` means it's on GitHub or already applied. A branch counts as on GitHub when its commits are on origin, its tip is the head of a merged PR, or `git cherry` shows its patches in the default branch, which covers squash merges. A clean worktree also needs no recent commits. If it holds ignored files the main checkout lacks, like `.env`, its command first archives them to `~/.repo-hygiene/backups/<date>/`.
- `save` means the work exists only on this machine, so push it.
- `hold` needs a person: uncommitted work, a branch that diverged from origin, a locked worktree, over 200 MB of ignored files, or activity in the last 24h.

Show the user the summary line and the `save` and `hold` rows before acting.

## 3. Save first

Log every command you run, as one line in `<scratch>/ledger.tsv` with the repo, the item, the command and its outcome (`ok`, `failed: <error>`, `blocked`). Step 6 reports from this file, so log failures and skips too.

- Run every `save` command. A stash becomes a `stash/N-date` branch, so push that branch too.
- **Uncommitted work** edited more than 24 hours ago: commit it with `/x-commit` onto a new `rescue/<date>-<topic>` branch (never onto the default branch), then push it. Work edited in the last 24 hours may belong to a running session, so leave it alone and report it.
- **Diverged branches and oversized ignored files**: report them with the files listed. Don't pick a side.
- If the main checkout is off its default branch with nothing to save, run its `switch` command.

Then rerun the audit and overwrite `before.json` with the new `--json` output, so step 5 measures from here. Saved items now come back `safe`.

## 4. Delete the safe set

- Skip any worktree a running agent session is using, even when it's `safe`. Check the session tools you have, such as T3's worktree list. Paths under `~/.codex/worktrees` or `.claude/worktrees`, and `t3/` branches, were made by sessions. Skip them unless you can confirm that session has ended.
- Run the `safe` commands in the order printed: worktrees, then branches, then stashes (highest index first, because dropping one renumbers the rest).
- Never use `--force`, `push -f`, `reset --hard` or `clean -fdx`, and never `rm -rf` a worktree that `git worktree remove` refused. Report the refusal as a `hold`.
- If a permission prompt or safety hook blocks a command, keep going with the rest. At the end, give the user every blocked command in one copy-paste block.

## 5. Measure what was freed

```sh
node <this-skill>/scripts/audit.mjs --freed <scratch>/before.json
df -k /
```

`--freed` totals the worktrees from `before.json` that are now gone, each with its size. Report that total, and the `df` change in free space alongside it. They differ because other processes write to the disk too.

## 6. Report

Report everything that happened, item by item, from the ledger. The user should never find a branch, archive or missing worktree they weren't told about. Group by repo, and include:

- **Space freed.** Lead with the `--freed` total and the `df` change.
- **Rescued work.** For each `rescue/` branch: the repo, the worktree or checkout it came from, the files it holds, the commit, and its GitHub URL.
- **Pushed.** Each branch pushed and each stash turned into a branch, with its URL.
- **Archived.** Each archive path, and the files in it.
- **Removed.** Each worktree with its size, each branch deleted with the reason it was safe (on origin, merged PR, or patches in the default branch), and each stash dropped.
- **Switched.** Any main checkout moved back to its default branch, and the branch it was on.
- **Left alone.** Every `hold` and every skipped session worktree, with the reason.
- **Failed or blocked.** Every command that failed, with its error. Then every blocked command in one copy-paste block.

For a long list, put the per-item detail in a file and link it, but keep the counts and every rescued branch in the reply.
