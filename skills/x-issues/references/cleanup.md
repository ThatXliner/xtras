# Cleaning up existing issues

Use this when the user asks to triage, simplify, split or dedupe the issues already in a repo.

1. **Duplicates.** Merge each duplicate into the older issue: comment on the older one with a link to the newer one and anything new it added, then close the newer one as a duplicate (`gh issue close <n> --reason "not planned" --comment "Duplicate of #<older>"`).
2. **Issues covering several ideas.** Split them using section 2 of `SKILL.md`. Keep the original as the tracker and turn its body into a checklist of the new issues.
3. **Unlabeled issues.** Label them using section 4 of `SKILL.md`. That includes asking before creating any new label.
4. **Dense bodies.** Rewrite them using section 3 of `SKILL.md`: a short story of the problem, what we want, and the user's words. Keep every decision already recorded in the issue or its comments.

Before closing, merging or rewriting anything, show the user the full list of planned changes and wait for their OK. Closing someone's issue or rewriting it is hard to undo.
