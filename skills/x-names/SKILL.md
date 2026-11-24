---
name: x-names
description: How to name variables, constants, fields, types and functions in code, with the reasoning behind each guideline. Use when choosing or reviewing identifier names, designing a config or data shape (struct fields, constants, options), renaming during a refactor, or when the user says a name is vague, unclear or missing units.
---

# Naming identifiers

Sources: Hilton & Hermans, "Naming Guidelines for Professional Programmers" (PPIG 2017, https://hilton.org.uk/presentations/naming-guidelines) and Hermans, *The Programmer's Brain*, ch. 8; Ruud van Asseldonk, "Please put units in names" (https://ruuda.nl/2022/please-put-units-in-names); the Google Testing Blog ("rename it `timeoutMillis`"); Tom Benner, *Naming Things*; kettanaito's naming-cheatsheet (https://github.com/kettanaito/naming-cheatsheet).

## The goal behind every guideline

A name is the only documentation that appears at every place the thing is used. Readers mostly see it at a call site or in a diff, without the definition, its comment or its type in view, and they skim. A good name lets that reader predict correctly what the thing holds or does without opening the definition. A bad name makes them stop and look, or worse, guess wrong and keep going.

The guidelines below are common ways names fail that test. When a case isn't covered, or two guidelines pull in different directions, go back to the test: **what will a reader who sees only this name, at a use site, assume? Is that assumption right?**

The repo's existing conventions win over this file. A reader who knows the codebase predicts from its conventions, so a name that is "better" here but breaks local habit makes them stop and think. Match the code, and mention the conflict instead of renaming things on your own.

## 1. Put the unit in the name

`cooldown: 3` could be 3 seconds, 3 frames or 3 milliseconds. Nothing in the name tells the reader, and in TypeScript (and most languages) the type is just `number`, so the compiler won't catch a mix-up either. Unit mix-ups are silent: the code runs, and the value is wrong by a factor of 60 or 1000. `sleep(300)` means 0.3 ms or 5 minutes depending on the language. Putting the unit in the name turns a silent error into one a reader can see: `delaySeconds = timeoutMillis` looks wrong at a glance.

- `cooldown: 3` → `cooldownSeconds: 3`
- `reach: 140` → `reachPixels: 140`
- `bomblets: 6` → `bombletCount: 6`
- `turn: 0.5` (a factor) → `turnMultiplier: 0.5`
- `angle` → `angleRadians` or `angleDegrees`

Counts end in `Count`. Ratios and factors end in `Multiplier`, `Fraction` or `Ratio`, which also says whether 1 means "unchanged" or "all of it". Rates name both units: `speedPixelsPerSecond`.

Skip the unit when the type already carries it: a Go `time.Duration`, a `Seconds` branded type, or a quantity in one unit everywhere in the codebase. There the type checker catches the mix-up, so the suffix only adds noise.

## 2. Say what it means

Each of these fails the reader's prediction in a different way:

- **Placeholders** (`foo`, `temp`, `flag`, `data`, `obj`, `info`, `value`) predict nothing. Every variable is data, so the name gives the reader no information.
- **Words with many meanings** (`Manager`, `Helper`, `Util`, `process`, `doIt`) let the reader guess anything, and the thing tends to grow to fill the name. `UserManager` ends up doing everything about users. `handle` is the exception: for an event callback (`handleLinkClick`) it has one settled meaning.
- **Repeating the context** (`MenuItem.handleMenuItemClick`). The reader already sees `MenuItem`, so the repeat only makes it longer and harder to scan. Write `MenuItem.handleClick`.
- **Naming against how it's used.** If every use is `disabled={!isEnabled}`, readers do the negation in their heads at every use. Name it `isDisabled`.
- **Several words for one concept** ("jet", "plane", "ship", "craft"). Readers assume different words mean different things and go looking for the difference. Pick one word per concept in each area of the code.
- **Two names for one thing** (`recordCount` and `numberOfRecords`) has the same problem, and **one name for two things** is worse: the reader's prediction is right in one place and wrong in the other.
- **A phrase where one word exists** (`CompanyPerson` → `Employee`, `pickedApples` → `harvest`). The exact word is shorter and carries the whole concept at once.
- **Jokes** (`whack` for `kill`). The joke costs every future reader a moment of translation, and readers who don't get it, or don't speak the language natively, can't predict anything from it.
- **Non-English names** (`primerNombre`). English is the shared language of code, libraries and the rest of the codebase. A name in another language cuts out every reader who doesn't speak it, and a mix of the two means readers have to switch languages mid-line.
- **Invented words** (`isPaginatable`, `shouldPaginatize`). Readers predict from words they already know, and an invented word means nothing to them. Use plain speech: `hasPagination`, `shouldPaginate`.

## 3. Spelling and shape

- **Whole words.** An abbreviation is a lookup the reader has to do. `pos` could be position, positive or point-of-sale, and `cnt` saves two characters. Abbreviations are also hard to search for and easy to spell inconsistently (`btn`, `bttn`, `button`). Keep the ones everyone reads instantly (`id`, `url`, `min`, `max`) and documented domain terms.
- **Single letters** fail the reader and search tools alike. They're fine where convention makes them unambiguous: a short loop index, or `x`, `y`, `t` in a formula that matches the maths it implements.
- **Numeric suffixes** (`missile1`, `missile2`) say there are two but not how they differ, and how they differ is the reason both exist. Name that difference: `leadMissile`, `wingMissile`.
- **Constants named after their value** (`ONE_HUNDRED`) say nothing the literal didn't, and they become lies when the value changes. Name the meaning: `HULL_MAX`.
- **Bounds and transitions** use the standard words `min`/`max` and `prev`/`next`. Readers recognise them instantly. Put the qualifier first, the way it's said aloud: `minPosts`, `maxPosts`, `prevPosts`, `nextPosts`.
- **Length.** Aim for about four words and 20 characters. Longer names wrap, push code off screen, and get skimmed rather than read. A name that needs more words usually means the thing belongs in an object that supplies the context: `power.cooldownSeconds`, not `megaBoostPowerCooldownSeconds`. Once the container gives the context, don't repeat it in the fields.

## 4. Names that look alike

Readers don't read names letter by letter. They recognise them by shape and by their first and last few letters, which is why skimming works at all. Two names in one scope that share their shape get swapped: the reader takes one for the other, or autocomplete picks the wrong one and nothing complains, because both are valid and often the same type.

- **One or two letters apart:** `appleCount` and `appleCounts` in one function, both numbers. A typo between them compiles and quietly uses the wrong value. Rename one for its role, such as `appleCount` and `appleCountTotal`, or `basketCount` and `orchardCount`.
- **Same words, different order:** `countApple` and `appleCount`. Readers remember which words a name has more reliably than their order, so they confuse the two. Change a word, not the order.
- **Names that sound the same:** `wrap` and `rap`, `weight` and `wait`. Code gets discussed aloud in pairing and reviews, so "pass it the rap" is ambiguous in speech even though it's clear on screen.

The test is whether a mix-up would go unnoticed. `for (const missile of missiles)` is fine even though the names differ by one letter: one is a missile and the other a list of them, so the type checker catches a swap and the idiom is universal. The danger is two look-alike names of the same type.

## 5. Values

- **No type encoding** (`strName`, `iCount`, `userList`). The type checker and the editor already show the type, and the prefix goes stale when the type changes. The name should carry what the type can't: meaning, role and unit. A plural already says "collection".
- **Singular for one value, plural for a collection** (`missile`, `missiles`). Readers infer "one or many" from the name before they see the type, and that decides whether they write `.length` or `.x`. A collective noun is even better when one exists (`fleet`, `calendar`, `queue`), because it also says what the collection is for.
- **Booleans read as a true or false statement,** so `if (hasFuel)` reads as English. `status` or `mode` for a yes/no hides that there are only two states and invites a third later. A plain past participle or adjective (`started`, `visible`) works too. The standard prefixes each say what kind of fact it is:

  | Prefix | Means | Example |
  |---|---|---|
  | `is` | a state or characteristic | `isVisible`, `isPresent` |
  | `has` | it holds a value or part | `hasProducts`, not `isProductsExist` or `areProductsPresent` |
  | `can` | it's allowed or able to | `canFire` |
  | `should` | a condition tied to an action | `shouldRetry`, `shouldUpdateUrl` |
- **Positive booleans.** `if (!notHidden)` is a double negative, and readers get double negatives wrong. Name the positive (`visible`), unless every use negates it, in which case §2's "name for how it's used" wins.
- **Standard opposite pairs, used consistently:** `start`/`end`, `first`/`last`, `min`/`max`, `open`/`close`, `source`/`target`. Seeing one, readers predict the other. A mismatched pair (`first`/`end`) makes them wonder whether the two are related at all.
- **A field that picks one of several kinds** is `kind`, or the repo's existing word for it, and its values are nouns. Readers then spot a discriminated union at a glance.

## 6. Types and classes

- **Noun phrases** (`DiscountRule`, not `Calculate`). A type is a thing values *are*, so `const rule: DiscountRule` reads correctly and `const rule: Calculate` doesn't.
- **The name covers every value the type can hold.** A type that holds both enabled and disabled states but is called `ControlEnableState` makes readers assume it means "enabled". Call it `ControlState`.

## 7. Functions and methods

- **Verb phrases** (`calculateDiscount()`). A call is an action, and the verb tells the reader what changes. A pure function that only derives a value may read as a noun (`traits(plane)`, `length`), since calling it is just looking something up.
- **Shape:** optional prefix + action + main context + secondary context, as in `getUserMessages`, `handleClickOutside`, `shouldDisplayMessage`. Word order changes meaning: `shouldUpdateComponent` means you update it, `shouldComponentUpdate` means it updates itself.
- **Name the domain it works on** (`getRecentPosts(posts)`, not `filterRecent(list)`), so readers know what data it expects. Skip it when the language already says so: a JavaScript array's `filter` doesn't need to be `filterArray`.
- **Each verb keeps one meaning across the codebase,** so readers can predict a call's effect from the verb alone:

  | Verb | Means | Example |
  |---|---|---|
  | `get` | a cheap read with no side effects | `getFruitCount()` |
  | `fetch` / `load` | a read that does I/O or may be slow | `fetchUser(id)` |
  | `set` | assign a new value | `setFruits(5)` |
  | `reset` | restore the initial value | `resetFruits()` |
  | `add` / `remove` | put into or take out of a collection; the thing still exists | `removeFilter('price', filters)` |
  | `create` / `delete` | make something exist or stop existing | `deletePost(id)` |
  | `compose` / `build` | make new data from existing data | `composePageUrl(name, id)` |
  | `handle` | respond to an event (callbacks) | `handleLinkClick` |
  | `validate` / `check` | return the result, or throw | `validateEmail(input)` |
  | `toX` / `parseX` / `formatX` | return the converted value | `toRadians(degrees)` |

  Why these meanings matter: readers call `get`, `is` and `has` freely, in loops and in conditions. A `get` that allocates or does I/O breaks that assumption, and the cost shows up as a performance bug far from the name. (Much JavaScript code writes `async getUser()`; if the repo does, follow it.) Mixing `remove` with `delete` makes "taken off the list" and "destroyed" look the same. A `validate` that returns `void` and doesn't throw makes readers believe the input was checked.

## Reviewing names

For each name you choose or review, ask:

- Can a reader tell what it holds or does without opening the definition?
- If it's a number with a unit, is the unit in the name or the type?
- Is a boolean phrased as a positive true/false statement?
- Does a function start with a verb from the table, used with exactly that meaning?
- Does it repeat its enclosing class, module or file?
- Is it plural exactly when it holds a collection?
- Is there a look-alike of the same type in scope?

When you rename something, say in one short phrase what the old name got wrong, such as "`data` → `unpaidInvoices`: says what the list holds" or "`cooldown` → `cooldownSeconds`: unit was missing". That shows the reasoning, and the user can push back on a rename they disagree with.

## Full references

- [references/hilton-hermans.md](references/hilton-hermans.md): all 40 of Hilton & Hermans' guidelines and the ones they rejected, with notes where this file departs from them.
- [references/kettanaito-cheatsheet.md](references/kettanaito-cheatsheet.md): the full naming cheatsheet with more examples.

## Applying it

When designing a data shape, write the fields out with example values and read them aloud: "a cluster bomb with a cooldown of 8 seconds, a reach of 140 pixels, and 6 bomblets". If a field reads as a bare number with no unit, or needs a comment to explain it, the name is missing that information.

When a guideline here seems to give a worse name in a particular case, apply the test from the top of this file and say which way you went and why. The guidelines describe common failures. They are not the goal itself.

When renaming during a refactor, rename every use in one change: search the whole repo, including the server, tools and docs. Behaviour must stay identical. A half-finished rename leaves two names for one thing, which is the failure §2 describes.
