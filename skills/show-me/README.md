# show-me

[![Show-me Tokens](https://img.shields.io/endpoint?url=https%3A%2F%2Fgist.githubusercontent.com%2FThatXliner%2Fcffd977aeb3539c0571ee27356d3a0b3%2Fraw%2Fshow-me-tokens.json)](https://github.com/ThatXliner/xtras/blob/main/skills/show-me/SKILL.md)

Part of the [**xtras**](../../README.md) plugin.

Shows you UI changes without being asked. After Claude edits UI code, it opens the changed screen in the real app (the dev server, the desktop app or the iOS simulator) and puts screenshots in the chat, with before and after for changes, before it calls the work done. It only previews and never pushes. If it can't get a screenshot, it tells you why.

## Why

Left alone, Claude finishes a UI change and describes it: "the padding is now 16px and the text is dimmer." You can't judge a UI from that, so you ask "show me ss", every time. Mining my Claude Code and Codex history found that ask more than 20 times across eight projects, along with the same few corrections:

- "no, use the iPhone sim": screenshots came from the live website instead of the app being changed.
- "release notes also mean the in-app ones… that's why I asked for a screenshot": the screenshot showed a nearby screen, not the one that changed.
- Screenshots that were blank, stuck loading or hidden behind an error overlay, sent as proof anyway.

## How it works

**One test.** Could you approve or reject the change from the screenshots alone, without opening the app yourself? If not, Claude takes more shots or better ones.

**The real target.** Web changes are captured from the local dev server, Expo changes in the simulator, and Tauri or Electron changes from the app window. Claude uses the harness's own browser or device tools when there are any, and otherwise falls back to Playwright, `simctl` and `screencapture`.

**The exact surface.** Claude goes to the screen and state where the change shows up (the open menu, the error state, the sheet after an update), with before and after shots and a close-up for small fixes.

**It checks before sending.** Claude opens each screenshot and retakes any that show a blank page, a spinner, a login wall or the wrong screen.

**Preview only.** Showing a change never commits, pushes or opens a PR. Screenshots stay out of the repo unless you ask.

**Honest failures.** No simulator, a broken build or a screen behind credentials gets a plain "couldn't, because…" and what would unblock it, never an unlabelled mockup or an old screenshot.

## Compared with

- **pstack's `show-me-your-work`** keeps a decision log (what, why, evidence, result) for long, unattended runs that someone reviews later. `show-me` is the quick "let me see it" check after a single UI change. They work together: inside a logged run, `show-me`'s screenshots can be the evidence for a log row.
- **pstack's `principle-prove-it-works`** is the general rule of checking the real artifact. `show-me` is that rule for UI, with the how. Both pstack skills set `disable-model-invocation`, so they never fire on their own. `show-me` is meant to.
- **Claude Code's built-in `run` skill** launches an app to see a change working. `show-me` uses it, or the project's dev command, to get to the screen, and adds what to capture and how to show it.

## Usage

The skill activates after Claude changes anything a user sees, and when you say "show me", "show me ss" or "screenshot it". You can also invoke it directly with `/show-me`.
