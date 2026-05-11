# HTML Quality Targets

Use the matching target before creating the HTML artifact.

| Document | Required HTML structure |
|---|---|
| Plan | First-viewport metric/context strip, numbered milestones, dependency/data-flow diagram, low-fidelity mockup when UI exists, key code/files, risks with mitigations, open questions with owners |
| Architecture | System boundaries, component ownership, request/data flows, API contracts, storage model, trade-off matrix, failure modes, top risky assumptions |
| Review | Findings by severity, annotated diff or file map, risk hotspots, test gaps, next actions |
| PRD | Target user, problem, goals/non-goals, prioritized requirements, user journeys, acceptance criteria, success metrics, rollout, risks |
| Prototype | Screen map, core task flow, wireframes, clickable or anchored flow, interaction rules, loading/empty/error states, responsive behavior, copy notes |
| Research | TL;DR, source list, collapsible findings, comparison table, glossary, FAQ, confidence labels |
| Report | Executive summary, metric cards, timeline, chart/trend, status table, owner/action list |
| Postmortem | Incident summary, minute-by-minute timeline, impact panel, contributing factors, corrective actions |
| Module map | Entry points, boxes/arrows map, hot path, file responsibilities, gotchas |
| Comparison | Side-by-side options, scorecard, trade-offs, recommendation, reversibility |
| Deck | One `<section>` per slide, keyboard navigation, progress indicator |

## Dependency and Generation Target

Apply this target whenever the HTML is generated from Markdown or a doc folder.

- Generated HTML is self-contained and offline by default.
- New runtime dependencies are avoided; build-time dependencies are reused from the project when possible.
- A folder conversion produces predictable sibling `.html` files and an index only when the index helps navigation.
- Generated CSS/JS is wrapped in stable sentinel comments and replaced cleanly on rerun.
- Source Markdown remains the authority; generated HTML can be rebuilt without manual patching.
- The generator is idempotent: rerunning it with unchanged inputs does not accumulate whitespace, duplicate assets, or altered SVG output.
- Defects in generated output are fixed in the generator or injected shared assets, then regenerated. Hand-patching generated HTML is only acceptable as temporary diagnosis.
- Verification includes at least one browser screenshot or DOM check when browser tools are available.

## Interactive Diagram Target

Use this target whenever the companion contains Mermaid, SVG diagrams, or generated architecture flows.

- Diagram content is visible by default, not left as a raw code block.
- Source remains available in a nearby collapsed `<details>` block.
- The diagram surface is explicitly light with enough contrast for nodes, connectors, labels, and edge text.
- Zoom preserves SVG vector sharpness. If a diagram starts fit-compressed, zoom updates the inline SVG's rendered CSS size from its natural width; pan uses CSS transform offsets on the inner layer.
- The diagram viewport clips overflow and does not show browser scrollbars during zoom.
- Floating controls stay outside the transformed diagram layer so they remain fixed, clickable, and reachable while the diagram moves.
- Fullscreen/dialog mode keeps the diagram on a light board, hides or fully masks page content behind it, restores the original DOM on close, and keeps controls usable.
- Controls use native browser APIs and inline SVG/icons; no runtime framework or CDN is required.
- Browser verification covers normal view, zoomed view, wheel zoom, drag/pan, fullscreen/dialog, close, responsive layout, visual sharpness, and horizontal overflow.
- A generation script, if present, is idempotent and safe to rerun.
- For reference implementations built with frameworks, match the user-visible behavior while keeping the companion framework-free.

## Reference-Level Bar

- First viewport makes the document identity, scope, status, and next decision obvious.
- Visual blocks carry implementation or review value; never use diagrams as decoration.
- Each table or diagram names owners, risks, surfaces, contracts, or decisions when applicable.
- A mobile reader can identify scope, sequence, risk, and next decisions within 30 seconds.
- The artifact is handoff-ready: product, design, engineering, or reviewers can act without rereading the chat.
