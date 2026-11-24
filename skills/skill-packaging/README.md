# skill-packaging

[![Skill-packaging Tokens](https://img.shields.io/endpoint?url=https%3A%2F%2Fgist.githubusercontent.com%2FThatXliner%2Fcffd977aeb3539c0571ee27356d3a0b3%2Fraw%2Fskill-packaging-tokens.json)](https://github.com/ThatXliner/xtras/blob/main/skills/skill-packaging/SKILL.md)

Part of the [**xtras**](../../README.md) plugin.

Turns a workflow, a set of preferences or a body of knowledge into a finished skill: researched, explained, compact, verified, installed and documented. Asked to "make a skill", Claude usually writes a SKILL.md from memory and stops there. It skips the sources, never checks whether a better skill already exists, writes bare rules with no reasons, and leaves the skill uninstalled with no README. This skill makes those steps part of the job.

## How it works

1. **Home and name.** If you're already in a skills collection, the skill goes there and follows its layout and prefix convention. A skill that only lives in `~/.claude/skills` has no history and no README.
2. **Research first.** Claude reads the established sources on the topic, looks for existing skills on the same topic (installed and on the web), and mines your own corrections when the skill is about how you work. It does this before drafting, because a draft anchors Claude to its first guesses. If an existing skill already does the job, it says so instead of writing a duplicate.
3. **Rules carry their reason.** Each rule gets one concrete example and its reason in one clause. The reason is what lets an agent handle a case the rule didn't anticipate. SKILL.md holds only what the agent acts on. The README holds the longer reasoning, the comparison with prior art, and source links. `references/` holds material that only some runs need.
4. **Compact, not compressed.** Over about 2,000 tokens, Claude hands off to [skill-token-compression](../skill-token-compression/README.md), which cuts material rather than squeezing sentences.
5. **Verified on a fresh reader.** A small model restates every rule, and one test case runs with and without the skill to show it changes something.
6. **Installed one way.** A plugin skill gets a version bump and a plugin update. A standalone skill is symlinked into `~/.claude/skills`, and into `~/.codex/skills` if you use Codex. It is never installed both ways, so it never loads twice.
7. **Documented.** The skill's README, the collection's listing and badge, and install instructions.

## Compared with

- **Anthropic's `skill-creator`** is the general tool for writing skills, running evals and tuning descriptions. Its research step is optional ("if useful"), and it ends with a `.skill` file or a save button. It doesn't compare against prior art, write a README, or install the skill into a repo, plugin or `~/.claude/skills`. skill-packaging makes research a required first step, covers what comes after, and points to skill-creator for heavier evals.
- **pstack's `automate-me`** captures one person's whole working style as a `-mode` skill. skill-packaging is for one topic or workflow.
- **[skill-token-compression](../skill-token-compression/README.md)** handles step 4 and is called from here rather than repeated.

## Origin

[Issue #26](https://github.com/ThatXliner/xtras/issues/26) found it by mining session history (Claude Code, May to November 2026, and Codex, August to November 2026). The same steps were done by hand for a naming skill, a video style, release flows, startup-viability and [x-names](../x-names/README.md). Each time the requests were the same: research sources first, explain the why, compare with existing skills, install globally, add install instructions, and stay compact without over-compressing.
