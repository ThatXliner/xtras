---
name: x-issues
description: File a GitHub issue for something the user wants to deal with later, written so a person can read it in thirty seconds, then go back to the current task. Use when the user says "defer to gh issue", "file an issue", "make an issue for this", "track this", "add it to the issue", or asks to clean up, split or simplify existing issues.
---

# Filing issues

"Defer to gh issue" means: write it down well, don't build it, and keep going with what you were doing. The issue is for a person, often the user weeks from now, who wasn't in this chat and will skim it in a list.

## 1. Find where it goes

- **Repo.** Use the current repo unless the user names another or the idea plainly belongs to a different project ("defer to gh issue on the honeypot repo"). If you file somewhere other than the current checkout, say which repo in your reply.
- **Search first.** Run `gh issue list --state all --search "<two or three key words>"` and also try a synonym. If an open issue already covers it, add a comment there instead of filing a new one. If a closed one does, mention it and ask whether to reopen. Duplicates split the discussion.
- **Trackers.** If an epic or tracking issue covers this area, link the new issue from it (add it to its checklist, or `gh issue edit <tracker>` to append a line).

## 2. One issue per idea

Split anything that would need "and" in the title. "Export the library as one file + open its folder + configurable profiles" is three issues, because each can ship and close on its own. When the user dumps several ideas at once, file each. Add a tracker issue that lists them as a checklist only when they are steps toward one larger goal; loosely related ideas don't need one.

## 3. Write it plainly

This is the part that matters most. Agent-written issues tend to be dense: internal names, file paths, implementation plans and every caveat, packed into long paragraphs. The user has said they are hard to read. Write the way you'd explain it to a teammate out loud.

**Title:** what's wrong or what's wanted, in ordinary words, under about 60 characters. Not a category prefix, not a code identifier.
`Omni: awareness lastActiveAt idle state for presence` → `Gray out collaborators who've gone idle`

**Body**, using only the sections that have something in them:

```markdown
<A tiny story of the problem as someone using it would hit it. Two to four sentences.>

<What we want instead, in one or two sentences.>

**Where this came from:** <the user's words, quoted, or what the screenshot shows; link to the PR, commit or issue it came up in>

**Already decided:**
- <a decision the user made, one line each>

**Open questions:**
- <something still to figure out>
```

Rules for the body:

- **Tell it as a story.** Open with a concrete moment: who is doing what, and what goes wrong or what's missing. A reader gets "You and Sam are editing a doc. Sam leaves for lunch, but their avatar still looks like they're typing" faster than "presence has no idle state", and the story shows why it matters without arguing for it. For a bug, the story is the steps and what you saw.
- **Short sentences, everyday words.** If a term only makes sense to someone who read the code, say what it does instead: "the 'who's here' avatars" rather than `PresenceStrip`. File paths and function names go in only when they are the point of the issue, such as a bug in one function.
- **What and why, not how.** Don't write an implementation plan. Whoever picks it up will plan with the code in front of them, and a plan written today goes stale. Keep a "how" only when the user already decided it; it goes under **Already decided**.
- **Name the general problem, then the example.** If the user's point is bigger than the case in front of you, file one issue about the bigger thing and use the case as its example. "Glass panels don't use one opacity; the sidebar is the case that prompted this" beats an issue about the sidebar alone, because it gets the whole problem fixed.
- **Keep the user's own words.** Quote their phrasing for what they want; it carries their intent better than a paraphrase.
- **Screenshots.** `gh` can't attach images, so describe what the screenshot shows in one line ("the date reads 2026-11-24 where 'Tuesday' would be clearer").
- **Nothing private.** In any repo, leave out secrets, personal details and anything from other private projects. Private repos gain collaborators and sometimes go public, and an issue's history keeps what you wrote.

Before filing, reread it as someone who wasn't here. If it takes more than about thirty seconds to see what's being asked, cut the body down until it doesn't.

## 4. Label it

Run `gh label list` and add the labels that fit (`gh issue create --label`). If none fits and this kind of issue will come up again, don't create a label yourself. File the issue without it, then ask the user: give the label's name and a one-line description ("New label `card-request`: requests for new cards?"), and wait for an OK. Labels are shared by everyone on the repo, so creating one is the user's call. On an OK, run `gh label create <name> --description "..."` and add it to the issue. Don't propose a label for a one-off.

## 5. Go back to work

Don't write any code for the issue. Reply with one line per issue (title and link) and continue the task you were on. Start on an issue only when the user asks for that too ("defer to gh issue and start working on it").

Later, when work that resolves an issue ships, put `Closes #N` in the PR description so it closes on merge.

## Cleaning up existing issues

If the user asks to triage, simplify, split or dedupe the issues already in a repo, read `references/cleanup.md` before changing any issue.
