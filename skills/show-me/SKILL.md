---
name: show-me
description: After changing anything a user sees (components, styles, layouts, screens, copy, in-app text), screenshot the changed UI in the real running app and show it in the chat before saying the work is done, without being asked. Use after any UI edit, and when the user says "show me", "show me ss", "screenshot it" or "what does it look like".
---

# Show me

When you change UI, the user wants to see it before they hear it's done. Screenshots are part of finishing a UI change, so take them without being asked. A description of how it looks doesn't count.

**The test:** could the user approve or reject the change from your screenshots alone, without opening the app themselves? If not, take more shots or better ones.

## When

- **Any change to what a user sees:** components, styles, layouts, screens, icons, copy, release notes shown in the app, empty and error states. *Why:* the user can't judge UI from a diff.
- **Not for** changes with no visible effect (refactors that render the same, backend, tests, build config). Say in one line that there's nothing to show, so it's clear you skipped on purpose.
- **"Show me" means preview.** Don't commit, push, open a PR or deploy as part of showing. *Why:* the user is still deciding whether to keep the change.

## 1. Run the real app, the way users run it

Screenshot the target the change ships to, running your local code:

| App | Screenshot |
|---|---|
| Web | the local dev server in a browser |
| Expo / React Native | the iOS simulator (or Android emulator), not the website and not Expo web |
| Tauri / Electron | the desktop app's window, not the frontend in a browser tab |
| Native iOS / macOS | the simulator, or the app's window |

If the harness has its own browser, device or preview tools, use those and follow its rules for them. Only without them, fall back to Playwright for web (`npx playwright screenshot --viewport-size=1280,800 <url> out.png`), `xcrun simctl io booted screenshot out.png` for the iOS simulator, and `screencapture -l <windowid> out.png` for a macOS window. If the project has a run skill or documented dev command, use it.

*Why:* a production site, a mockup or a different platform shows code you didn't change. "Use the iPhone sim" is a correction the user has had to make.

## 2. Show the exact thing that changed

- Navigate to the screen and the state where the change appears: open the menu, fill the form, trigger the error, scroll to the section. A screenshot of the home page proves nothing about a settings dialog.
- If the change affects several places (each screen showing the new header, both light and dark themes, mobile and desktop widths it was meant for), take one shot of each. Skip combinations the change can't reach, such as a desktop width for a phone-only screen.
- **Before and after** when you change existing UI. Capture "before" before you edit. If you already edited, run the base commit from a separate worktree and reach the same state. If neither works, say there's no before. Put the two side by side or label them. *Why:* without the "before", the user has to remember what it looked like.
- Crop or zoom when the change is small. A two-pixel border fix needs a close-up, not a full page.

## 3. Look at it before you send it

Open every screenshot yourself and check that it shows the change. If it shows a blank page, a loading spinner, an error overlay, a login wall or the wrong screen, fix the setup and retake it. If it shows a bug in your change, fix the bug first. *Why:* sending a broken screenshot as proof costs the user a round trip.

## 4. Show it in the chat

Put the images in your reply, in whatever form the client renders: Markdown image syntax with an absolute path, an attachment or a rendered preview. Give one line per image saying what it shows ("Settings → Margins, after: the slider now has a label"). Keep files in a scratch or temp directory, not the repo. Commit screenshots only if the user asks.

## When you can't

If you can't get a screenshot (no simulator, the app won't build, a screen needs credentials you don't have), say so plainly, say why, and say what would unblock it. Don't substitute a mockup, an older screenshot, the live site or a different platform without labelling it as exactly that. *Why:* an unlabelled substitute looks like proof of something you never checked.
