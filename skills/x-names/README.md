# x-names

Part of the [**xtras**](../../README.md) plugin.

Teaches Claude to name things so a reader can predict what a name holds or does from the call site alone, without opening the definition. Left to itself, Claude reaches for `data`, `handler`, `cooldown: 3` and `Manager`. This skill makes it write `unpaidInvoices`, `handleLinkClick`, `cooldownSeconds: 3` and a noun that says what the class is.

## How it works

**One test behind every rule.** Every guideline comes back to one question: what will someone who sees only this name, at a use site, assume, and is that assumption right? When two guidelines conflict, or a case isn't covered, Claude applies the test and says which way it went.

**The project's vocabulary comes first.** If the repo has a `GLOSSARY.md` (the format used by the [`domain-modeling`](https://github.com/mattpocock/skills) skill) or ADRs, Claude names domain concepts with the glossary's terms and treats its `_Avoid_` words as banned identifiers. When a concept has no term yet, it proposes one instead of inventing a name silently.

**Principles are fixed; conventions are the repo's.** The skill holds only what's true in any codebase: units, meaning, look-alikes, one meaning per verb. *Which* verb means what, which boolean prefix and which unit suffix are conventions, so Claude reads the names already around the code and follows them, even when they differ from the skill's taste. Only in a codebase with no convention yet does it open the bundled [default conventions](references/default-conventions.md), so new code starts out consistent. It points out conflicts rather than renaming things unasked.

**Renames show their reasoning.** Each rename comes with a one-line reason, for example "`cooldown` → `cooldownSeconds`: unit was missing", so you can push back on a rename you disagree with.

## What it covers

| Area | Example |
|---|---|
| Units in names | `reach: 140` → `reachPixels: 140` |
| Meaning over placeholders | `data` → `unpaidInvoices`, no `Manager`/`Util` |
| Look-alike names | `appleCount` next to `appleCounts` gets renamed |
| Booleans | `hasFuel`, never `notHidden` or `status` for yes/no |
| One meaning per verb | learns what `get` means *here*; defaults to `get` cheap, `fetch` I/O |
| Types and functions | noun phrases for types, verb phrases for functions |

## Sources

Hilton & Hermans' *Naming Guidelines for Professional Programmers*, Ruud van Asseldonk's "Please put units in names", and [kettanaito/naming-cheatsheet](https://github.com/kettanaito/naming-cheatsheet). The full lists are in [`references/`](references/).

## Usage

The skill activates when Claude picks or reviews identifier names, designs a config or data shape, or renames during a refactor. You can also invoke it directly with `/x-names`.
