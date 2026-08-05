---
name: ko-cq-review
description: Use when the user asks for a code review, PR review, pre-merge review, review-and-fix pass, wants someone to look over a branch, check a diff, find regressions, review current changes, or verify changed code against a plan, ticket, spec, acceptance criteria, branch, commit range, or implementation task.
---

# Code Review

Review code changes with independent context, multiple reviewer perspectives, and explicit triage. The goal is to catch defects, regressions, missed requirements, and risky design choices before they become downstream work.

This skill merges two useful patterns:

- Keep the reviewer independent by giving it a precise context packet instead of relying on the implementer's full conversation history.
- Review from multiple angles, then normalize the results into actionable categories instead of returning a loose pile of comments.

## Inputs

- **change_scope** - Required. A diff, branch, commit range, PR, changed files, or description of the code to review.
- **requirements** (optional) - Plan, ticket, story, acceptance criteria, design doc, user request, or expected behavior.
- **context** (optional) - Relevant architecture notes, conventions, test commands, prior decisions, or known risks.
- **mode** (optional) - `review-only` by default. Use `review-and-fix` only when the user explicitly asks you to apply fixes.

If the user does not provide enough scope, infer the safest local scope only when one obvious scope exists: current diff, staged diff, current branch versus base branch, or explicitly mentioned files. State the scope you used. If several plausible scopes would produce different conclusions, pause and ask the user to choose.

## Execution

### Phase 1: Build The Review Packet

Create a compact review packet before judging the code:

```text
CHANGE_SCOPE:
- Diff, commit range, branch, PR, or files reviewed

REQUIREMENTS:
- Plan/spec/acceptance criteria/user request, or "not provided"

CONTEXT:
- Relevant project conventions, architecture constraints, risk areas, and test expectations

VERIFICATION:
- Tests, type checks, lint, or manual checks already run
```

Do not use private reasoning, implementation history, or the author's intent as evidence. Review the work product against the packet. If the environment and user instructions allow delegation, give subagents the packet or the specific subset described below, not the full session history.

### Phase 2: Run Review Lenses

Use these lenses. If delegation is explicitly allowed by the environment and the user's current instructions, run the lenses independently; otherwise run them sequentially yourself.

1. **Blind Diff Review**
   - Inputs: diff only.
   - Look for obvious correctness bugs, unsafe data mutations, broken APIs, missing error handling, race conditions, confusing control flow, and dead code.
   - This lens catches problems visible without project lore.

2. **Contextual Edge Review**
   - Inputs: diff plus read access to relevant surrounding code.
   - Look for integration bugs, violated local patterns, missing tests, performance risks, security issues, lifecycle mistakes, and edge cases at module boundaries.
   - Prefer repository conventions over generic taste.

3. **Acceptance Review**
   - Inputs: diff plus requirements, when requirements exist.
   - Check whether the implementation satisfies each acceptance criterion, misses required behavior, contradicts constraints, or adds unrequested scope that changes product behavior.
   - If no requirements were provided, explicitly mark this lens as skipped.

### Phase 3: Triage

Normalize, deduplicate, and classify findings:

- `must-fix` - A likely bug, security issue, data loss risk, broken contract, failing requirement, or regression that should block merge.
- `should-fix` - A meaningful quality, maintainability, test, reliability, or performance issue that should be addressed before or soon after merge.
- `decision-needed` - A product, architecture, compatibility, or scope tradeoff where code alone cannot determine the correct answer.
- `defer` - Real issue, but safely outside this change's scope. Record it as follow-up work.
- `noise` - Incorrect, speculative, style-only, duplicate, or not worth action. Do not include noise in the main findings unless explaining why a tempting concern was dismissed.

Every non-noise finding needs evidence:

- File and line, function, or diff hunk.
- What can go wrong.
- Why this matters relative to requirements, local conventions, or runtime behavior.
- The smallest practical fix or decision path.

Be conservative with severity. Do not inflate style preferences into blockers. Do not bury real blockers under polite summary.

### Phase 4: Present Or Act

For `review-only`, return findings first, ordered by severity. Include a short verification note at the end.

For `review-and-fix`, triage internally before editing, then apply fixes only for findings that are clearly patchable and within the requested scope. Leave `decision-needed` items for the user and record `defer` items separately. In the final response, separate what was fixed from what still needs a decision or follow-up.

## Output Format

Use this structure for review reports:

```markdown
**Findings**

- `must-fix` [file:line] Title
  Impact: ...
  Evidence: ...
  Fix: ...

- `should-fix` [file:line] Title
  Impact: ...
  Evidence: ...
  Fix: ...

**Decision Needed**

- [file:line] Question or tradeoff
  Options: ...

**Deferred**

- Follow-up item and why it is safe to defer.

**Verification**

- Scope reviewed: ...
- Requirements checked: ...
- Checks run or not run: ...
```

If there are no findings, say that directly and still include residual risk: unreviewed areas, skipped acceptance review, missing tests, or checks you could not run.

## Important Principles

- Review the product, not the process. Do not rely on the author's thought process as proof of correctness.
- Findings beat summaries. Put concrete issues before high-level commentary.
- A useful review is adversarial about failure modes and fair about evidence.
- Prefer fewer, sharper findings over broad speculation.
- Tie comments to user-visible behavior, data integrity, API contracts, security, reliability, or maintainability.
- Push back on false positives explicitly when a reviewer lens is wrong.
- Do not apply code changes during a review unless the user asked for fixes.

## Halt Conditions

Pause and ask for direction when:

- The review scope is ambiguous and multiple reasonable scopes could lead to conflicting conclusions.
- The requested review would require accessing private systems, credentials, or external data not already available.
- The diff is too large to review responsibly without narrowing scope or splitting by subsystem.
- A `decision-needed` item blocks correct implementation and cannot be resolved from the provided requirements.

## Skill Verification

Pressure-test this skill with at least these scenarios:

1. **Diff-only review:** User asks "review my current diff before I merge." The agent identifies scope, skips acceptance review, and reports findings with file evidence.
2. **Spec-backed review:** User provides a story or plan. The agent checks implementation against explicit acceptance criteria and flags missed requirements.
3. **Review-and-fix:** User asks "review and fix obvious issues." The agent triages first, patches only clear `must-fix` or `should-fix` items, and leaves decisions to the user.
4. **False positive handling:** A reviewer lens raises a stylistic or incorrect concern. The agent dismisses it as `noise` instead of forcing unnecessary churn.

## Maintenance Checklist

- Keep the description trigger-oriented; do not describe the full workflow in frontmatter.
- Keep the lenses independent enough to reduce shared blind spots.
- Keep categories actionable and stable so review results can be compared over time.
- Update examples if repository review norms change.
