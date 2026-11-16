---
name: ko-dx-rca
description: "Use when the user reports a bug, asks why behavior happens, requests root cause or 5-why analysis, or wants to verify whether a bug fix addresses the true cause."
---

# Root Cause Analysis (RCA)

**Goal:** Systematically analyze bugs to find true root causes, not just symptoms. Produce a structured report with tagged-evidence cause chains, ruled-out alternatives, pattern generalization, and actionable fix suggestions classified by blast radius and layer.

**Why this matters:** Most bug fixes patch symptoms. A good RCA distinguishes "this specific thing broke" from "a whole category of things can break the same way." The difference determines whether you fix one bug or prevent dozens. A report that states guesses as facts is worse than no report, because the reader stops looking.

## Inputs

- **symptom** — What the user observes: error message, wrong behavior, screenshot description, bug report, or a diff they've already applied and want to validate
- **context** (optional) — Relevant file paths, components, recent changes, or reproduction steps
- **scope** (optional) — Which layers to investigate (frontend / backend / infra / all). Default: infer from symptom

## Evidence Levels

Tag every claim in a cause chain with exactly one level. Use the strongest level you actually reached.

| Tag | Meaning | Examples |
|-----|---------|----------|
| `[observed]` | Directly seen in this incident's runtime data | API response, log line, metric value, `kubectl` output, trace, reproduction |
| `[code]` | Read in source or config; runtime behavior inferred from it | `file:line`, manifest, feature flag default |
| `[doc]` | Stated by documentation, ADR, or comment; not checked against the running system | runbook, ADR, README |
| `[inferred]` | Reasoned from the above, no direct evidence | "probably caused by the other pods' traffic" |

Rules:

- A `[doc]` or `[inferred]` link may appear in the chain, but the conclusion must say it is unverified. Never write it as fact.
- Confidence of the whole chain is capped by its weakest link.
- Output produced by the system under analysis about itself (its own diagnosis, health status, or classification) is a claim to verify, not independent evidence. If you rely on it in one place and call it wrong in another, say why.

## Scale to the Problem

Match depth to the problem. A single-cause bug with a stack trace and a failing reproduction needs a short report: one chain, one-line alternatives, and a sibling search limited to the layers that apply. Use the full structure when any of these holds: several symptoms, runtime or deployment evidence is involved, the cause is not reproduced, or the fix would cross a module boundary. Never skip evidence tags, the conclusion, or the claim-strength check, at any size.

## Execution

### Phase 1: Symptom Mapping

Understand what's actually happening before theorizing about causes.

1. **Restate the symptom** in precise technical terms. Strip out user frustration and vague language. If the symptom description is ambiguous, ask one round of clarifying questions before proceeding.

2. **Locate the symptom.** Use the sources the symptom lives in, not only source code:
   - Code: the UI component, API endpoint, or service where it manifests; the data flow path from user action to the observed bug; related tests (or their absence)
   - Runtime: logs, metrics, traces, API responses, and queries that show the symptom in this incident
   - Deployment: manifests, config, feature flags, and versions of the affected components

3. **Map the symptom boundary.** Determine:
   - Is this one symptom or multiple? Users often report compound bugs as a single issue
   - If multiple symptoms exist, check whether they share a root cause or are independent
   - Document each distinct symptom separately going forward

4. **Tag each symptom's layer.** Decide whether it is a fact about the observed system (data missing, request failed) or a defect in the observer or reporter (wrong diagnosis, wrong label, wrong dashboard). These have different causes and different fix owners. Never merge them into one chain.

### Phase 2: Causal Chain Analysis (5-Why)

For each distinct symptom, build a cause chain. The chain ends at a design decision, a missing invariant, or a process or coverage gap, not at "the code does X."

**Chain rules:**

1. Every step answers "why?" about the previous step's answer. A step that explains a contrast ("why does the other side work?") is a side note. Put it outside the chain.
2. Each step states the question, the answer, the evidence tag, and the reference (`file:line`, command, metric name, or doc section).
3. Verify each answer in source or runtime data. Do not guess.
4. If a step has several necessary conditions (A and B and C must all hold), do not pick one. List all conditions as branches of that step, then continue the chain under each branch that is still unexplained. Mark each condition as changeable or not (for example, a security setting may be fixed by policy). Fix targets come from the changeable ones.

**How to tell you've reached the root cause.** All of these must hold:

- **Counterfactual:** if this cause were removed, the symptom would not occur, and no parallel condition at the same level would still produce it
- **Not a restatement:** it adds information beyond the earlier steps. If it only rephrases them, keep asking
- **Actionable owner:** a team can change it (a design rule, an invariant, a configuration or coverage policy, a process), not just "line N is wrong"
- **Beyond a missing category:** "the code lacks a case for X" is an intermediate cause. Ask why the case was missing: no one specified it, an assumption went unchecked, or there was no coverage check

The root cause may be outside code: deployment policy, onboarding or coverage rules, or missing alerts. Stop when going deeper would leave the project's control.

**Escape question.** After the root cause, ask once: why was this not caught earlier? Name the missing test, check, alert, or review step. Report it separately as the escape cause. If history is unavailable, write "unknown: not investigated" instead of guessing.

Don't force exactly 5 levels.

### Phase 3: Pattern Generalization

Convert the specific bug into a reusable failure pattern before proposing fixes. The goal is to solve a class of scenarios, not only the reported scene.

For each root cause:

1. **Name the failure pattern.** Describe the bug shape in general terms, independent of the current file or feature.
   - Bad: "This modal passes the wrong ID."
   - Good: "UI event payloads carry display IDs where persistence IDs are required."

2. **Define the invariant that should have prevented it.** State the rule that must hold across the system.
   - Example: "Every cross-layer event must use canonical entity IDs, not labels, indexes, or view-local aliases."

3. **Search for sibling scenarios.** Run the search, do not just assert that siblings exist. Cover the layers that apply to this bug:
   - Code: same helper, hook, component family, API client, event type, schema, adapter, or persistence path; similar validation gaps, fallback behavior, duplicated conditionals, or copied logic; tests that cover only the reported case
   - Runtime: other instances showing the same signature in logs, metrics, traces, or data (for example, other callers, pods, tenants, or endpoints with the same symptom)
   - Deployment: other components with the same configuration, version, or missing coverage

   If a search could not be run, write "not run: <reason>" in the report.

4. **Separate confirmed siblings from possible siblings.**
   - Confirmed: evidence shows the same failure pattern already exists elsewhere. Give the count or list
   - Possible: shape is similar, but more evidence or runtime data is needed
   - Not applicable: the path has a different invariant or an explicit guard

5. **Decide the prevention level.** Prefer a class-level fix when the pattern appears in more than one place, crosses a boundary, or reflects a missing invariant. Accept a point fix only when the pattern is genuinely unique and the search supports that conclusion.

### Phase 4: Fix Classification

For each root cause, classify the fix on two axes.

**Axis 1: blast radius**

- **Point fix** — Addresses this specific bug instance only. Typical: change a value, add a null check, fix a typo. Appropriate when the bug is truly unique.
- **Class fix** — Addresses an entire category of potential bugs. Typical: add a type constraint, introduce a mapping layer, create a shared abstraction, change an event protocol. Appropriate when the pattern appears in multiple places or the root cause is a missing invariant.
- **Hybrid** — Point fix now + class fix recommendation for later. Appropriate when the class fix is large or risky and needs its own PR, but the immediate bug needs to ship.

**Axis 2: layer**

- **Eliminate** — removes the root cause, so the symptom cannot occur
- **Detect** — makes the failure visible or the report accurate (diagnosis, alert, validation) without removing the cause
- **Mitigate** — reduces impact or likelihood (workaround, fallback, retry)
- **Configure** — changes deployment or policy settings without code changes

A Detect or Mitigate fix must not be presented as resolving the root cause. State which symptoms stay unresolved.

For each fix, provide:
- Concrete change suggestion (file path or resource, what to change, why)
- Blast radius and layer labels
- Which symptom(s) it resolves
- Which sibling scenarios or failure pattern it prevents
- What it does NOT fix (remaining risks)
- Any trade-off the user must decide (for example, a security downgrade)

### Phase 5: Evidence Chain Verification

Before presenting the report, verify the analysis is sound:

1. **Trace closure.** For each root cause, walk the chain forward: root cause -> intermediate effects -> observed symptom. List the evidence tag of every link. Any `[doc]` or `[inferred]` link must be named in the conclusion as unverified. If you can cheaply upgrade it (run a command, query a metric, read a config), do that first.

2. **Alternatives check.** List at least two alternative explanations for each symptom and the evidence that rules each out. Each alternative must predict something different from your theory (a different log line, metric, or state), and you must say what you checked. An alternative that nobody would propose does not count. If an alternative cannot be ruled out, keep it in the report as open. Draw alternatives from the symptom's usual failure modes (dropped data, sampling, restart, version skew, misconfiguration, race), not only from your preferred theory.

3. **Coverage check.** Are there other code paths or inputs that bypass your fix? Other callers, event sources, replay/history paths, race conditions? List any uncovered paths as remaining risks.

4. **Generalization check.** Does the recommendation enforce the invariant for the whole failure pattern, or only patch the reported scenario? If only the reported scenario is fixed, label it as a point fix and explain what broader work remains.

5. **Claim-strength check.** Re-read the conclusion. Every sentence must be no stronger than the weakest evidence behind it. Replace "is X" with "is most likely X because ...; not verified: ..." where needed. Do not call a mechanism the "real cause" while the table says it is only partly verified.

## Output Format

Present the report in this structure. Keep every causal claim tied to an evidence tag and a reference.

```markdown
# RCA Report: [Brief title]

## Conclusion
[2-4 sentences: the root cause(s), what is verified, what is not.]
**Confidence:** [High / Medium / Low] — [weakest link that sets this level]
<!-- High: every link on the path is [observed] or [code], and all alternatives are ruled out.
     Medium: the path is [observed] or [code], but an alternative is open or a [doc] link sits off the path.
     Low: any link on the path to the root cause is [doc] or [inferred]. -->

**Unverified:** [list of [doc] / [inferred] links and open alternatives, or "none"]

## Symptoms
| # | Symptom | Layer (observed system / observer) | Location | Severity |
|---|---------|------------------------------------|----------|----------|
| 1 | ...     | ...                                | file:line or command | ... |

## Root Cause Analysis

### Root Cause 1: [Title]
**Affects symptoms:** #1, #2

#### Cause Chain
1. **Why [symptom]?** Because [answer]. `[tag]` `reference`
2. **Why [answer from 1]?** Because [answer]. `[tag]` `reference`
   - Condition A: ... `[tag]` `reference`
   - Condition B: ... `[tag]` `reference`
3. ...
N. **Root cause:** [design decision / missing invariant / coverage or process gap] `[tag]` `reference`

**Counterfactual:** [what would change if this were removed]
**Escape cause:** [why no test, check, or alert caught it]

#### Fix: [Point / Class / Hybrid] + [Eliminate / Detect / Mitigate / Configure]
- **What to change:** [concrete suggestion]
- **Files / resources:** `path/to/file.ts:42`
- **Why this works:** [explanation]
- **Pattern prevented:** [general failure pattern or "none; point fix only"]
- **Siblings checked:** [confirmed (count/list) / possible / not applicable / not run: reason]
- **What this does NOT fix:** [remaining gaps]
- **Decision needed:** [trade-offs for the user, or "none"]

## Alternatives Considered
| Symptom | Alternative | Ruled out by | Status |
|---------|-------------|--------------|--------|
| #1 | ... | evidence | Ruled out / Open |

## Evidence Chain
| Root Cause | Chain | Weakest link (tag) | Verified? | Gaps |
|-----------|-------|--------------------|-----------|------|
| RC1 | cause -> effect -> symptom | ... | Yes/Partial | ... |

## Remaining Risks
- [Risk and where to look]

## Recommendations
1. [Immediate: fixes to ship now]
2. [Follow-up: class fixes for the backlog]
3. [Monitoring: what to watch for recurrence]
```

## Important Principles

- **Verify, don't guess.** Every claim in the cause chain must reference actual source, config, or runtime data. If you can't find it, say so rather than speculating.

- **Separate symptoms from causes.** "The button doesn't work" is a symptom. "The click handler dispatches the wrong action type" is an intermediate cause. "The event mapping layer treats all TOOL_CALL_END events as completion regardless of business state" is a root cause.

- **Don't stop at the first plausible explanation.** The first "why" answer that sounds reasonable is usually a symptom, not a cause. Keep going.

- **Don't pad the chain.** A step that restates the previous one, or answers a different question, adds length but no depth.

- **Generalize before fixing.** Always ask "what class of scenarios could fail this same way?" and run the sibling search before deciding whether the fix should be local or systemic.

- **Compound bugs are common.** When a user reports one bug, there are often 2-3 independent root causes interacting, or several conditions that must all hold. Don't force them into a single narrative.

- **Classify honestly.** If a fix only patches one instance, or only makes the report accurate without removing the cause, say so. The user needs accurate information to decide their investment.

- **State uncertainty where it matters.** Put unverified links in the conclusion, not only in a table at the end.

## Halt Conditions

- HALT if the symptom cannot be reproduced from the description and no code, runtime data, or config references are findable — ask the user for more context
- HALT if the relevant code or system is not accessible (for example, the bug is in an external dependency) — state this and suggest where to look instead
- HALT before running any command that changes state in a running system. RCA commands are read-only; ask the user first for anything else
