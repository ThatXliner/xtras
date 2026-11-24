---
name: add-xtras-skill
description: Add a new skill to the xtras plugin, or turn a workflow, preferences or a body of knowledge into one. Covers research, writing, token budget, verification, wiring it into the plugin and README, and installing the release. Use when asked to add, make, package or ship a skill in this repo.
---

# Add a skill to xtras

A new xtras skill is done when its `SKILL.md` and `README.md` exist, it is listed in the root README and `plugin.json`, it has passed a check on a real case, and the released plugin is installed. Do every step. Skip one only when the user rules it out, and say which steps you skipped.

## 1. Name it

Choose the prefix from the root README's sections:

- `x-` for the user's taste (`x-commit`, `x-names`).
- No prefix for everything else (`skill-token-compression`, `show-me`).

Name it after what it does. Check that the name isn't taken in `skills/`, `~/.claude/skills`, `~/.codex/skills` or `claude plugin list`.

## 2. Research before writing

Do this before drafting, because a draft anchors you to your first guesses.

- **Sources.** Search the web for the established guidance on the topic, and read the sources themselves. Keep the links for the README's Sources section.
- **Prior art.** Look for existing skills on the topic in `~/.claude/skills`, `~/.codex/skills`, `~/.claude/plugins/marketplaces`, and on the web (GitHub code search for `SKILL.md <topic>`, skills.sh). If one already does the job, stop and ask the user whether to install or extend it instead.
- **The user's history.** For an `x-` skill, find the corrections the user actually gave in transcripts, CLAUDE.md and memory files, and use their words. A rule they stated beats a rule you inferred.

## 3. Write it

Write each rule as the rule, one bad-to-good example (`cooldown: 3` → `cooldownSeconds: 3`), and its reason in one clause. The reason lets the agent handle cases the rule didn't anticipate. Where rules can conflict, say which wins, or give the one test they come from.

Files go in `skills/<name>/`:

- `SKILL.md` holds only what changes what the agent does. Its frontmatter has `name` and a `description` that says when to use it, in the words a user would say.
- `README.md` copies the format of `skills/x-names/README.md`: token badge, "Part of xtras", what it does, how it works, sources with links, origin.
- `references/` holds material only some runs need. Point to each file with a condition: "If X, read `references/y.md` before Z." Don't bundle full copies of sources. Link them from the README instead.

## 4. Keep it under the badge limit

CI counts `SKILL.md` and turns the badge red at 2,000 tokens. Count locally with `node skills/skill-token-compression/scripts/count_tokens.mjs skills/<name>`. If the body is near or over 2,000, follow `skills/skill-token-compression/SKILL.md`. If the skill needs the tokens, say so rather than cutting rules or examples.

## 5. Verify on a reader that didn't write it

- Give the SKILL.md to a haiku subagent. Ask it to restate every rule in one line and quote any sentence it had to reread. Where it got a rule wrong, reword that rule so it can't be misread.
- Build one small case where the skill should make a visible difference. Run it in one subagent told to read the SKILL.md and one told not to. If they don't differ where the skill says they should, first check that the case actually needs the skill. If it does, the skill's wording is the problem.
- If the behaviour can be graded by a script, add the case under `.claude/skills/run-xtras/evals/<name>/` and run it with `run-xtras`.

## 6. Wire it into the plugin

- In the root README, add the badge line after the others (same gist URL, with `<name>-tokens.json`), and a one-line listing under the prefix's section.
- In `.claude-plugin/plugin.json`, add the skill to `description`.
- Run `claude plugin validate .`.
- Commit the skill with `/x-commit`. Then bump `version` (minor for a new skill, patch for a fix) in a separate `:bookmark: chore(release): bump to X.Y.Z` commit.
- Open the PR on a branch. The token-count check comments each skill's count.

## 7. Install the release

After the user merges, run `claude plugin marketplace update`, then `claude plugin update xtras@ThatXliner`, and confirm the version with `claude plugin list`. Don't also symlink the skill into `~/.claude/skills`, because that loads it twice. Tell the user to restart so the skill loads.

## 8. Report

Tell the user the name and prefix, what the research found and how the skill differs from the closest existing one, the description and body token counts, what verification showed and fixed, the PR link, and any skipped step.
