# better-repo-hygiene


Part of the [**xtras**](../../README.md) plugin.

Cleans up the git mess that agent sessions leave behind, in one repo or every repo in `~/Developer`: dirty checkouts, unpushed branches, forgotten stashes, stale worktrees, and a main checkout stuck on some feature branch. Nothing is deleted unless it's provably on GitHub, nothing is force-pushed, and at the end it tells you how much disk it gave back.

## How it works

**A script proves what's safe, so the agent doesn't eyeball it.** [`scripts/audit.mjs`](scripts/audit.mjs) fetches, then gives every leftover a verdict (`safe`, `save` or `hold`) and the exact command for it. The agent runs those commands rather than composing its own.

**"On GitHub" covers squash merges.** A branch counts as on GitHub if its commits are on origin, its tip was the head of a merged PR, or `git cherry` finds its patches in the default branch. Plain `git branch --merged` misses squash-merged branches, so they pile up.

**Stashes are checked against the code, not their age.** A stash is safe to drop only if reverse-applying it to the default branch succeeds, which means its changes already landed. Otherwise it becomes a branch and gets pushed.

**Worktrees can hold files git doesn't track.** Removing a worktree deletes its ignored files too, so any `.env`, local settings or notes that the main checkout lacks are archived to `~/.repo-hygiene/backups/<date>/` first. Build output and caches (`node_modules`, `dist`, Tauri's `gen/schemas`) are skipped. Over 200 MB of such files, the worktree is held instead.

**Save, then delete.** Unpushed branches are pushed and stray uncommitted work goes on a `rescue/` branch. Work touched in the last 24 hours is left alone, since a running session may own it.

**Blocked isn't stuck.** If a permission prompt or safety hook blocks a deletion, the agent carries on and hands you the blocked commands in one block at the end.

**Nothing happens silently.** Every command goes in a ledger, and the report lists each item from it: rescue branches with their files and URLs, pushes, archives, removals with sizes and reasons, holds, failures and blocked commands.

**Storage freed is measured.** `audit.mjs --freed before.json` totals the worktrees that are actually gone, and the report shows the `df` change alongside it.

## Tests

```sh
node --test skills/better-repo-hygiene/scripts/audit.test.mjs
```

The tests build a throwaway repo with a pushed, a local-only, a squash-merged and a diverged branch, an applied stash and a lost one, a worktree holding the only copy of a `.env` (archived, then restored from the archive), and a main checkout off `main`. They check each verdict and the `--freed` total.

## Origin

[Issue #21](https://github.com/ThatXliner/xtras/issues/21) found this by mining session history. The same cleanup ran by hand across Hologram, Billion, Grindion, Quillium, BusTrackr and videographer. Each time the asks were the same: prove a branch is on GitHub before deleting it, no force-pushes, don't discard stray work, hand over the commands when a safety check blocks a deletion, and say how much storage was saved. pstack's worktree-cleanup playbook covers worktrees only. This adds branches, stashes, squash merges and the main checkout.

## Usage

Say "clean it up", "audit all my projects", or invoke `/better-repo-hygiene`.
