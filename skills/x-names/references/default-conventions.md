# Default naming conventions

Use these only where the codebase has no convention of its own. Each one is a reasonable choice, not the only one; what matters is that a codebase picks one and sticks to it. If the repo does it differently, the repo wins.

## Case

Follow the language's standard: `camelCase` values and `PascalCase` types in JS/TS, Java, C# and Swift; `snake_case` values and `PascalCase` types in Python and Rust; `SCREAMING_SNAKE_CASE` for constants where the language uses it.

## Unit and quantity suffixes

- Spell the unit out after the name: `cooldownSeconds`, `reachPixels`, `angleRadians`. `Millis` is common enough to keep (`timeoutMillis`).
- Rates name both units: `speedPixelsPerSecond`.
- Counts end in `Count`: `bombletCount`, not `bomblets` or `numBomblets`.
- Factors end in `Multiplier` (1 means unchanged), `Fraction` or `Ratio` (1 means all of it): `turnMultiplier`, `healthFraction`.

## Qualifiers

Qualifier first, the way it's said aloud: `minPosts`, `maxPosts`, `prevPosts`, `nextPosts`. (Hilton & Hermans put it last, `postsMin`; either works if used consistently.)

## Booleans

| Prefix | Means | Example |
|---|---|---|
| `is` | a state or characteristic | `isVisible` |
| `has` | it holds a value or part | `hasProducts`, not `isProductsExist` |
| `can` | it's allowed or able to | `canFire` |
| `should` | a condition tied to an action | `shouldRetry` |

A bare adjective or past participle (`visible`, `started`) is also fine when the repo prefers it.

## Discriminated unions

The field that picks the variant is `kind`, and its values are nouns: `{ kind: "circle", radius }`.

## Function names

Shape: optional prefix + action + main context + detail: `getUserMessages`, `handleClickOutside`, `shouldDisplayMessage`.

Verb meanings:

| Verb | Means | Example |
|---|---|---|
| `get` | a cheap read with no side effects; callers use it in loops and conditions | `getFruitCount()` |
| `fetch` / `load` | a read that does I/O or may be slow | `fetchUser(id)` |
| `set` | assign a new value; returns nothing | `setFruits(5)` |
| `reset` | restore the initial value | `resetFruits()` |
| `add` / `remove` | put into or take out of a collection; the thing still exists | `removeFilter("price", filters)` |
| `create` / `delete` | make something exist or stop existing | `deletePost(id)` |
| `compose` / `build` | make new data from existing data | `composePageUrl(name, id)` |
| `handle` | respond to an event (callbacks) | `handleLinkClick` |
| `validate` / `check` | return the result, or throw | `validateEmail(input)` |
| `toX` / `parseX` / `formatX` | return the converted value | `toRadians(degrees)` |

Why these meanings: a `get` that allocates or does I/O turns into a performance bug far from the name; mixing `remove` and `delete` makes "taken off the list" and "destroyed" look the same; a `validate` that returns `void` without throwing makes readers believe the input was checked.
