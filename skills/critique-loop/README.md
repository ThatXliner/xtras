# critique-loop

[![Critique-loop Tokens](https://img.shields.io/endpoint?url=https%3A%2F%2Fgist.githubusercontent.com%2FThatXliner%2Fcffd977aeb3539c0571ee27356d3a0b3%2Fraw%2Fcritique-loop-tokens.json)](https://github.com/ThatXliner/xtras/blob/main/skills/critique-loop/SKILL.md)

Part of the [**xtras**](../../README.md) plugin.

Gets creative work (video, animation, art, UI visuals, sound, marketing copy) past independent critics before you see it, so you stop being the one who says "that's cheesy" or "the animation is lacking" every round. The agent that made the work can't judge it, because it sees what it meant instead of what it made. Fresh critics who only see the result, judged against references you already approved, can.

## How it works

1. **Set the bar:** references you liked or named, the project's own rules and "mistakes the critics caught" list, your [taste](references/taste.md), and the facts the work claims.
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

[`references/taste.md`](references/taste.md) is the bar critics judge against, taken from my own rejections. Replace it with yours.

## Sources

- Madaan et al., ["Self-Refine: Iterative Refinement with Self-Feedback"](https://arxiv.org/abs/2303.17651) (2023): output improves when it is critiqued and revised over several rounds.
- Huang et al., ["Large Language Models Cannot Self-Correct Reasoning Yet"](https://arxiv.org/abs/2310.01798) (2023): a model critiquing its own work without outside feedback often doesn't improve it, which is why the critics here are separate agents that didn't make the work.
- The critique step in the Billion video pipeline (`gen-vid/references/critique.md`), which this generalises.

Closest existing skill: pstack's `arena`, which generates several candidates and has them judged against each other. critique-loop improves one piece through rounds of fresh critics instead.

## Origin

Generalised from the critique step in the Billion video pipeline, which came from six critic rounds on real episodes. Its first test run, on a finished Billion short, caught a factual error the script implied (a 60-day effective date presented as two years), a silent voice-provider fallback, and a retired visual style, all with timestamps.
