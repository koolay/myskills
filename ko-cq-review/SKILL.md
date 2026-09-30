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

Record the base/head commits or working-tree state and distinguish author-reported checks from checks you observed. For branch reviews, use the intended base and merge-base diff; for local changes, state whether staged, unstaged, and untracked files are included. Do not silently omit part of the requested change.

Do not use private reasoning, implementation history, or the author's intent as evidence. Review the work product against the packet. If the environment and user instructions allow delegation, give subagents the packet or the specific subset described below, not the full session history.

### Phase 2: Run Review Lenses

Use these lenses. If delegation is explicitly allowed by the environment and the user's current instructions, run the lenses independently; otherwise run them sequentially yourself.

For a large change, review by subsystem in risk order and track coverage, then check interactions between subsystems. Size is an inspection signal, not a defect: mechanical edits and deletions need different scrutiny from auth, billing, or schema changes. Do not claim full coverage of a partial review.

1. **Blind Diff Review**
   - Inputs: diff only.
   - Look for obvious correctness bugs, unsafe data mutations, broken APIs, missing error handling, race conditions, confusing control flow, and dead code.
   - This lens catches problems visible without project lore.
   - Treat its findings as candidates until checked against surrounding code. A sequential pass by the same agent is not an independent reviewer.

2. **Contextual Edge Review**
   - Inputs: diff plus read access to relevant surrounding code.
   - Look for integration bugs, violated local patterns, missing tests, performance risks, security issues, lifecycle mistakes, and edge cases at module boundaries.
   - Prefer repository conventions over generic taste.
   - Read relevant tests before tracing the implementation. Check observable behavior and assertions: would the test fail for the reported bug or a realistic regression? Passing tests alone do not establish coverage.
   - Trace changed contracts through callers, consumers, and error paths. Check existing helpers before proposing another abstraction.

3. **Acceptance Review**
   - Inputs: diff plus requirements, when requirements exist.
   - Check whether the implementation satisfies each acceptance criterion, misses required behavior, contradicts constraints, or adds unrequested scope that changes product behavior.
   - If no requirements were provided, explicitly mark this lens as skipped.

Across these lenses, cover five quality axes without repeating the review five times:

| Axis | Evidence to inspect |
|------|---------------------|
| Correctness | Boundary values, failures, state transitions, concurrency, contract compatibility, and regression tests that exercise the changed behavior. |
| Readability and simplicity | Control flow and invariants a reader must follow; unused code or wrappers; complexity removed versus merely moved. |
| Architecture | Ownership, dependency direction, reuse of canonical helpers, and feature logic leaking into shared modules. Check whether casts or silent fallbacks conceal a broken invariant. |
| Security | Untrusted input through validation to use, authorization at the operation, injection, output encoding, and secrets in code or logs. |
| Performance | N+1 queries, unbounded work or fetching, resource lifetime, blocking work, and repeated rendering on actual execution paths. Support cost claims with measurements or a concrete workload; do not invent timings. |

When dependencies change, inspect both the manifest and lockfile, upstream changelog or migration notes, affected call sites, and relevant test results before and after when available. For new dependencies, check whether existing utilities suffice and inspect maintenance, license, vulnerability, and size evidence relevant to the project. Installation success is not compatibility evidence. If sources or checks are unavailable, report the gap; do not infer safety from semver. Recommend splitting unrelated upgrades when it improves diagnosis, while keeping coupled packages together. Regenerate lockfiles with the package manager if a fix requires changing them.

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

Validate each candidate against the full relevant path, existing guards, and the base version. Identify whether the change introduces, worsens, or exposes the issue; keep unrelated pre-existing defects out of blockers. For test gaps, name the behavior that could regress. For structural issues, name a concrete move such as reusing a helper, removing a wrapper, or restoring ownership, and explain what complexity it removes. File length, repeated branches, or a preferred design alone are not blocking evidence.

Be conservative with severity. Do not inflate style preferences into blockers. Do not bury real blockers under polite summary.

### Phase 4: Present Or Act

For `review-only`, return findings first, ordered by severity. Include a short verification note at the end.

For `review-and-fix`, triage internally before editing, then apply fixes only for findings that are clearly patchable and within the requested scope. Leave `decision-needed` items for the user and record `defer` items separately. In the final response, separate what was fixed from what still needs a decision or follow-up.

After fixes, run checks appropriate to the affected behavior and inspect the final diff for new regressions. For bug fixes, use a focused regression check that would fail before the fix when practical. Verify callers, exports, registration, and dynamic use before removing suspected dead code; lack of a text match alone does not prove it is unused. Preserve unrelated user changes.

Conclude with `request-changes` for unresolved blockers, `incomplete` when missing evidence prevents a responsible verdict, or `approve` when review coverage and verification support readiness with no blockers. Nonblocking improvements may remain. A review recommendation does not authorize merging, publishing comments, or creating external follow-up tasks.

## Output Format

Use this structure for review reports; omit empty decision and deferred sections:

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
- Coverage gaps and residual risk: ...

**Verdict**

- approve | request-changes | incomplete: evidence-based reason
```

If there are no findings, say that directly and still include residual risk: unreviewed areas, skipped acceptance review, missing tests, or checks you could not run.

## Important Principles

- Review the product, not the process. Do not rely on the author's thought process as proof of correctness.
- Findings beat summaries. Put concrete issues before high-level commentary.
- A useful review is adversarial about failure modes and fair about evidence.
- Prefer fewer, sharper findings over broad speculation.
- Tie comments to user-visible behavior, data integrity, API contracts, security, reliability, or maintainability.
- Push back on false positives explicitly when a reviewer lens is wrong.
- Resolve disagreements with technical evidence and project rules. Accept improvements that meet requirements without demanding perfection; do not defer a blocker merely because someone promises later cleanup. Record safe deferrals with a reason.
- Do not apply code changes during a review unless the user asked for fixes.

## Halt Conditions

Pause and ask for direction when:

- The review scope is ambiguous and multiple reasonable scopes could lead to conflicting conclusions.
- The requested review would require accessing private systems, credentials, or external data not already available.
- Missing context or review limits still prevent responsible coverage after splitting the review by subsystem. Report completed coverage and the remaining scope before asking for direction.
- A `decision-needed` item blocks correct implementation and cannot be resolved from the provided requirements.

## Skill Verification

Pressure-test this skill with at least these scenarios:

1. **Diff-only review:** User asks "review my current diff before I merge." The agent identifies scope, skips acceptance review, and reports findings with file evidence.
2. **Spec-backed review:** User provides a story or plan. The agent checks implementation against explicit acceptance criteria and flags missed requirements.
3. **Review-and-fix:** User asks "review and fix obvious issues." The agent triages first, patches only clear `must-fix` or `should-fix` items, and leaves decisions to the user.
4. **False positive handling:** A reviewer lens raises a stylistic or incorrect concern. The agent dismisses it as `noise` instead of forcing unnecessary churn.
5. **Green tests, broken contract:** A changed shared helper has a passing happy-path test but breaks another caller. Trace the caller and report the concrete failure and missing regression check.
6. **Dependency-only change:** A patch bump changes runtime behavior and the lockfile; installation succeeds. Inspect release notes and affected usage, and disclose unavailable compatibility checks.
7. **Large mechanical change:** A large rename or deletion has no demonstrated structural regression. Review its references and boundaries without treating line count as a blocker.

Reusable pressure prompts and expected decisions are in [evals/evals.json](evals/evals.json).

## Source

Adapted from [addyosmani/agent-skills: code-review-and-quality](https://github.com/addyosmani/agent-skills/blob/main/skills/code-review-and-quality/SKILL.md): five quality axes, test-first inspection, structural remedies, verification evidence, and dependency discipline. Retain this skill's independent context packets and triage categories; use risk-based sizing and scoped authorization rather than blanket size limits or mandatory cleanup approvals.

## Maintenance Checklist

- Keep the description trigger-oriented; do not describe the full workflow in frontmatter.
- Keep the lenses independent enough to reduce shared blind spots.
- Keep categories actionable and stable so review results can be compared over time.
- Update examples if repository review norms change.
