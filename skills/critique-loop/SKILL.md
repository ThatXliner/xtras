---
name: critique-loop
description: Run independent critic subagents on creative work (video, animation, trailers, art, illustration, UI visuals, sound, marketing copy) and revise until they pass, before showing the user. Use whenever you've produced or substantially changed something the user will judge by looking or listening, including output from hyperframes, brag, gen-vid, style-sampling or any image or video pipeline, even if the user didn't ask for a review.
---

# Critique loop

You can't judge your own creative work well. You know what each shot was meant to say, so you see the intent instead of the result, and anything you didn't think of stays invisible. The user then becomes the critic, round after round ("the animation is very lacking", "that's cheesy", "the music is the same for all of them"). This skill moves those rounds before the user sees the work: critics who didn't make it, who see only the result, judged against a bar the user already set.

Run it on new pieces and on substantial changes. Skip it for a one-word copy fix or a colour tweak the user dictated exactly.

## 1. Set the bar

A critic with no reference judges against generic taste, which is how "competent but bland" passes. Before anything else, collect what the work should be compared with:

- **References the user approved or named:** earlier pieces they liked, a creator they pointed at ("like Rick's Clips"), the project's best performer.
- **The project's own rules:** a skill or doc for this pipeline (its checklist and "mistakes the critics caught" list), BRANDING.md, a style guide.
- **The user's taste:** read `~/.claude/critique-loop/taste.md` (the user's own rules, in their words) and the project's `.claude/critique-loop/taste.md` if there is one. If the user has no taste file, read [references/establish-taste.md](references/establish-taste.md) and help them build one before round one. If no user is present (an automated run), judge against the references alone and say in the report that there's no taste file. If the user names a recipe for this piece ("critique it like Retention First"), also read it from [references/recipes/](references/recipes/) (one folder per medium); their own file wins where the two disagree. Without a taste file, critics fall back to generic taste, which is how "competent but bland" passes.
- **Facts the work states or implies:** where the product is available, prices, dates, features, names. Critics check claims against these, so put the sources in the pack (README, store listing, release notes).

## 2. Build the evidence pack

Critics can read text and look at images; they can't play a video or hear audio. Turn the work into things they can perceive, or they'll judge a still frame and miss that nothing moves.

- **Video or animation:** run `node <this-skill>/scripts/pack.mjs <video> --ref <reference video>... --out <dir>`. It writes 5 fps frame strips (motion), a contact sheet (composition and variety), a spectrogram (audio texture), and prints frozen-frame share and loudness for the work and each reference. Add `--ignore-band 0.6,0.75` when burned-in captions would hide frozen art. Include the thumbnail and title when the work has them; they're judged with it.
- **Audio-only:** the same script gives the spectrogram and loudness numbers. Add the narration script or lyrics, and list the music tracks used in the project's recent pieces so a repeat is visible.
- **Images, illustrations, UI:** screenshots at real display size, plus close crops of the focal detail. For UI, capture them the way the `show-me` skill does, in the real running app. For UI motion, a screen recording run through `pack.mjs`.
- **Copy:** the text exactly as it will appear, with the facts file from step 1.

Set hard gates from the numbers where the project has them (for example, the Billion video pipeline fails a video above 12% frozen frames). If a gate fails, don't send critics yet: fix it, rebuild the pack, and only then start the round.

## 3. Two critics, in parallel, with different lenses

A round is one evidence pack judged by one pair of critics. Spawn two fresh subagents at the same time (Agent tool, the strongest model available at its highest effort, foreground). Pick a lens for each from [references/lenses.md](references/lenses.md), so they look for different things instead of agreeing with each other.

Give each critic the pack, the brief, the bar from step 1, and the taste file's Everywhere section plus the sections for the work's mediums (a video with captions gets Video and Copy). A taste file without medium sections applies to everything. Tell them:

- don't edit any files, and be blunt;
- name every problem with a location (timestamp, strip, region, line);
- rank fixes by how much they'd change the user's reaction;
- end with a verdict: **PASS** ("I'd put this next to the reference without wincing") or **FAIL**.

## 4. Fix and repeat with fresh critics

Fix every finding that names a bug, a false claim or something broken, then the top-ranked taste fixes. Rebuild the pack and send a **new** pair of critics, with the previous rounds' findings listed so they can confirm each was fixed. Don't reuse the same agents: a critic anchors on what it said before and approves its own fixes.

When a fix would help every future piece, make it in the shared code or template the pipeline reuses, not just in this piece. Add the lesson to the project's "mistakes the critics caught" list (create one in the project's skill or docs if there isn't one), so the next run starts ahead.

The work passes when both critics pass and every hard gate holds.

## 5. After three rounds

If round three still fails, fix the blockers it named, then ship anyway: show the work to the user, or, if a pipeline called this skill, let it continue to publishing. More rounds cost more than they recover, and recurring output can't miss its slot. Say clearly what's still open.

## 6. Learn and report

When the user later rejects or corrects the work, add the rule to their taste file in their own words and tell them you did, so the next critique catches it before they have to.

Then tell the user, briefly: how many rounds ran, what the critics caught and what changed, the hard-gate numbers against the reference, and anything still open with the critic's location for it. Show the final work alongside, not a description of it.
