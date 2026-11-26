# x-issues

[![X-issues Tokens](https://img.shields.io/endpoint?url=https%3A%2F%2Fgist.githubusercontent.com%2FThatXliner%2Fcffd977aeb3539c0571ee27356d3a0b3%2Fraw%2Fx-issues-tokens.json)](https://github.com/ThatXliner/xtras/blob/main/skills/x-issues/SKILL.md)

Part of the [**xtras**](../../README.md) plugin.

When you say "defer to gh issue", Claude writes the issue down and goes back to what it was doing. Left to itself, it writes issues the way it writes code comments: file paths, internal names, an implementation plan and acceptance criteria, all packed into long sections. This skill makes it write an issue a person can read in thirty seconds.

## How it works

**Plain words first.** The title says what's wrong or wanted in ordinary words. The body is two or three sentences on what and why, your own words quoted, and only the sections that have something in them: what's already decided, what's still open. Code names and file paths go in only when they're the point.

**What and why, not how.** No implementation plan. Whoever picks the issue up will plan with the code in front of them, and a plan written today goes stale.

**One issue per idea.** "Export + open folder + profiles" becomes three issues. A tracker issue is added only when the ideas are steps toward one goal.

**No duplicates.** It searches open and closed issues first and comments on an existing one instead of filing a new one. It picks the right repo, even when that's not the one you're in.

**Labels.** It uses the repo's labels, and creates one only for a kind of issue that will come up again.

**Then it gets back to work.** No code, one line per issue with its link, and back to the task. It also cleans up existing issues on request: merges duplicates, splits big ones, and rewrites dense ones, after you approve the list.

| Without the skill | With it |
|---|---|
| `Gray out idle collaborators in the Omni status bar`, with sections for Problem, Proposal, Context (y-protocols awareness GC in `awareness.ts`), Open questions and Acceptance criteria | `Gray out collaborators who've gone idle`. Two sentences, your quote, and two open questions |

## Sources

GitHub community guides on writing issues, such as [How to File Useful GitHub Issues](https://github.com/humphd/osd700-winter-2024/wiki/How-to-File-Useful-GitHub-Issues) and [How We Write Github Issues](https://wiredcraft.com/blog/how-we-write-our-github-issues/). pstack's `/bro` is the readability bar ("like one human talking to another"). For a heavier, agent-ready workflow, see Matt Pocock's [`triage` and `to-tickets`](https://github.com/mattpocock/skills).

## Origin

"Defer to gh issue" was the request I made most often across months of Claude Code and Codex sessions, and I kept correcting the same things: duplicates, ideas bundled together, and issues too dense to read.

## Usage

The skill activates when you say "defer to gh issue", "file an issue" or "track this", or ask to clean up issues. You can also invoke it directly with `/x-issues`.
