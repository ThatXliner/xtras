# Hilton & Hermans naming guidelines (full list)

From Peter Hilton and Felienne Hermans, "Naming Guidelines for Professional Programmers" (PPIG 2017), as listed at https://hilton.org.uk/presentations/naming-guidelines. Rules are condensed; the examples are the bad names the source gives. Where SKILL.md departs from a rule, the note says so.

## Syntax

1. **Use naming conventions.** Follow the language's conventions. Bad: `appleCOUNT`, `apple_count` where camelCase is standard.
2. **Replace numeric suffixes.** Bad: `employee2`.
3. **Use dictionary words.** Only correctly spelled words and abbreviations, except `id` and documented domain terms. Bad: `acc`, `pos`, `char`, `mod`, `auth`, `appCnt`.
4. **Expand single-letter names.** Bad: `i`, `j`, `k`, `l`, `m`, `n`, `t`, `x`, `y`, `z`. (SKILL.md allows a short loop index and maths symbols.)
5. **Articulate symbolic names.** Bad: `>=>`, `<*>`.
6. **Name constant values.** Name what it represents, not its value. Bad: `3.142591`, `ONE_HUNDRED`.
7. **Only one underscore at a time.** Bad: `APPLE__COUNT`.
8. **Only underscores between words.** Bad: `_APPLE_COUNT`, `APPLE_COUNT_`.
9. **Limit name length** to 20 characters. Bad: `ForeignDomesticAppleCount`.
10. **Limit word count** to four, and avoid gratuitous context. Bad: `NewRedAppleSizeType`, `MyAppSizeType`.
11. **Qualify values with suffixes.** `MINIMUM_APPLE_COUNT` → `APPLE_COUNT_MINIMUM`. (SKILL.md puts the qualifier first instead: `minPosts`.)
12. **Make names unique.** Don't shadow a name in the same scope.

## Vocabulary

13. **Describe meaning.** Bad: `foo`, `blah`, `flag`, `temp`.
14. **Be precise.** Bad: `data`, `object`.
15. **Choose concrete words.** Bad: `Manager` suffix, `get` prefix, `doIt`.
16. **Use standard language.** Bad: `whack` for `kill`.
17. **Use a large vocabulary.** `CompanyPerson` → `Employee`.
18. **Use problem domain terms,** one per concept in each bounded context. Bad: `Order` when you mean `Shipment`.
19. **Differ by more than one or two letters.** Bad: `appleCount` / `appleCounts`. (SKILL.md uses `itemTotal` / `itemsTotal`, since the source's pair reads as one-vs-many, which is fine when the types differ.)
20. **Differ by more than word order.** Bad: `appleCount` / `countApple`.
21. **Differ in meaning.** Bad: `input` / `inputValue`, `recordCount` / `numberOfRecords`.
22. **Differ phonetically.** Bad: `wrap` / `rap`.

## Data types

23. **Omit type information.** No Hungarian notation, and no `is` on booleans. `isValid` → `valid`, `dateCreated` → `created`, `iAppleCount` → `appleCount`. (SKILL.md allows `is`/`has`/`can`/`should` on booleans.)
24. **Singular names for values.** `appleCounts` for one value → `appleCount`.
25. **Plural names for collections.** `remainingApple` for a set → `remainingApples`.
26. **Prefer collective nouns.** `appointments` → `calendar`, `pickedApples` → `harvest`.
27. **Use opposites precisely.** Bad: `first` / `end`.
28. **Booleans imply true or false.** Bad: `status` for `started`.
29. **Positive booleans.** Bad: `notSuccessful`.

## Classes

30. **Noun phrases.** `Calculate` → `DiscountRule`.
31. **Allow all possible states.** `ControlEnableState` → `ControlState`.
32. **Consistent with possible values.** A `start` field of type `MAssociationEnd` → rename the type `MAssociationExtremity`.

## Methods

33. **Verb phrases,** except accessors. Bad: `calculation()`.
34. **No `get`/`is`/`has` on methods with side effects.** Bad: `getImageData` that constructs a new object.
35. **`get`/`is`/`has` only for field access.** Bad: `getScore` that calculates or reads external data.
36. **`get` only for accessors that return a value.** Bad: `getMethodBodies` that populates but doesn't return.
37. **`is`/`has` only for boolean accessors.** Bad: `isValid` returning an `int`.
38. **`set` only for accessors that return nothing.** Bad: `setBreadth` that returns a new object or `this`.
39. **Validation verbs only when the method provides the result.** Bad: `validateSnaps` returning `void`.
40. **Transformation verbs only when the method returns the transformed value.** Bad: `javaToNative` returning `void`.

## Guidelines the authors rejected

- Long names for long scopes: rejected, because it encourages bad names.
- Avoiding names under eight characters: not used; they prefer avoiding abbreviations.
- Two-to-four-word rule: not used. Twenty-character limit: partly accepted.
- Qualifying class names (`FruitClass`): rejected.
- Composing names only from singular words: rejected.
- Avoiding two similar names in scope: undecided.
- Alphabetical enum order: partly accepted. Qualifying enum constants with the type name: makes little sense.
