# critique-loop


Part of the [**xtras**](../../README.md) plugin.

Gets creative work (video, animation, art, UI visuals, sound, marketing copy) past independent critics before you see it, so you stop being the one who says "that's cheesy" or "the animation is lacking" every round. The agent that made the work can't judge it, because it sees what it meant instead of what it made. Fresh critics who only see the result, judged against references you already approved, can.

## How it works

1. **Set the bar:** references you liked or named, the project's own rules and "mistakes the critics caught" list, your taste file (built with you the first time), and the facts the work claims.
2. **Build an evidence pack** critics can perceive. They can't play video or hear audio, so [`scripts/pack.mjs`](scripts/pack.mjs) turns a video into 5 fps frame strips (motion), a contact sheet (composition), a spectrogram (sound), and numbers: frozen-frame share and loudness, side by side with the references.
3. **Two critics in parallel** at high effort, each with a different [lens](references/lenses.md) for the medium, each ending PASS or FAIL with located, ranked fixes.
4. **Fix and repeat with fresh critics.** New agents each round, because a critic anchors on its own earlier verdict. Fixes that would help every future piece go into the shared kit, and the lesson goes into the project's mistakes list.
5. **After three failed rounds,** fix the named blockers and ship anyway, reporting what's still open.

## Pack builder

```sh
node skills/critique-loop/scripts/pack.mjs <video-or-audio> --ref <reference>... --out <dir> [--ignore-band 0.6,0.75]
```

Needs `ffmpeg` and `ffprobe`. `--ignore-band` skips a horizontal band when measuring motion, so burned-in captions don't hide frozen art.

## Your taste, not mine

Critics judge against **your** taste file at `~/.claude/critique-loop/taste.md`, plus an optional per-project one at `.claude/critique-loop/taste.md`. If you don't have one, the skill helps you build it the first time: it gathers what you've already said (CLAUDE.md, memory, this conversation), asks you to pick between contrasting directions, and asks which common failures you hate, then shows you the file. After that it grows by itself: every time you reject something, the rule is added in your words. Automated runs with nobody to ask fall back to your references and say so.

## Recipes

Like Fujifilm film simulations, recipes are known looks, grouped by medium, that you can start your taste file from, or name for a single piece ("critique it like Retention First"). Each one is distilled from a public source and credited; your own rules always win over a recipe's.

**Video and animation**

| Recipe | Look | Built from |
|---|---|---|
| [Epic Indie](references/recipes/video/epic-indie.md) | big, acted-out, honest | my own taste file, from rejections of real work |
| [Retention First](references/recipes/video/retention-first.md) | the thumbnail's promise, delivered fast | public reporting on MrBeast's guide "How to Succeed in MrBeast Production" ([Simon Willison](https://simonwillison.net/2024/Sep/15/how-to-succeed-in-mrbeast-production/), [Tubefilter](https://www.tubefilter.com/2024/09/17/mrbeast-internal-production-guide-leaked-key-points/)) |
| [Bright Explainer](references/recipes/video/bright-explainer.md) | sourced ideas as bright visual metaphors | [Kurzgesagt's published process](https://kurzgesagt.org/youtube/) |
| [Saturday Morning](references/recipes/video/saturday-morning.md) | classic character animation | the 12 principles from Frank Thomas and Ollie Johnston, *The Illusion of Life: Disney Animation* (1981) |

**UI and web design**

| Recipe | Look | Built from |
|---|---|---|
| [No Default UI](references/recipes/ui/no-default-ui.md) | one bold idea; a page only this product could have | Anthropic's [frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design), [taste-skill](https://github.com/Leonxlnx/taste-skill) (MIT), [agent-design-taste](https://github.com/aievolutionpl/agent-design-taste) (MIT), [tastemaker](https://github.com/Harrypatria/tastemaker) (MIT) |
| [Swiss Grid](references/recipes/ui/swiss-grid.md) | rational grid, neutral type, white space | the International Typographic Style ([Wikipedia](https://en.wikipedia.org/wiki/International_Typographic_Style), [Smashing Magazine](https://www.smashingmagazine.com/2009/07/lessons-from-swiss-style-graphic-design/), [PRINT](https://www.printmag.com/featured/swiss-style-principles-typefaces-designers/)) |
| [Apple Polish](references/recipes/ui/apple-polish.md) | quiet, physical, instantly responsive | Emil Kowalski's [apple-design skill](https://github.com/emilkowalski/skills), a web translation of Apple's WWDC design talks |
| [Quiet Motion](references/recipes/ui/quiet-motion.md) | fast, purposeful UI motion | Emil Kowalski's [design-engineering skill](https://github.com/emilkowalski/skills) |

**Copy and writing**

| Recipe | Look | Built from |
|---|---|---|
| [Plain & Friendly](references/recipes/copy/plain-and-friendly.md) | clear, dry humour, no hype | the [Mailchimp Content Style Guide](https://styleguide.mailchimp.com/voice-and-tone/) (CC BY-NC 4.0, © Mailchimp) and common lists of AI writing tells |
| [Interface Words](references/recipes/copy/interface-words.md) | short labels in the customer's words | 37signals' [*Getting Real*](https://basecamp.com/gettingreal/09.7-copywriting-is-interface-design) |
| [Precise](references/recipes/copy/precise.md) | direct, calm, impossible to misread | the [Google developer documentation style guide](https://developers.google.com/style/highlights) |

Images and sound have no recipes yet.

Recipes are summaries in my own words, not written or endorsed by their sources. Send a PR with yours.

## Sources

- Madaan et al., ["Self-Refine: Iterative Refinement with Self-Feedback"](https://arxiv.org/abs/2303.17651) (2023): output improves when it is critiqued and revised over several rounds.
- Huang et al., ["Large Language Models Cannot Self-Correct Reasoning Yet"](https://arxiv.org/abs/2310.01798) (2023): a model critiquing its own work without outside feedback often doesn't improve it, which is why the critics here are separate agents that didn't make the work.
- The critique step in the Billion video pipeline (`gen-vid/references/critique.md`), which this generalises.

Closest existing skill: pstack's `arena`, which generates several candidates and has them judged against each other. critique-loop improves one piece through rounds of fresh critics instead.

## Origin

Generalised from the critique step in the Billion video pipeline, which came from six critic rounds on real episodes. Its first test run, on a finished Billion short, caught a factual error the script implied (a 60-day effective date presented as two years), a silent voice-provider fallback, and a retired visual style, all with timestamps.
