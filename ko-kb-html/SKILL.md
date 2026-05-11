---
name: ko-kb-html
description: "Use when producing or revising substantial docs, or when the user asks for a browsable, visual, interactive, or easier-to-scan plan, architecture doc, PRD, prototype spec, review, research note, report, postmortem, module map, comparison, or code writeup."
---

# HTML Document Companion

## Overview

Create a self-contained HTML companion for substantial docs when layout, navigation, diagrams, tables, or interaction make the work easier to read and act on. Keep Markdown as source when requested; HTML is the reader-facing companion unless the user asks to convert.

## When to Use

Use for long-form docs with sections, options, risks, milestones, flows, diagrams, tables, reviewer findings, or handoff value. Do not use for short answers, patch summaries, commit messages, terminal output, or Markdown-only requests.

## Quick Reference

Before creating HTML, read `references/html-quality-targets.md` and apply the relevant document-type standard.

## Implementation

1. Decide whether HTML helps. If the document is short or linear, skip it.
2. Infer document type and audience; preserve/create Markdown first when requested.
3. Create one standalone `.html` file with inline CSS and only clarifying inline JavaScript.
4. Use semantic HTML: `header`, `main`, `section`, `nav`, `aside`, `table`, `details`, `summary`, `figure`, `svg`, `code`.
5. Add TOC navigation for 4+ sections; use labeled inline SVG for flows, maps, and timelines.
6. Add print styles and responsive CSS. Mobile must be single-column with no horizontal overflow.
7. Keep offline by default: no external fonts, scripts, images, CDNs, tracking, or hidden network calls without explicit approval.
8. Verify generated HTML when tools allow it.

Default paths: `[source].md` -> `[source].html`; chat-only -> `docs/html/YYYY-MM-DD-[short-title].html`.

## Quality Bar

- First viewport says what the document is and what decision or action it supports.
- Layout matches the document type; avoid one generic article template.
- Main argument, risks, owners, and next actions are scannable in 30 seconds.
- Details remain available without overwhelming the default view.
- Visual polish must not make weak evidence look certain.
- Handoff-ready: the next reader can review or start work without rereading the chat.

## Common Mistakes

- **Generic article wrapper:** Rework from the reference target.
- **Pretty but less truthful:** Keep decision-relevant text beside every visual.
- **External dependencies by habit:** Use system fonts, inline CSS/SVG, and progressive enhancement.
- **HTML for tiny responses:** Skip ceremony without comprehension value.
- **Uninspected output:** Check anchors, overflow, contrast, missing sections, and mobile readability.

## Output Format

When creating files, end with:

```markdown
Created:
- `[markdown-file]` if a Markdown source was created or updated
- `[html-file]` as the self-contained HTML companion

Verified:
- [checks performed]
```

When files cannot be written, provide standalone HTML in a fenced `html` block.

## Halt Conditions

- HALT if the user explicitly says not to create HTML.
- HALT if the document contains secrets or private data and the requested output path would expose it publicly.
- HALT if source material is too incomplete to produce a faithful document; ask one concise clarification question.
- HALT before adding external network dependencies unless the user explicitly approves them.
