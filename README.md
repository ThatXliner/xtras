# xtras

[![X-commit Tokens](https://img.shields.io/endpoint?url=https%3A%2F%2Fgist.githubusercontent.com%2FThatXliner%2Fcffd977aeb3539c0571ee27356d3a0b3%2Fraw%2Fx-commit-tokens.json)](skills/x-commit/README.md)
[![X-humanizer Tokens](https://img.shields.io/endpoint?url=https%3A%2F%2Fgist.githubusercontent.com%2FThatXliner%2Fcffd977aeb3539c0571ee27356d3a0b3%2Fraw%2Fx-humanizer-tokens.json)](skills/x-humanizer/README.md)

**xtras** bundles my Claude Code skills into one plugin. The prefix tells you what kind of skill it is.

### `x-`: opinionated

My taste in commits, prose and naming. Take them if you agree.

- **[x-commit](skills/x-commit/README.md)** — commit the way I want, not the way Claude defaults to: gitmoji + conventional commits, atomic enforcement, why-not-what messaging.
- **[x-humanizer](skills/x-humanizer/README.md)** — strip the AI tells out of generated prose by fixing rhythm and sentence mechanics.
- **[x-names](skills/x-names/README.md)** — name variables, fields, types and functions so the call site alone tells the reader what they hold: units in names, no `data`/`Manager`, verbs that keep one meaning.

### `better-`: objective improvements

Faster or more correct than Claude's defaults, with nothing to disagree with.

- **[better-tools](skills/better-tools/README.md)** — reach for `rg`, `fd`, `sd`, and `jq` instead of `grep`, `find`, and `sed`, with silent fallback when they aren't installed.

### Other utilities

Tools you run when you need them.

- **[skill-token-compression](skills/skill-token-compression/README.md)** — cut a skill's token cost without turning its rules into riddles: measure by load level, cut material instead of sentences, and check the result on a fresh reader before shipping.

## Installation

```bash
claude plugin marketplace add ThatXliner/claude-plugins
claude plugin install xtras
```

## License

MIT
