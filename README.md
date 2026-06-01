# xtras

[![X-commit Tokens](https://img.shields.io/endpoint?url=https%3A%2F%2Fgist.githubusercontent.com%2FThatXliner%2Fcffd977aeb3539c0571ee27356d3a0b3%2Fraw%2Fx-commit-tokens.json)](https://github.com/ThatXliner/xtras/blob/main/skills/x-commit/SKILL.md)
[![X-humanizer Tokens](https://img.shields.io/endpoint?url=https%3A%2F%2Fgist.githubusercontent.com%2FThatXliner%2Fcffd977aeb3539c0571ee27356d3a0b3%2Fraw%2Fx-humanizer-tokens.json)](https://github.com/ThatXliner/xtras/blob/main/skills/x-humanizer/SKILL.md)

**xtras** bundles my Claude Code skills into one plugin. It currently ships two:

- **x-commit** — commit the way I want, not the way Claude defaults to.
- **x-humanizer** — strip the AI tells out of generated prose.

## x-commit

I created this because I didn't like how Claude committed files when I simply asked it to "create atomic commits." This skill codifies all the things I want.

- **Gitmoji + Conventional Commits** — combines [visual emoji shortcodes](https://gitmoji.dev/) (`:bug:`, `:sparkles:`) with [machine-parseable types](https://www.conventionalcommits.org/en/v1.0.0/) (`fix`, `feat`) in one format
- **Atomic commit enforcement** — splits changes by code dependency, not just "logical grouping," so `git revert` and `git bisect` always work cleanly
- **Why-not-what messaging** — teaches the agent to explain motivation in subjects and bodies instead of restating the diff
- **Pre-commit checklist** — lints, documentation updates, and AI plan file cleanup (never commit [Superpowers](https://github.com/obra/superpowers) docs) before every commit
- **Full gitmoji reference** — 30+ commonly used gitmoji with type pairings, plus a link to the complete spec

## x-humanizer

Rewrites AI-generated text so it reads like a considered essay instead of a marketing blog post — focused on rhythm and sentence mechanics.

- **No rhetorical fragments** — every sentence stands grammatically complete on its own
- **No staccato pairs/triples** — short sentences get joined with semicolons, conjunctions, or subordinate clauses
- **No punchline one-liners or em-dash drama** — develops thoughts across sentences and quiets the dashes
- **No list-style "There's X. There's Y."** — turns them into real lists or parallel clauses
- **The read-aloud test** — any sentence read in isolation should feel complete

## Installation

```bash
claude plugin marketplace add ThatXliner/claude-plugins
claude plugin install xtras
```

## Pairs well with [gah](https://github.com/ThatXliner/gah)

x-commit enforces **atomic commits** split by code dependency — which often means staging only _part_ of a file. But `git add -p` is interactive, and agents can't drive interactive prompts.

[**gah**](https://github.com/ThatXliner/gah) (_Git Add Hunk, built for agents to use_) solves exactly this: non-interactive hunk-based staging. Stage specific hunks by index, content anchor, regex, or line range — no prompts required. Together they let an agent slice a messy working tree into clean, revertable commits.

### Installing gah

**CLI via Cargo:**

```bash
cargo install gah
```

**Claude Code Plugin:**

```bash
/plugin install ThatXliner/gah
```

Or manually:

```bash
mkdir -p .claude/skills
git clone https://github.com/ThatXliner/gah.git .claude/skills/gah
```

### Hook guard (recommended)

The skill includes a `PreToolUse` hook that validates commit messages follow the x-commit format before allowing them through. This prevents Claude from bypassing the skill when confirming a commit with a short reply like "yes".

To enable it globally, add this to your `~/.claude/settings.json`:

```jsonc
{
  // ...existing settings...
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "prompt",
            "if": "Bash(git commit:*)",
            "prompt": "Check if this git commit command follows the x-commit skill conventions. The commit message MUST use the format `:gitmoji: type(scope): imperative description` (e.g. `:bug: fix(auth): prevent crash when session expires`). If the message does NOT match this format, block it and tell the model to invoke the x-commit skill first with /x-commit. If it DOES match, allow it. Here is the command: $ARGUMENTS",
            "statusMessage": "Validating commit format..."
          }
        ]
      }
    ]
  }
}
```

## Usage

The skill activates automatically when Claude is writing commit messages, staging changes, or reviewing commits. You can also trigger it explicitly with:

```
/x-commit
```

## License

MIT
