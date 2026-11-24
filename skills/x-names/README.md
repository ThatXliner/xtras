# x-names

Part of the [**xtras**](../../README.md) plugin.

Teaches Claude to name things so a reader can predict what a name holds or does from the call site alone, without opening the definition. Left to itself, Claude reaches for `data`, `handler`, `cooldown: 3` and `Manager`. This skill makes it write `unpaidInvoices`, `handleLinkClick`, `cooldownSeconds: 3` and a noun that says what the class is.

## How it works

**One test behind every rule.** Every guideline comes back to one question: what will someone who sees only this name, at a use site, assume, and is that assumption right? When two guidelines conflict, or a case isn't covered, Claude applies the test and says which way it went.

**The repo wins.** Existing conventions beat the skill. Claude matches the local style and points out a conflict rather than renaming things unasked.

**Renames show their reasoning.** Each rename comes with a one-line reason, for example "`cooldown` → `cooldownSeconds`: unit was missing", so you can push back on a rename you disagree with.

## What it covers

| Area | Example |
|---|---|
| Units in names | `reach: 140` → `reachPixels: 140` |
| Meaning over placeholders | `data` → `unpaidInvoices`, no `Manager`/`Util` |
| Look-alike names | `appleCount` next to `appleCounts` gets renamed |
| Booleans | `hasFuel`, never `notHidden` or `status` for yes/no |
| Verb meanings | `get` is cheap and pure, `fetch` does I/O, `remove` ≠ `delete` |
| Types and functions | noun phrases for types, verb phrases for functions |

## Sources

Hilton & Hermans' *Naming Guidelines for Professional Programmers*, Ruud van Asseldonk's "Please put units in names", and [kettanaito/naming-cheatsheet](https://github.com/kettanaito/naming-cheatsheet). The full lists are in [`references/`](references/).

## Usage

The skill activates when Claude picks or reviews identifier names, designs a config or data shape, or renames during a refactor. You can also invoke it directly with `/x-names`.
