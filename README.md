# xtras

[![X-commit Tokens](https://img.shields.io/endpoint?url=https%3A%2F%2Fgist.githubusercontent.com%2FThatXliner%2Fcffd977aeb3539c0571ee27356d3a0b3%2Fraw%2Fx-commit-tokens.json)](skills/x-commit/README.md)
[![X-humanizer Tokens](https://img.shields.io/endpoint?url=https%3A%2F%2Fgist.githubusercontent.com%2FThatXliner%2Fcffd977aeb3539c0571ee27356d3a0b3%2Fraw%2Fx-humanizer-tokens.json)](skills/x-humanizer/README.md)
[![X-names Tokens](https://img.shields.io/endpoint?url=https%3A%2F%2Fgist.githubusercontent.com%2FThatXliner%2Fcffd977aeb3539c0571ee27356d3a0b3%2Fraw%2Fx-names-tokens.json)](skills/x-names/README.md)
[![Better-tools Tokens](https://img.shields.io/endpoint?url=https%3A%2F%2Fgist.githubusercontent.com%2FThatXliner%2Fcffd977aeb3539c0571ee27356d3a0b3%2Fraw%2Fbetter-tools-tokens.json)](skills/better-tools/README.md)
[![Skill-token-compression Tokens](https://img.shields.io/endpoint?url=https%3A%2F%2Fgist.githubusercontent.com%2FThatXliner%2Fcffd977aeb3539c0571ee27356d3a0b3%2Fraw%2Fskill-token-compression-tokens.json)](skills/skill-token-compression/README.md)
[![Show-me Tokens](https://img.shields.io/endpoint?url=https%3A%2F%2Fgist.githubusercontent.com%2FThatXliner%2Fcffd977aeb3539c0571ee27356d3a0b3%2Fraw%2Fshow-me-tokens.json)](skills/show-me/README.md)
[![Critique-loop Tokens](https://img.shields.io/endpoint?url=https%3A%2F%2Fgist.githubusercontent.com%2FThatXliner%2Fcffd977aeb3539c0571ee27356d3a0b3%2Fraw%2Fcritique-loop-tokens.json)](skills/critique-loop/README.md)
[![Better-repo-hygiene Tokens](https://img.shields.io/endpoint?url=https%3A%2F%2Fgist.githubusercontent.com%2FThatXliner%2Fcffd977aeb3539c0571ee27356d3a0b3%2Fraw%2Fbetter-repo-hygiene-tokens.json)](skills/better-repo-hygiene/README.md)

**xtras** bundles my Claude Code skills into one plugin. The prefix tells you what kind of skill it is.

### `x-`: opinionated

My taste in commits, prose and naming. Take them if you agree.

- **[x-commit](skills/x-commit/README.md)** — commit the way I want, not the way Claude defaults to: gitmoji + conventional commits, atomic enforcement, why-not-what messaging.
- **[x-humanizer](skills/x-humanizer/README.md)** — strip the AI tells out of generated prose by fixing rhythm and sentence mechanics.
- **[x-names](skills/x-names/README.md)** — name variables, fields, types and functions so the call site alone tells the reader what they hold: units in names, no `data`/`Manager`, verbs that keep one meaning.

### `better-`: objective improvements

Faster or more correct than Claude's defaults, with nothing to disagree with.

- **[better-tools](skills/better-tools/README.md)** — reach for `rg`, `fd`, `sd`, and `jq` instead of `grep`, `find`, and `sed`, with silent fallback when they aren't installed.
- **[better-repo-hygiene](skills/better-repo-hygiene/README.md)** — clean up uncommitted work, unpushed branches, stashes and stale worktrees in one repo or all of `~/Developer`, deleting only what's provably on GitHub, then report the storage freed.

### Other utilities

Tools for specific jobs, some you call and some that step in on their own.

- **[skill-token-compression](skills/skill-token-compression/README.md)** — cut a skill's token cost without turning its rules into riddles: measure by load level, cut material instead of sentences, and check the result on a fresh reader before shipping.
- **[show-me](skills/show-me/README.md)** — after a UI change, screenshot the exact screen that changed in the real app (simulator, desktop window or dev server) and show it in the chat, before and after, without being asked. Preview only; never pushes. Not pstack's `show-me-your-work`, which keeps a decision log for long runs.
- **[critique-loop](skills/critique-loop/README.md)** — have independent critic subagents review creative work (video, art, UI visuals, sound, copy) against your references and taste, and revise until they pass, before you see it.

## Installation

```bash
claude plugin marketplace add ThatXliner/claude-plugins
claude plugin install xtras
```

## License

MIT
