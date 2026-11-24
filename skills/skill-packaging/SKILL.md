---
name: skill-packaging
description: Turn a workflow, a set of preferences or a body of knowledge into a finished, installed agent skill. Research sources and existing skills first, give every rule its reason, keep it compact, verify it, install it, and document it. Use when the user asks to make, package, write or ship a skill, says "turn this into a skill", or wants a repeated workflow captured as one.
---

# Skill packaging

A skill is finished when it has a SKILL.md that tells the agent what to do and a README that tells people why, it has passed a check on a real case, and it is installed where the user's agents load it. Do every step below. Skip one only when the user rules it out or it can't apply, such as no `references/` to test, and say which steps you skipped.

## 1. Pick the home and the name

Decide from the repo first, and ask only if it doesn't settle the question:

- If the current repo, or one the user names, already collects skills (a `skills/` folder, a `.claude-plugin/plugin.json`), put the skill there and follow that repo's layout, README format and naming prefix. A collection's README usually says what each prefix means. For example, xtras uses `x-` for the user's taste, `better-` for objective upgrades and no prefix for utilities.
- Otherwise ask the user where the skill should live. Default to a new folder in their skills repo, not straight into `~/.claude/skills`, because a skill that is only installed has no history and no README.

Name the skill after what it does, in the same form as its neighbours (`skill-token-compression`, `x-names`). Don't use the name of a skill that is already installed. Check `~/.claude/skills`, `~/.codex/skills` and installed plugins.

## 2. Research before writing

Do this before drafting, because a draft anchors you to your own first guesses.

- **Sources.** Search the web for the established guidance on the topic: style guides, papers, well-known posts, the tool's own docs. Read the sources themselves, not summaries. Keep a list with links. It goes in the README.
- **Prior art.** Look for existing skills on the same topic in installed skills and plugins (`rg -il '<topic>' ~/.claude/skills ~/.codex/skills ~/.claude/plugins/marketplaces`) and on the web (GitHub code search for `SKILL.md <topic>`, skill marketplaces). For each one, note what it gets right that yours should keep, and where yours will differ and why. If one already does the job, stop and ask the user whether to install or extend it instead of writing a duplicate.
- **The user's own history.** If the skill captures how the user works, find the corrections and preferences they have actually given, in transcripts, CLAUDE.md or memory files. Use their words. A rule they stated is worth more than a rule you inferred.

## 3. Write rules that carry their reason

Write each rule in three parts:

- **The rule**, stated in full.
- **One concrete example**, preferably a bad-to-good pair (`cooldown: 3` → `cooldownSeconds: 3`). Examples teach the agent faster than prose.
- **The reason**, in one clause. The reason is what lets the agent handle cases the rule didn't anticipate, and lets it notice when two rules conflict.

Where rules can conflict, say which one wins, or give the single test they all come from (x-names asks "what will someone who sees only this name assume?").

Split the material by reader:

- **SKILL.md** holds only what changes what the agent does. Write it to the agent, as instructions.
- **README.md** holds what a person needs: what the skill does, the longer reasoning behind its choices, how it compares with the prior art from step 2, sources with links, and where it came from.
- **`references/`** holds material that only some runs need, such as defaults, long tables or per-language variants. Point to each file with a condition the agent can check: "If X, read `references/y.md` before Z."

Don't bundle full copies of your sources. The skill should hold your distillation of them, and the README should link the originals.

## 4. Keep it compact

Count tokens with `node ../skill-token-compression/scripts/count_tokens.mjs <skill-dir>` (relative to this file). If the SKILL.md body, without frontmatter, is over about 2,000 tokens, or the repo enforces a limit, follow [skill-token-compression](../skill-token-compression/SKILL.md). It cuts material, not sentences, and keeps each rule's example and reason. Don't trade clarity for tokens. If the skill needs to be longer, say so in the report.

Keep the `description` to when the skill applies, with the words a user would actually say. It is loaded every session for every installed skill.

## 5. Verify on a reader that didn't write it

- Give the SKILL.md to a fresh subagent on the smallest available model. Ask it to restate every rule in one plain line and to quote any sentence it had to reread. Fix the SKILL.md wherever it restated a rule wrong or quoted a sentence.
- Build one small case where the skill should make a visible difference. Before installing, run it in one subagent told to read the SKILL.md and in another told not to. If the outputs don't differ where the skill says they should, first check that the case actually needs the skill, then fix the skill.
- If there are `references/` files, include a case that needs one and confirm the subagent opened it.

For a skill whose behaviour can be scored, `anthropic-skills:skill-creator` (if it is installed) runs fuller evals and tunes the description for triggering.

## 6. Install it

Use one install mechanism, so no agent loads two copies:

- **The skill ships in a plugin** (the repo has `.claude-plugin/plugin.json`). Add the skill to the `description` in `plugin.json`, and bump `version` there: minor for a new skill, patch for a fix. Once the user has merged the PR, run `claude plugin marketplace update` and `claude plugin update <plugin>@<marketplace>`, then confirm the installed version with `claude plugin list`.
- **Standalone skill.** Symlink the folder rather than copying it, so edits in the repo take effect: `ln -s <repo>/skills/<name> ~/.claude/skills/<name>`. If the user also runs Codex, add the same link in `~/.codex/skills/<name>`. That's one copy per agent, not two installs.

Then start a fresh session, or use a subagent, and confirm that the skill shows up in its list and triggers on a phrase from its description.

## 7. Document it

- Write the skill's README in the format of its neighbours. It should cover what the skill does, how it works, how it compares with the prior art, sources and origin.
- Add the skill to the collection's top-level README: the listing under the right prefix section, and a token badge if the other skills have one.
- Make sure the README's install instructions cover the new skill. A plugin's install command already does. A standalone skill gets its own `ln -s` line.

## 8. Report

Tell the user:

- where the skill lives and how it is installed;
- what the research found, and how the skill differs from the closest existing skill;
- the token counts for the description and the body;
- what verification showed, including anything you fixed because of it;
- any step you skipped, and why.
