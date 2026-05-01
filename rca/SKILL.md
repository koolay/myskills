---
name: rca
description: "Structured root cause analysis for bugs using 5-Why methodology, evidence chain verification, and fix classification. Use this skill whenever the user reports a bug, asks 'why does X happen', wants to understand the real cause of a defect, asks for 5-why analysis, says 'root cause analysis', or needs to determine whether a fix addresses one instance or a class of problems. Also use when the user has already fixed a bug and wants to verify the fix is targeting the true root cause."
---

# Root Cause Analysis (RCA)

**Goal:** Systematically analyze bugs to find true root causes, not just symptoms. Produce a structured report with 5-Why chains, evidence verification, and actionable fix suggestions classified by blast radius.

**Why this matters:** Most bug fixes patch symptoms. A good RCA distinguishes "this specific thing broke" from "a whole category of things can break the same way." The difference determines whether you fix one bug or prevent dozens.

## Inputs

- **symptom** — What the user observes: error message, wrong behavior, screenshot description, bug report, or a diff they've already applied and want to validate
- **context** (optional) — Relevant file paths, components, recent changes, or reproduction steps
- **scope** (optional) — Which layers to investigate (frontend / backend / infra / all). Default: infer from symptom

## Execution

### Phase 1: Symptom Mapping

Understand what's actually happening before theorizing about causes.

1. **Restate the symptom** in precise technical terms. Strip out user frustration and vague language. If the symptom description is ambiguous, ask one round of clarifying questions before proceeding.

2. **Locate the symptom in code.** Use Grep/Glob/Read to find:
   - The UI component, API endpoint, or service where the symptom manifests
   - The data flow path from user action to the observed bug
   - Related test files (existing tests that should have caught this, or the absence of tests)

3. **Map the symptom boundary.** Determine:
   - Is this one symptom or multiple? Users often report compound bugs as a single issue
   - If multiple symptoms exist, check whether they share a root cause or are independent problems on the same code path
   - Document each distinct symptom separately going forward

### Phase 2: Causal Chain Analysis (5-Why)

For each distinct symptom identified in Phase 1, run a 5-Why chain.

The 5-Why method works by repeatedly asking "why?" until you reach something that is a design decision, a missing abstraction, or a violated invariant — not just another layer of "the code does X."

**How to tell you've reached the root cause:**
- The answer is about a missing concept, wrong abstraction, or violated design principle — not just "line N has a bug"
- Fixing it at this level would prevent the entire class of similar bugs, not just this instance
- Going one more "why" deeper would leave the domain of the current codebase (e.g., "why did the framework work this way?")

For each why-step:
1. State the question
2. Read the relevant code to find the answer (don't guess — verify in source)
3. State the answer with file:line references
4. Assess: is this the root cause, or do we need to go deeper?

Stop when you hit a root cause. Don't force exactly 5 levels if the root cause is shallower or deeper.

### Phase 3: Fix Classification

For each root cause, classify the fix:

**Point fix** — Addresses this specific bug instance only.
- Typical: change a value, add a null check, fix a typo
- Risk: the same pattern may exist elsewhere and will break the same way
- When appropriate: the bug is truly unique, not a pattern

**Class fix** — Addresses an entire category of potential bugs.
- Typical: add a type constraint, introduce a mapping layer, create a shared abstraction, change an event protocol
- Benefit: prevents N future bugs of the same shape
- When appropriate: you found the same pattern in multiple places, or the root cause is a missing invariant

**Hybrid** — Point fix now + class fix recommendation for later.
- When appropriate: the class fix is large/risky and needs its own PR, but the immediate bug needs to ship

For each fix, provide:
- Concrete code change suggestion (file path, what to change, why)
- Which symptom(s) it resolves
- What it does NOT fix (remaining risks)

### Phase 4: Evidence Chain Verification

Before presenting the report, verify the analysis is sound:

1. **Trace closure.** For each root cause, walk the causal chain forward:
   root cause -> intermediate effects -> observed symptom.
   Every link must be backed by a code reference. If a link is speculative, flag it.

2. **Exclusion check.** Are there alternative explanations? Could the symptom have a different root cause you haven't considered? Briefly state why you ruled them out.

3. **Coverage check.** Are there other code paths that bypass your fix? Other callers, other event sources, replay/history paths, race conditions? List any uncovered paths as remaining risks.

## Output Format

Present the report in this structure:

```markdown
# RCA Report: [Brief title]

## Symptoms
| # | Symptom | Location | Severity |
|---|---------|----------|----------|
| 1 | ...     | file:line | ... |

## Root Cause Analysis

### Root Cause 1: [Title]
**Affects symptoms:** #1, #2

#### 5-Why Chain
1. **Why [symptom]?** Because [answer]. `file:line`
2. **Why [answer from 1]?** Because [answer]. `file:line`
3. ...
N. **Root cause:** [The actual root cause — a missing concept/wrong abstraction/violated invariant]

#### Fix Classification: [Point / Class / Hybrid]
- **What to change:** [concrete suggestion]
- **Files:** `path/to/file.ts:42`
- **Why this works:** [explanation]
- **What this does NOT fix:** [remaining gaps]

### Root Cause 2: [Title] (if applicable)
...

## Evidence Chain
| Root Cause | Chain | Verified? | Gaps |
|-----------|-------|-----------|------|
| RC1 | cause -> effect -> symptom | Yes/Partial | ... |

## Remaining Risks
- [Risk 1: description and where to look]
- [Risk 2: ...]

## Recommendations
1. [Immediate: point fixes to ship now]
2. [Follow-up: class fixes for the backlog]
3. [Monitoring: what to watch for recurrence]
```

## Important Principles

- **Read the code, don't guess.** Every claim in the 5-Why chain must reference actual source code. If you can't find the code path, say so explicitly rather than speculating.

- **Separate symptoms from causes.** "The button doesn't work" is a symptom. "The click handler dispatches the wrong action type" is an intermediate cause. "The event mapping layer treats all TOOL_CALL_END events as completion regardless of business state" is a root cause.

- **Don't stop at the first plausible explanation.** The first "why" answer that sounds reasonable is usually a symptom, not a cause. Keep going.

- **Compound bugs are common.** When a user reports one bug, there are often 2-3 independent root causes interacting. Don't force them into a single narrative.

- **Classify honestly.** If a fix only patches one instance, say so. Don't dress up a point fix as a class fix. The user needs accurate information to decide their investment.

## Halt Conditions

- HALT if the symptom cannot be reproduced from the description and no code references are findable — ask the user for more context
- HALT if the codebase doesn't contain the relevant code (e.g., the bug is in an external dependency) — state this and suggest where to look instead
