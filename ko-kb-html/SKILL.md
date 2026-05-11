---
name: ko-kb-html
description: "Use whenever producing, regenerating, or repairing substantial documentation HTML companions: architecture docs, PRDs, plans, reviews, reports, postmortems, module maps, comparisons, research notes, Markdown with Mermaid/tables/flows, or any request to make docs browsable, visual, interactive, easier to scan, or generate HTML. Also use when Mermaid diagrams are raw code, blurry, unreadable, missing zoom/pan/fullscreen, show scrollbars, leak page content behind fullscreen, or when generated docs need browser QA. Keep outputs self-contained, offline by default, reproducible from source, and dependency-light."
---

# HTML Document Companion

## Overview

Create a self-contained HTML companion for substantial docs when layout, navigation, diagrams, tables, or interaction make the work easier to read and act on. Keep Markdown as source when requested; HTML is the reader-facing companion unless the user asks to convert.

## When to Use

Use for long-form docs with sections, options, risks, milestones, flows, diagrams, tables, reviewer findings, or handoff value. Do not use for short answers, patch summaries, commit messages, terminal output, or Markdown-only requests.

## Quick Reference

Before creating HTML, read `references/html-quality-targets.md` and apply the relevant document-type standard.

When Mermaid rendering or diagram interaction is involved, also read `references/mermaid-interaction-pattern.md` before editing.

## Dependency Posture

Default to zero new dependencies.

- Use inline CSS, inline SVG, semantic HTML, and small native JavaScript before adding libraries.
- Do not add Vue, React, VitePress, icon packs, pan/zoom libraries, D3, charting libraries, `jsdom`, or CDN assets just to make a static companion interactive.
- If a generator is needed, reuse tools already present in the project. Existing browser automation such as Playwright is acceptable for verification or build-time rendering; do not add it solely for docs unless the user asks for browser QA.
- If a dependency is unavoidable, make it build-time only and justify why native HTML/CSS/JS is insufficient. Mermaid is the usual exception for Mermaid source rendering; prefer a project-installed `mermaid` package before adding anything.
- Keep generated HTML offline by default. Runtime HTML must not call external networks, CDNs, trackers, fonts, image hosts, or websocket endpoints unless the user explicitly approves.

## Implementation

1. Decide whether HTML helps. If the document is short or linear, skip it.
2. Infer document type and audience; preserve/create Markdown first when requested.
3. Create one standalone `.html` companion per source document with inline CSS and only clarifying inline JavaScript. For a folder or doc set, generate sibling companions and add an index page only when it improves navigation.
4. Use semantic HTML: `header`, `main`, `section`, `nav`, `aside`, `table`, `details`, `summary`, `figure`, `svg`, `code`.
5. Add TOC navigation for 4+ sections; use labeled inline SVG for flows, maps, and timelines.
6. Add print styles and responsive CSS. Mobile must be single-column with no horizontal overflow.
7. Keep offline by default: no external fonts, scripts, images, CDNs, tracking, or hidden network calls without explicit approval.
8. Verify generated HTML when tools allow it. For visual or interactive changes, verify in a real browser and inspect screenshots before calling the work done.

Default paths: `[source].md` -> `[source].html`; chat-only -> `docs/html/YYYY-MM-DD-[short-title].html`.

## Generators and Batch Docs

Use a generator when the user asks to convert many docs, when regeneration is likely, or when rendering diagrams would otherwise require manual edits.

- Keep generators small and project-local, for example `scripts/render-doc-html.ts` or `scripts/render-architecture-mermaid.ts`.
- Wrap injected CSS/JS with stable sentinel comments and strip old generated blocks before re-injecting them.
- Preserve hand-authored Markdown as source; generated HTML should be reproducible from source plus the generator.
- Make repeated runs safe. A second run with unchanged inputs should print that nothing changed or leave file hashes unchanged.
- Do not hand-patch generated HTML in ways the generator cannot reproduce. Update the generator, then regenerate.
- When fixing generated output, first locate the generator or build step. Patch generated HTML only as a temporary diagnosis aid; the final fix belongs in the generator and must be regenerated.

## Mermaid and Diagrams

When source docs contain Mermaid, preserve the Mermaid source and render a readable diagram in the HTML companion.

- Prefer official Mermaid rendering. Use the project-installed `mermaid` package when present; if it is missing, ask before adding it.
- Prefer build-time rendering that embeds the resulting SVG inline. Do not ship a Mermaid runtime script in every HTML page unless the user asks for live rendering.
- Avoid heavy Mermaid CLI stacks that pull in a browser bundle if the project already has browser automation or can render with the installed `mermaid` package.
- Keep the Mermaid source available in a collapsed `<details>` block near the diagram.
- Rendered diagrams must have a stable light diagram surface by default so lines, labels, and edge text remain readable even when the page or modal backdrop is dark.
- Interactive controls must use native JavaScript only: zoom, reset, fit, download, fullscreen/dialog, and pan/drag when useful.
- Keep zoomed diagrams sharp by preserving inline SVG as vector output. If the default view is fit-compressed, zoom by updating the SVG's rendered CSS size from its natural width, then use `transform: translate(...)` only for pan offsets; this avoids scaling a browser-rasterized compressed layer.
- Diagram viewports should use `overflow: hidden` for pan/zoom surfaces; zoom must not create document scrollbars, and panning changes the inner transform, not the container scroll position.
- Fullscreen should isolate the diagram from the document behind it. Hide or fully mask background content, keep the diagram board light, and ensure controls work inside the modal.
- Keep controls outside the transformed diagram layer so they stay fixed and clickable while the diagram is zoomed or panned.
- Treat the reference project pattern as behavior guidance only: floating toolbar, zoom label, pan surface, download, and fullscreen. Do not import its framework runtime just to replicate the UI.
- If generation scripts are added, they must be idempotent: a second run with unchanged inputs should report no changes.
- When copying ideas from a framework plugin such as VitePress Mermaid Renderer, copy the behavior pattern, not the framework runtime. Native HTML/CSS/JS should carry the interaction in generated companions.

### Mermaid Debugging Checklist

Use this sequence when the user reports diagram problems:

1. Reproduce in browser and capture or inspect the failing state.
2. Classify the failure: render missing, label/line contrast, blurry zoom, scrollbars, toolbar placement, fullscreen backdrop leak, wheel zoom missing, drag missing, or generated output not reproducible.
3. Fix the generator or shared injected assets, not individual generated pages.
4. Regenerate all affected HTML companions.
5. Verify normal page and fullscreen separately; many bugs only appear in one mode.
6. Re-run the generator to confirm idempotence.

## Quality Bar

- First viewport says what the document is and what decision or action it supports.
- Layout matches the document type; avoid one generic article template.
- Main argument, risks, owners, and next actions are scannable in 30 seconds.
- Details remain available without overwhelming the default view.
- Visual polish must not make weak evidence look certain.
- Handoff-ready: the next reader can review or start work without rereading the chat.

## Non-Negotiables

- **Architecture:** do not use a generic article layout; show boundaries, ownership, flows, contracts, storage, and failure modes.
- **Review:** do not bury findings in prose; lead with severity, file anchors, risk hotspots, and next actions.
- **Private data:** if the requested path is public, halt and redirect to a private destination or redaction first.

## Common Mistakes

- **Generic article wrapper:** Rework from the reference target.
- **Pretty but less truthful:** Keep decision-relevant text beside every visual.
- **External dependencies by habit:** Use system fonts, inline CSS/SVG, and progressive enhancement.
- **Runtime framework for static docs:** Do not add Vue/VitePress/React just to get toolbar behavior; copy the interaction pattern with native JS.
- **Mermaid as a code block only:** Render the diagram, preserve the source in `<details>`, and verify labels are visible.
- **Blurry zoom:** Do not transform-scale an SVG that was already compressed with `max-width: 100%`; store its natural width and resize the inline SVG so the browser redraws vector text and paths.
- **Zoom causing scrollbars:** Keep the resizing inside an `overflow: hidden` viewport and use transform only for pan offsets.
- **Fullscreen background leak:** Moving the figure into a modal is not enough; hide or fully mask page content behind the dialog and restore the figure to its original DOM position on close.
- **Toolbar drifting with diagram:** Keep toolbar as a sibling of the transformed diagram layer, not a child of the layer being translated.
- **Dark modal swallowing diagram lines:** Keep the modal backdrop separate from a light diagram board.
- **Hand-fixing generated pages:** Fix the generator and regenerate so future runs do not regress.
- **Non-idempotent regeneration:** Remove stale generated blocks before injecting new ones; repeated runs should not accumulate whitespace, CSS, or scripts.
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

For generated HTML with diagrams, include browser verification when available:

```markdown
Verified:
- Opened the generated page in a browser
- Checked desktop and mobile layout for horizontal overflow
- Checked Mermaid render, labels, zoom, pan/drag, fullscreen/dialog, reset/fit, and download when present
- Checked that normal-page zoom and fullscreen zoom remain sharp and do not introduce page scrollbars
- Captured or inspected screenshots for the changed pages
- Re-ran the generator to confirm idempotence when a generator exists
```

## Halt Conditions

- HALT if the user explicitly says not to create HTML.
- HALT if the document contains secrets or private data and the requested output path would expose it publicly.
- HALT if source material is too incomplete to produce a faithful document; ask one concise clarification question.
- HALT before adding external network dependencies unless the user explicitly approves them.
