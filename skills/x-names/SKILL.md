---
name: x-names
description: Name variables, constants, fields, types and functions so a reader can predict what they hold from the use site alone. Use when choosing or reviewing identifier names, designing a config or data shape, renaming during a refactor, or when a name is vague, off-glossary or missing units.
---

# Naming identifiers

**The test:** a reader sees the name at a use site or in a diff, without its definition, type or comment. Do they correctly predict what it holds or does? Every rule below is a common way names fail that test. When rules conflict or none applies, apply the test and say which way you went.

## First: the project's vocabulary

Before naming a domain concept, look for `GLOSSARY.md` (or `GLOSSARY-MAP.md`, which points to one glossary per context; older repos use `CONTEXT.md`).

- A glossary term is the identifier for that concept: `Invoice`, not `Bill`. Words under `_Avoid_` are banned in code too.
- Use the glossary of the context the code lives in. One word can mean different things in two contexts.
- If the concept has no term yet, propose one and say so instead of inventing it silently. Recording it is the `domain-modeling` skill's job, if available.
- If an ADR in `docs/adr/` explains why something has its name, follow it.

Then match the codebase's existing conventions, which beat this file. Point out a conflict instead of renaming unasked.

## 1. Put the unit in the name

`cooldown: 3` could be seconds, frames or milliseconds, and the type is just `number`, so a mix-up compiles and is off by 60× or 1000×. With units, `delaySeconds = timeoutMillis` looks wrong at a glance.

- `cooldownSeconds`, `reachPixels`, `angleRadians`; rates name both units: `speedPixelsPerSecond`.
- Counts end in `Count`. Factors end in `Multiplier`, `Fraction` or `Ratio`, which also says whether 1 means "unchanged" or "all".
- Skip the unit when the type carries it (`time.Duration`, a branded `Seconds`, one unit everywhere in the codebase).

## 2. Say what it means

- **No placeholders** (`data`, `temp`, `info`, `value`, `flag`): everything is data, so they predict nothing.
- **No catch-alls** (`Manager`, `Helper`, `Util`, `process`): readers guess anything, and the thing grows to fill the name. `handle` for event callbacks is fine.
- **Don't repeat context:** `MenuItem.handleClick`, not `MenuItem.handleMenuItemClick`.
- **Name for how it's used:** if every use is `!isEnabled`, name it `isDisabled`.
- **One word per concept** in each area (not jet/plane/craft). Readers assume different words mean different things. Never two names for one thing, and worse, one name for two.
- **The exact word over a phrase** (`Employee`, not `CompanyPerson`). No jokes, non-English or invented words (`isPaginatable` → `hasPagination`).

## 3. Spelling and shape

- **Whole words.** An abbreviation is a lookup and breaks search (`btn`/`bttn`/`button`). Keep `id`, `url`, `min`, `max` and documented domain terms.
- **Single letters** only for a short loop index or maths that mirrors its formula.
- **No numeric suffixes:** `missile1`/`missile2` hide why both exist. Name the difference: `leadMissile`, `wingMissile`.
- **Constants name meaning, not value:** `HULL_MAX`, not `ONE_HUNDRED`.
- **Qualifier first:** `minPosts`, `maxPosts`, `prevPosts`, `nextPosts`.
- **About 4 words or 20 characters.** Longer usually means an object should supply the context: `power.cooldownSeconds`, not `megaBoostPowerCooldownSeconds`.

## 4. Names that look alike

Readers recognise names by shape and by their first and last letters. Two look-alike names of the same type in one scope get swapped, and nothing complains.

- Don't let names differ by one or two letters (`appleCount`/`appleCounts`), by word order (`countApple`), or only in sound (`wrap`/`rap`). Rename one for its role: `basketCount`, `orchardCount`.
- It's fine when the type checker catches a swap: `for (const missile of missiles)`.

## 5. Values

- **No type encoding** (`strName`, `userList`): the editor shows the type, and the prefix goes stale. Carry meaning, role and unit instead.
- **Singular for one, plural for a collection**; a collective noun when one exists (`fleet`, `queue`).
- **Booleans read as statements:** `is` (state), `has` (holds), `can` (allowed), `should` (condition for an action). Never `status` or `mode` for a yes/no. Keep them positive (`visible`, not `notHidden`) unless every use negates.
- **Matched opposites:** `start`/`end`, `first`/`last`, `source`/`target`, never `first`/`end`.
- **A discriminator field is `kind`** (or the repo's word), and its values are nouns.

## 6. Types

Noun phrases (`DiscountRule`, not `Calculate`) that cover every value the type holds (`ControlState`, not `ControlEnableState`).

## 7. Functions

- Verb phrases. A pure derivation may read as a noun: `traits(plane)`.
- Shape: prefix + action + main context + detail (`getUserMessages`, `shouldDisplayMessage`). Order changes meaning: `shouldUpdateComponent` means you update it, `shouldComponentUpdate` means it updates itself.
- Name the domain (`getRecentPosts(posts)`, not `filterRecent(list)`) unless the language implies it.
- Each verb keeps one meaning repo-wide, so callers can predict cost and effect:

| Verb | Means |
|---|---|
| `get` | cheap, no side effects (callers loop over it) |
| `fetch` / `load` | does I/O or may be slow |
| `set` / `reset` | assign / restore the initial value |
| `add` / `remove` | into or out of a collection; the thing still exists |
| `create` / `delete` | make exist / destroy |
| `compose` / `build` | new data from existing data |
| `handle` | event callback |
| `validate` / `check` | returns the result or throws |
| `toX` / `parseX` / `formatX` | returns the converted value |

If the repo already writes `async getUser()`, follow it.

## Applying it

- **Data shapes:** write the fields out with example values and read them aloud ("a cooldown of 8 seconds, a reach of 140 pixels, 6 bomblets"). A bare number, or a field that needs a comment, is missing information.
- **Every rename gets a one-phrase reason**, such as "`cooldown` → `cooldownSeconds`: unit was missing", so the user can push back.
- **Refactor renames** cover every use in one change (server, tools, docs) with identical behaviour. A half-done rename leaves two names for one thing.

## References

Open only when you need more detail:

- [references/hilton-hermans.md](references/hilton-hermans.md): all 40 of Hilton & Hermans' guidelines, with notes where this file departs from them.
- [references/kettanaito-cheatsheet.md](references/kettanaito-cheatsheet.md): the full naming cheatsheet with examples.
