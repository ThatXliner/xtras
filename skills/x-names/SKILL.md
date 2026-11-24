---
name: x-names
description: Name variables, constants, fields, types and functions so a reader can predict what they hold from the use site alone. Use when choosing or reviewing identifier names, designing a config or data shape, renaming during a refactor, or when a name is vague, inconsistent with the project's terms, or missing units. Also use when writing new code that introduces types, fields or config, even if the user doesn't mention naming.
---

# Naming identifiers

**The test:** a reader sees the name at a use site or in a diff, without its definition, type or comment. Do they correctly predict what it holds or does? Every rule below is a common way names fail that test. When rules conflict or none applies, apply the test and say which way you went.

## First: the project's vocabulary

Name domain concepts with the words the project already uses for them. Readers know the domain through those words, so a synonym makes them wonder whether it's a different thing.

- **Documented terms win.** Look for a glossary or domain doc (`GLOSSARY.md`, `CONTEXT.md`, a "Terminology" section in the README or CONTRIBUTING) and for decision records such as ADRs. If the glossary says `Invoice`, write `Invoice`, not `Bill`. Words it tells you to avoid are banned in code too.
- **Without docs, the code is the vocabulary.** The names of existing types, database tables and API routes are the project's terms. If the code says `Customer`, don't introduce `Client`.
- **Use the vocabulary of the area you're in.** One word can mean different things in two parts of a larger codebase, so a term from billing may not fit in shipping.
- **If a concept has no term yet,** pick the clearest one, use it, and tell the user you introduced it so they can change it before it spreads. If the project keeps a glossary, suggest adding the term there.

## Second: the codebase's conventions

The numbered sections below say what a name has to communicate. The exact spelling is convention: which verb signals I/O, whether booleans start with `is`, `Seconds` or `Secs`, `minPosts` or `postsMin`. Readers predict from the conventions they've already seen in this codebase, so those win over this file and over its defaults.

- Before choosing a spelling, look at a few existing names of the same kind near the code you're touching. For example, `rg -o '\bget[A-Z]\w*'` shows what `get` does in this repo.
- If they agree, follow them, even where they differ from the defaults. If every `getUser()` is `async` and hits the network, then `get` does I/O in this repo, and a new loader should be `getPlan()`, not `fetchPlan()`.
- If the local area disagrees with the rest of the repo, follow the area and mention the inconsistency.
- If there are no existing names of that kind (a new repo, or the first boolean or API call), read [references/default-conventions.md](references/default-conventions.md) before choosing. Then the codebase starts out consistent, instead of inheriting whatever you'd pick by habit.
- Point out a conflict instead of renaming existing code unasked.

## 1. Put the unit in the name

`cooldown: 3` could be 3 seconds, 3 frames or 3 milliseconds. The type is just `number`, so a mix-up compiles and runs, and the value is off by 60× or 1000×. With the unit in the name, `delaySeconds = timeoutMillis` looks wrong at a glance.

- Quantities carry their unit: `cooldownSeconds`, `reachPixels`, `angleRadians`. A rate names both units: `speedPixelsPerSecond`.
- When a number isn't a quantity, say what it is instead. A count says it's a count (`bombletCount`, not `bomblets`). A factor says it's a factor, and how to read it: `turnMultiplier` (1 means unchanged) and `healthFraction` (1 means all of it) look alike as numbers but mean different things.
- Skip the unit when the type already carries it: a Go `time.Duration`, a branded `Seconds` type, or a codebase that uses one unit everywhere. There the compiler or the convention catches the mix-up, and the suffix is only noise.

## 2. Say what it means

- **No placeholders** (`data`, `temp`, `info`, `value`, `flag`). Every variable holds data, so the name tells the reader nothing.
- **No catch-all words** (`Manager`, `Helper`, `Util`, `process`). Readers can't tell what the thing does, and because anything fits under the name, it grows to do everything. `handle` for an event callback is the exception: it has one settled meaning.
- **Don't repeat the context.** Inside `MenuItem`, write `handleClick`, not `handleMenuItemClick`. The reader already sees `MenuItem`.
- **Name it for how it's used.** If every use is `disabled={!isEnabled}`, readers negate it in their heads each time. Name it `isDisabled`.
- **One word per concept.** If the code says "plane" in one file and "jet" in another, readers assume they're different things and go looking for the difference. Two names for one thing causes that confusion. One name for two different things is worse, because the reader's guess is right in one place and wrong in the other.
- **Use the exact word.** `Employee`, not `CompanyPerson`.
- **No jokes, non-English or invented words.** Each costs readers a translation step, and some readers can't make it. Write `hasPagination`, not `isPaginatable`. Established project terms are the exception: if the domain's own word is non-English, the project's vocabulary wins.

## 3. Spelling and shape

- **Whole words.** An abbreviation is a lookup for the reader, and it breaks search when people spell it differently (`btn`, `bttn`, `button`). Keep the ones everyone reads instantly (`id`, `url`, `min`, `max`) and documented domain terms.
- **Single letters** only for a short loop index, or in maths that mirrors a known formula (`x`, `y`, `t`).
- **No numeric suffixes.** `missile1` and `missile2` say there are two but not why. Name the difference: `leadMissile`, `wingMissile`.
- **Constants name the meaning, not the value.** `HULL_MAX`, not `ONE_HUNDRED`, which becomes a lie when the value changes.
- **Bounds and transitions** use the standard words `min`/`max` and `prev`/`next`. Pick one word order (`minPosts` or `postsMin`) and keep it everywhere.
- **About 4 words or 20 characters.** Longer names wrap and get skimmed. A name that needs more words usually belongs inside an object that supplies the context: `power.cooldownSeconds`, not `megaBoostPowerCooldownSeconds`.

## 4. Names that look alike

Readers recognise names by their shape and their first and last letters rather than reading every character. If two names in one scope look alike and have the same type, a reader or autocomplete can swap them, and nothing complains because both are valid.

- Don't let same-type names differ by only one or two letters. In a shopping cart, `itemTotal` (one item's price times its quantity) and `itemsTotal` (the sum for the whole cart) are both numbers, and a typo between them silently uses the wrong one. Name each for its role instead: `itemTotal` and `cartTotal`.
- The same goes for names that differ only in word order (`startTime` and `timeStart`) or only in sound (`wrap` and `rap`, which are ambiguous when code is discussed aloud).
- Look-alikes of different types are fine, because the type checker catches a swap. In `for (const missile of missiles)`, one is a missile and the other is a list, and mixing them up won't compile.

## 5. Values

- **No type in the name** (`strName`, `userList`). The editor already shows the type, and the prefix goes stale when the type changes. Spend the characters on meaning, role and unit.
- **Singular for one value, plural for a collection** (`missile`, `missiles`). Readers decide from the name whether to write `.length` or `.x`. Use a collective noun when one exists (`fleet`, `queue`), since it also says what the collection is for.
- **Booleans read as a true/false statement**: `hasFuel`, `isVisible`, or a plain `visible`. Don't use `status` or `mode` for a yes/no, since it hides that there are only two states and invites a third.
- **Booleans don't contain a negation.** `if (!notHidden)` is a double negative, and readers get those wrong, so write `visible` instead of `notHidden` or `isNotEnabled`. A word that is itself a state, like `disabled` or `hidden`, isn't a negation: pick whichever of the pair most uses check, as in "Name it for how it's used".
- **Opposites come in matched pairs**: `start`/`end`, `first`/`last`, `source`/`target`. Seeing one, readers predict the other. A mismatched pair like `first`/`end` makes them wonder whether the two are related.
- **Tagged unions:** the field that says which variant a value is (`kind`, `type`, `variant`) uses the same word everywhere in the repo, and its values are nouns: `{ kind: "circle" }`, not `{ kind: "isCircle" }`.

## 6. Types

- **Noun phrases.** A type is something values are, so `const rule: DiscountRule` reads correctly and `const rule: Calculate` doesn't.
- **The name covers every value the type can hold.** A type called `ControlEnableState` that also represents "disabled" makes readers assume it means enabled. Call it `ControlState`.

## 7. Functions

- **Verb phrases** (`calculateDiscount()`), because a call does something. A pure function that only derives a value may read as a noun: `traits(plane)`.
- **Word order changes meaning.** `shouldUpdateComponent` means you are about to update the component. `shouldComponentUpdate` means the component updates itself.
- **Name the data it works on**: `getRecentPosts(posts)`, not `filterRecent(list)`, so readers know what it expects. Skip it when the language already says it: an array's `filter` doesn't need to be `filterArray`.
- **Each verb keeps one meaning across the repo**, so callers can predict a call's cost and effect from the verb alone: whether `get` may do I/O, whether `remove` destroys the thing or only takes it off a list, whether `validate` throws. Learn the repo's meanings before adding a verb, and use the defaults file when there are none.

## Applying it

- **Designing a data shape:** write the fields out with example values and read them aloud: "a cooldown of 8 seconds, a reach of 140 pixels, 6 bomblets". A field that reads as a bare number, or needs a comment to explain it, is missing information.
- **Every rename gets a one-phrase reason** in your reply (and in the commit message, if you commit), such as "`cooldown` → `cooldownSeconds`: unit was missing" or "`data` → `unpaidInvoices`: says what the list holds". That shows the reasoning, and the user can push back on a rename they disagree with.
- **Renames in a refactor** cover every use in the same commit, including the server, tools and docs, and leave behaviour identical. A half-finished rename leaves two names for one thing.

## References

Open these only when you need them:

- [references/default-conventions.md](references/default-conventions.md): verb meanings, boolean prefixes, unit and count suffixes and letter case, for codebases with no convention of their own.
- [references/hilton-hermans.md](references/hilton-hermans.md): all 40 of Hilton & Hermans' guidelines, with notes where this file departs from them.
- [references/kettanaito-cheatsheet.md](references/kettanaito-cheatsheet.md): the full naming cheatsheet with more examples.
