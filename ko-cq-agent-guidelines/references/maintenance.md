# Sources and Maintenance

Read this file only when editing or evaluating the skill. Runtime decisions and safety boundaries stay in SKILL.md.

## Sources

- The user-supplied **Karpathy Guidelines**, informed by [Karpathy's observations](https://x.com/karpathy/status/2015883857489522876): thinking before coding, simplicity, surgical changes, and goal-driven verification. The post is background, not the exact supplied skill text.
- [i-have-adhd/SKILL.md](https://github.com/ayghri/i-have-adhd/blob/main/skills/i-have-adhd/SKILL.md): persistence, ten output rules, exceptions, and the pre-send check. This main-branch link is mutable; record the revision when refreshing the source.

## Deliberate Adaptations

The merged skill is discoverable for coding tasks rather than manual-only. Persistence respects current user and host instructions; clarification pauses only dependent work; existing authorization avoids repeated confirmation; estimates require evidence; presentation limits never restrict analysis or completeness. Repository inspection, shared-caller tracing, and reuse preferences are coding-specific additions. The skill does not assume a diagnosis about the reader.

## Coverage Checklist

Keep each behavior and its decision boundary, not necessarily its original wording:

| Source requirement | Runtime location |
| --- | --- |
| Consequential assumptions, competing interpretations, tradeoffs, simpler alternatives, pushback | Think before coding; consequential-ambiguity halt |
| Minimum requested solution, no speculative abstraction/configuration, credible failure handling, simplification check | Simplicity first |
| Local style, no adjacent cleanup, remove only newly orphaned code, preserve existing dead code | Surgical changes |
| Every edit traces to the request; reviews/explanations are read-only unless authorized | Surgical changes completion criterion |
| Observable goals; plan steps paired with checks; invalid/valid input, reproduction, refactor evidence; loop until verified | Execution; verification loop |
| Persistence, exit, handoff, user/host precedence | Scope and Persistence |
| Action first; minimal numbered bounded steps; one small reader action when necessary | Action and state |
| Every-turn state during ongoing work; task tool with one active item; concrete progress | Action and state |
| Suppress tangents, answer emerging questions, defer nonblocking reader questions | Action and state |
| Concrete time estimates without invented certainty; factual errors with cause/next action | Presentation and exceptions |
| Ranked/grouped small visible lists without lost analysis or completeness | Presentation and exceptions |
| Full explanations, requested formats, ranked options with tradeoffs, host tool announcements | Presentation and exceptions |
| No optional preambles/recaps/closers; literal actions; retain real uncertainty; first/last-line check | Before sending |
| Specific destructive-action authorization, ambiguity, three-turn debug stop, access/instruction blockers | Halt Conditions |

## Validation

Read [evals/evals.json](../evals/evals.json), exercise affected scenarios, and compare changes with the actual source rules listed above as well as this coverage checklist. If an exact source version is unavailable, record that gap instead of claiming a complete source comparison. Record actual outputs; distinguish manual walkthroughs, single-shot simulations, and independent multi-turn runs. Structural checks alone do not prove behavioral fidelity.

For compression, measure the same runtime file before/after with the same named tokenizer. Report separately the runtime reduction and reference-file cost; the latter is loaded only for maintenance. Compare observable outcomes as well as counts, especially read-only boundaries, verification gaps, complete lists, persistence/exit, and the three-turn stop.
