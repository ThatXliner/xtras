---
name: better-repo-hygiene
description: Audit and clean up git leftovers (uncommitted work, unpushed branches, stashes, stale worktrees, a main checkout off its default branch) in one repo or across every repo in a folder, without losing work, then report storage freed. Use when the user says "clean it up", "clean up the worktrees/branches/stashes", "why isn't the main checkout main", "audit all my projects", or asks to free disk space taken by worktrees.
---

# Repo hygiene

Delete only what is provably on GitHub. Push what isn't, and never force-push. Commit or report stray work, never discard it. Every deletion is a command the audit printed, not one you composed, because the audit is what proves it safe.

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

Lead with the space freed. Then list what was saved and where it was pushed, where archives went, what was deleted (counts by kind), every `hold` with its reason, and any blocked commands.
