---
name: streaming-ux-acceptance
description: Accept streaming chat and Markdown UX with an evidence ladder across transport cadence, authoritative state, presentation pacing, terminal/error bypass, and browser DOM timing. Use when users report choppy or bursty streaming, or when code changes stream buffering, flush intervals, rendering cadence, or first-visible-chunk latency.
---

# Streaming UX Acceptance

Use an **evidence ladder**: prove each layer before trusting the next. A correct final string proves integrity; a visible DOM timeline proves smoothness. Require both.

## 1. State the acceptance contract

Locate existing product thresholds before inventing new ones. Define observable bounds for:

- first user-visible chunk latency;
- maximum visible silence during active generation;
- number and spacing of visible updates when one large transport burst arrives;
- deadline for catching up to authoritative text;
- immediate terminal, cancellation, and error visibility;
- sequence correctness and final-text equality.

Treat thresholds as product-specific contracts. When the repository has none, label proposed values as provisional and justify them from the current baseline and display refresh rate.

Completion criterion: every claim uses a measurable clock, count, or equality condition.

## 2. Trace the production cadence

Follow one user-visible chunk end to end:

```text
producer → upstream buffer/timer → transport publication → client adapter
→ frame buffer/store → Markdown renderer → visible DOM
```

Search broadly once for timers, byte/character thresholds, flush functions, sequence fields, terminal paths, and animation-frame batching. Then narrow to the owning symbols. Record which layer can create each silent interval.

Test named predictions. Examples:

- “Short chunks wait for a one-second upstream timer.”
- “The client drains an entire publication in one render frame.”
- “Continuous 16 ms input is smooth, so Markdown parsing is not the first bottleneck.”

Completion criterion: the root-cause account explains both the pauses and the jumps without an untested gap.

## 3. Build the red evidence ladder

Add the smallest failing test at each relevant boundary. Make the timing test fail on the old behavior before changing production code.

1. **Cadence contract test** — use fake timers at the component that owns buffering. Assert that the first short chunk is published within the agreed budget.
2. **Pacing unit test** — for client-side pacing, verify large append progress across frames, bounded catch-up, immediate small appends, terminal bypass, non-append replacement, and UTF-16 surrogate safety.
3. **Renderer regression** — preserve Markdown correctness, settled-block identity, and accessibility behavior.
4. **Browser timing test** — install a `requestAnimationFrame` observer before injecting a deterministic large burst. Record timestamps and visible text lengths, then assert:
   - multiple distinct intermediate lengths;
   - bounded maximum gap between visible changes;
   - exact final content by the catch-up deadline.
5. **Protocol regression** — retain out-of-order handling, duplicate behavior, error partial-content preservation, and final sequence equality.

Measure DOM changes in addition to event arrival and final text. Only a visible timeline can detect one-frame dumping.

Completion criterion: the old behavior is demonstrably red at the owning boundary and in the browser when the defect is visual.

## 4. Change the narrowest owning layers

Fix the layer that creates the silence. If transport batching is excessive, correct its contract first. Add presentation pacing only for bursts that have already arrived.

Keep these authorities separate:

- protocol and store own received text and sequence state;
- presentation owns temporary reveal progress;
- terminal/error state bypasses presentation delay;
- presentation reveals only text already received.

Prefer local presentation state so animation-frame updates do not widen global-store subscriptions. Use an adaptive frame budget with a finite catch-up bound. Preserve Unicode boundaries when slicing text.

Completion criterion: every changed line maps to a failed acceptance condition, and terminal/error behavior remains immediate.

## 5. Climb the green evidence ladder

Run checks in increasing scope so failures stay attributable:

1. new pure/unit tests;
2. existing component and protocol regressions;
3. independent client typecheck or production build, not only the repository root typecheck;
4. deterministic browser timing test;
5. complete affected browser suite;
6. repository lint, typecheck, and full tests.

Inspect the repository's own testing instructions before selecting commands. Re-run the exact pre-commit gates immediately before a requested commit and let hooks run normally.

Completion criterion: every applicable rung is green, or its unverified status is explicitly classified below.

## 6. Classify failures by evidence

Use three buckets:

- **Product failure** — an assertion, typecheck, build, or browser contract fails because of repository code.
- **Harness failure** — the test was launched with the wrong setup, port, fixture, or stub configuration. Correct the invocation and rerun.
- **Infrastructure failure** — an external registry, network, Docker daemon, browser installation, or cluster bootstrap fails before the product assertion runs.

Treat expected error logs from negative tests as evidence only when the runner exits successfully. Report infrastructure failures as unverified coverage alongside the directly affected coverage that passed.

Completion criterion: the final status names the failing boundary and distinguishes runner exit, logged errors, and assertion outcomes.

## 7. Report the acceptance result

Lead with the outcome and include:

```markdown
## Outcome
[accepted / rejected / partially verified]

## Timing evidence
- Before: [observable baseline]
- After: [first chunk, frame count/gap, catch-up]

## Integrity evidence
- Sequence/final text: [result]
- Terminal/error bypass: [result]
- Markdown/Unicode/accessibility: [result]

## Verification
- [command or suite]: [result]

## Unverified
- [boundary and exact blocker, or “none”]
```

Report a precise frame count only when it was recorded. Otherwise prefer contract language such as “at least four visible updates within 300 ms” over an inferred average.

Completion criterion: another engineer can reproduce the result and distinguish proven behavior from inference.
