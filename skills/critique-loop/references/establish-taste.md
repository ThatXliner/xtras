# Establish the user's taste

Read this when the user has no taste file yet. The goal is a short file of rules the critics can apply, in the user's own words, built with as little effort from the user as possible. Most people can't list their taste on request, but they recognise it instantly when shown two options, and they state it clearly when they reject something. So gather what they've already said, ask by showing, and let them describe by correcting a draft. It works best before the work is made, but it's never too late.

If no user is present (a scheduled or automated run), skip all of this: judge against the references and the project's rules, and say in the report that there's no taste file yet.

## 1. Gather what they've already said

Read, without asking anything yet:

- their CLAUDE.md / AGENTS.md files, memory files, and the project's style or brand docs;
- corrections and reactions to creative work in the current conversation ("too cheesy", "less text", "I like the cymbals, keep them").

If you can read their past agent sessions, offer to search them for reactions to creative work, and do it only if they agree, since it means reading private conversations.

## 2. Pick mediums, then a recipe for each

Taste differs by medium: someone can want fast, hook-driven video, quiet UI and plain copy all at once. Ask which of these they make (multi-select): **video and animation**, **UI and web design**, **copy and writing**, **images and illustration**, **sound and music**.

Then, for each medium they picked, show that medium's recipes and ask which is closest. Like a film simulation, a recipe is a known look someone else already wrote down; their own answers then adjust it. "None" is a fine answer. Two recipes in one medium can be combined: copy both, and where they disagree, ask which rule the user wants.

**Video and animation**

| Recipe | Look | Good for |
|---|---|---|
| [Epic Indie](recipes/video/epic-indie.md) | big, acted-out, honest | trailers, launch videos, app promos |
| [Retention First](recipes/video/retention-first.md) | the thumbnail's promise, delivered fast | YouTube, Shorts, Reels |
| [Bright Explainer](recipes/video/bright-explainer.md) | sourced ideas as bright visual metaphors | science and civic explainers |
| [Saturday Morning](recipes/video/saturday-morning.md) | classic character animation | cartoons, cutscenes, mascots |

**UI and web design**

| Recipe | Look | Good for |
|---|---|---|
| [No Default UI](recipes/ui/no-default-ui.md) | one bold idea; a page only this product could have | landing pages, marketing sites |
| [Swiss Grid](recipes/ui/swiss-grid.md) | rational grid, neutral type, white space | editorial, dashboards, docs |
| [Apple Polish](recipes/ui/apple-polish.md) | quiet, physical, instantly responsive | app screens, gesture-driven UI |
| [Quiet Motion](recipes/ui/quiet-motion.md) | fast, purposeful UI motion, on its own or with any of the above | interactions, transitions |

**Copy and writing**

| Recipe | Look | Good for |
|---|---|---|
| [Plain & Friendly](recipes/copy/plain-and-friendly.md) | clear, dry humour, no hype | marketing, emails, scripts |
| [Interface Words](recipes/copy/interface-words.md) | short labels in the customer's words | buttons, empty states, onboarding |
| [Precise](recipes/copy/precise.md) | direct, calm, impossible to misread | docs, READMEs, error messages |

Images and sound have no recipes yet; build those sections from the questions below alone.

## 3. Ask by showing

Then ask the three questions below, in one or two batches, as multiple choice wherever possible (the AskUserQuestion tool, or numbered options if it isn't available). Don't ask more: the file grows later from real rejections.

1. **References.** "For each medium you picked, name a few things you'd be proud to have made: creators, channels, apps, films, brands." This one is free text, with the references you found in step 1 as suggestions. If you found none, suggest two or three well-known examples of the medium to react to.
2. **Contrasts.** Show two or three short contrasting directions for the piece at hand (or the next thing they plan to make, if nothing exists yet), as descriptions, frames or thumbnails, and ask which is closest. For example: bold and loud vs calm and polished; hand-drawn vs clean 3D; fast cuts vs long takes; playful vs serious copy. Ask what they'd change about the one they picked.
3. **Dealbreakers.** A multi-select of common failures, asking which ones they've hated before:
   - cheesy taglines or forced hype
   - static visuals and slideshow pacing
   - generic "AI" look: glossy filler, inconsistent characters
   - too much text on screen
   - stock music that fits nothing, or the same track every time
   - music drowning out speech
   - claims that aren't true yet
   - a style that imitates the reference badly
   - reinventing a format they already liked
   - template-looking UI: purple gradients, identical cards, everything centred
   - hype words and invented proof ("seamless", "trusted by thousands")

## 4. Write the file

Write to `~/.claude/critique-loop/taste.md`. It lives outside the plugin, so updates never overwrite it; agents other than Claude Code use the same path under their own config directory (Codex: `~/.codex/critique-loop/taste.md`). Rules that belong to one project, such as a brand's call to action, go in `.claude/critique-loop/taste.md` at that repository's root instead.

Give the file one section per medium they make (`## Video`, `## UI`, `## Copy`, `## Images`, `## Sound`), plus `## Everywhere` for rules that hold in every medium, such as truthful claims. Critics read Everywhere and the sections for the work in front of them, so a rule in the wrong section is a rule they never see.

Copy each recipe they picked into its medium's section, under a sub-heading naming the recipe, then add their own answers. Where their own words contradict a recipe rule, theirs win: delete the recipe rule.

Follow the format of [epic-indie.md](recipes/video/epic-indie.md): group rules under short headings, and for each rule say what to catch, quote the reaction it came from, and say why in a clause. Leave out anything they didn't actually choose or say: a rule you guessed will fail work they'd have liked.

Show them the file and ask what's wrong or missing before the first critique round uses it.

## 5. Keep it growing

Whenever the user rejects or corrects creative work later ("that's tacky", "the music is too loud"), add the rule to their file in their words, and tell them you did. A taste file built from real rejections beats one filled in on day one.
