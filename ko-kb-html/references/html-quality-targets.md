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

## Reference-Level Bar

- First viewport makes the document identity, scope, status, and next decision obvious.
- Visual blocks carry implementation or review value; never use diagrams as decoration.
- Each table or diagram names owners, risks, surfaces, contracts, or decisions when applicable.
- A mobile reader can identify scope, sequence, risk, and next decisions within 30 seconds.
- The artifact is handoff-ready: product, design, engineering, or reviewers can act without rereading the chat.
