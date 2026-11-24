# skill-token-compression


Part of the [**xtras**](../../README.md) plugin.

Shrinks an agent skill (or CLAUDE.md, AGENTS.md, system prompt) without making it harder to follow. The usual way to cut tokens is to squeeze sentences, and that turns rules into riddles: "counts end in `Count`; factors end in `Multiplier`" becomes "counts and factors say so". The agent then spends reasoning decoding it, or follows the wrong rule. This skill cuts material instead and keeps every rule's example and reason.

## How it works

1. **Measure by load level.** A bundled script counts tokens for the description (loaded every session), the body (loaded on trigger) and each bundled file (loaded only when opened), so savings come from where they matter.
2. **Snapshot** the original for testing later.
3. **Cut material, not sentences:** restatements, content for humans (sources, credits), material that only matters in some runs (moved to `references/`), and advice the model follows anyway.
4. **Write pointers to references as instructions** ("If X, read Y before Z"). Permissive pointers ("only if…") were skipped in testing.
5. **Verify with subagents that didn't write it:** a small model restates every rule and flags anything it re-read; old and new versions run the same test case; any moved reference gets a test that needs it.
6. **Re-read every example in context**, since a shortened example can contradict the rule next to it.
7. **Report** before and after per load level, what moved, and what the checks found.

## Token counter

```sh
node skills/skill-token-compression/scripts/count_tokens.mjs <skill-dir> [<skill-dir> ...]
```

Uses `tiktoken` if it's installed in the current directory (`npm i tiktoken`), otherwise estimates 4 characters per token. Claude's tokenizer differs, so compare versions with the same counter rather than reading the numbers as exact.

## Origin

Written after compressing [x-names](../x-names/README.md): the first pass halved it but needed a second read in a dozen places, and the fix restored about half the cut. Run on the original x-names, this skill landed at the corrected size on its first try.
