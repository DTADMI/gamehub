---
name: gamehub-docs
description: Maintain GameHub canonical docs, indexes, architecture documentation, action-plan references, and structured documentation formatting. Use when a task changes GameHub technical docs, adds new runbooks, updates indexes, or needs doc cleanup.
---

# GameHub Docs

Use this skill when documentation is part of the deliverable.

## Workflow

1. Identify the source-of-truth doc for the topic before editing supporting notes.
2. Update the canonical doc first, then repair indexes and cross-links.
3. Keep `docs/action-plan.md` current when source-of-truth work changes active priorities or shipped status.
4. Keep tables clean and leave exactly one empty line between a section title and the start of its table.
5. Use real emoji characters where the docs call for status icons.
6. Keep docs UTF-8 clean and avoid mojibake.
7. Prefer consolidation over parallel guidance files when two docs say the same thing.

## Output Standard

- Leave the doc tree easier to navigate than you found it.
- When you add a new canonical doc, add it to the relevant index.
- When you replace a doc, remove stale references instead of keeping both active.
