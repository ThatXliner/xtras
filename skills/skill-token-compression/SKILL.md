---
name: skill-token-compression
description: Shrink an agent skill's token cost without making it harder to follow. Use when a SKILL.md, CLAUDE.md, AGENTS.md or system prompt is too long, costs too many tokens, trips a token-count check, or the user asks to compress, slim down or optimize one. Also use before shipping a skill whose body is over about 2,000 tokens.
---

# Skill token compression

The goal is fewer tokens for the same behaviour, read by an agent that only gets one pass. A skill that's half the size but needs a second read to understand, or that the agent misreads, costs more than it saves: the agent burns reasoning on the riddle, or follows the wrong rule.

The failure to avoid has a recognisable shape. Compression squeezes sentences instead of removing material, so "counts end in `Count`; factors end in `Multiplier`, which says whether 1 means unchanged" becomes "counts and factors say so". The words are fewer, the idea is the same, and now nobody can follow it.

## 1. Measure by load level

Not every token costs the same. Run the bundled counter on the skill folder:

```sh
node <this-skill>/scripts/count_tokens.mjs <skill-dir>
```

It reports three levels, which is where the savings should come from, in this order:

| Level | Loaded | Cost |
|---|---|---|
| `description` | every session, for every skill installed | highest per token; keep it to what decides triggering |
| `SKILL.md` body | whenever the skill triggers | the main target |
| bundled files | only when the agent opens one | nearly free until needed |

Save the "before" numbers. You'll report them at the end. Counts come from tiktoken, not Claude's tokenizer, so compare before and after with the same counter rather than against an absolute limit.

## 2. Snapshot before editing

Copy the skill folder somewhere outside the repo before changing anything. You'll need the original to test against in step 5, and git history isn't enough if the skill is installed somewhere other than a repo.

## 3. Cut material, not sentences

Read the body looking for things that don't change what the agent does. These usually make up most of the savings:

- **Restatements.** A closing checklist that repeats each section's rule, a summary of the section above it, the same reason given twice.
- **Content for humans, not the agent.** Sources, credits, history, motivation for the author. Move these to the skill's README.
- **Situational material.** Content that only matters in some runs (per-language variants, a full verb table, defaults for repos with no conventions, long reference lists). Move it to `references/`, then add a pointer that says when to open it.
- **Things the model already does well.** Generic advice like "write clear code" or "be careful". Test by asking whether removing the line would change any output.

Keep, for every rule:

- **The rule itself, stated in full.** Don't drop the noun that says what it applies to.
- **One concrete example.** Examples carry most of a rule's meaning for the agent. `cooldownSeconds` teaches faster than a sentence about units.
- **The reason, in one clause.** The reason is what lets the agent handle cases the rule didn't anticipate. It's also what the skill-writing guidance most wants kept: explain the why instead of issuing bare commands.

If a sentence can be shortened only by removing one of those three, leave it alone.

## 4. Write pointers as instructions

When material moves to `references/`, the pointer decides whether it ever gets read. A permissive pointer gets skipped. In testing, "Only if there's no convention, use the defaults file" was ignored, and the agent guessed instead. "If there are no existing names of that kind, read `references/defaults.md` before choosing" was followed.

So say when, as a condition the agent can check, and say what to do: "If X, read Y before Z." List every reference file in a short section at the end with one line on what it holds.

## 5. Verify on a fresh reader and on behaviour

Your own judgment can't tell you whether the new version is clear, because you know what it meant to say. Use subagents that don't.

- **Comprehension check.** Give the smallest available model the new SKILL.md and ask it to restate every rule in one plain line, then quote every sentence it had to re-read or could read two ways. A rule restated wrong, or a quoted sentence, marks something compressed too far. Fix the real ambiguities. Ignore requests for exact thresholds where judgment is the point, because over-specifying is the opposite failure.
- **Behaviour check.** Build a small test case where the skill should make a visible difference: a file with names to fix, a commit to write, a doc to review. Run the old snapshot and the new version on it, each in its own subagent, with the same prompt. The outputs should agree on everything the skill governs. Where they differ, find which edit caused it.
- **Reference check.** If you moved anything to `references/`, include a test case that needs it and confirm the subagent reads the file. If it didn't, rewrite the pointer as in step 4.

## 6. Review every example in context

After rewriting, read each example next to the rules around it. A shortened example can contradict its neighbour: `appleCount`/`appleCounts` was meant to show two similar names that get swapped, but it reads as one-vs-many, which the very next rule says is fine. An example that needs a second look to tell which rule it illustrates is doing the opposite of its job.

## 7. Report

Tell the user the token counts before and after for each load level, and what moved where. Report what each check found, including anything you fixed because of it. Don't present a small number as the success measure. If clarity needed tokens back, say so, and say why it was worth it.

If the result is still over a limit the project enforces (a CI token check, for example), say which level is over and what the next cut would cost in clarity, and let the user decide.
