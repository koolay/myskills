---
name: ko-sd-architect
description: Use when architecture decisions involve technology selection, shared contracts or data ownership, breaking migrations, or AI implementation boundaries.
---

# Evidence-Based Architecture

**Goal:** Choose the smallest shippable architecture and establish evidence for its domain outcomes, contracts, and recovery.

**Do not use when:** Work is local under settled contracts, or concerns only product requirements or an isolated bug.

## Inputs

- **Decision:** The user outcome and architectural choice to resolve.
- **Evidence:** Relevant code, domain rules, contracts, prior decisions, workload, and failure reports.
- **Constraints:** Budget, deadline, compatibility, ownership, security, and operational limits.
- **Scope:** Default to a recommendation. Include implementation slices when requested or needed to establish feasibility; execute only within the user's authorization.

## Execution

Apply these steps directly with available repository and documentation tools; no external skill or plugin is required. Use existing project documents. Scale detail to the decision, with a paragraph sufficient for a reversible choice.

### 1. Frame the decision

1. Inspect project instructions and the affected flow; for a new system, use supplied requirements. State the user outcome, scope, and observable acceptance criteria. Define ambiguous domain terms through examples or state transitions.
2. Separate **facts with sources**, **assumptions**, and **open decisions**. Classify constraints as hard requirements or preferences, recording their source and owner when known. Verify changing vendor capabilities against current primary documentation when they determine feasibility.
3. Apply the halt conditions to consequential gaps. Use explicit assumptions for reversible choices; mark missing budgets, owners, or measurements as unknown.

**Complete when:** Each acceptance criterion is observable, each hard constraint has a source, and every consequential unknown is either a bounded provisional assumption or a named blocker.

### 2. Trace contracts and failures

1. Trace a representative flow for each distinct acceptance path through consumers, producers, storage, and external dependencies. Identify data ownership, trust boundaries, and affected API/schema/event contracts. Use a diagram only when it clarifies the decision.
2. For every affected contract, state what remains compatible and which consumers must change. Historical choices can be revised using evidence of harm, unsupported technology, or requirement mismatch; retain explicit user commitments or identify the authority needed to change them.
3. Examine applicable failures at those boundaries: unavailable dependencies, duplicate/reordered messages, partial writes, incompatible versions, and unauthorized access. Map each material failure to impact, detection, recovery, and owner (or an ownership gap). Treat a timed-out write as an unknown outcome; establish idempotency or reconciliation before retrying.
4. If the proposal changes persisted formats or breaks consumer compatibility, read [migration rules](./references/migrations.md) and carry their conditions into the recommendation.

**Complete when:** Every acceptance path has a boundary trace; every affected contract has a compatibility disposition; every material failure has detection and recovery or an explicit unresolved gap.

### 3. Make the decision verifiable

1. Evaluate extending the current approach and the cost of making no change before adding infrastructure. Honor a user-required migration as a requirement. Add alternatives only for material tradeoffs; compare domain fit, compatibility, delivery cost, operational burden, and reversibility.
2. Tie each new service, dependency, abstraction, or AI capability to a demonstrated need. When AI is relevant, evaluate quality, latency, cost, data handling, and fallback against that need.
3. Resolve choice-determining uncertainty with a bounded experiment and decision threshold. Distinguish user targets from proposed thresholds and measured results.
4. Recommend one feasible option, its accepted tradeoff, and evidence that would justify revisiting it. Map every acceptance criterion to a check, including integrated behavior across the affected real boundaries and applicable failure or mixed-version cases. Track checks as **executed with results**, **planned**, or **blocked**.

**Complete when:** The option meets all hard constraints or is explicitly provisional; every criterion has a check; required boundary/recovery checks are accounted for. Coverage and task completion supplement integrated evidence.

### 4. Define implementation slices when needed

Skip this step for recommendation-only requests unless slices are necessary to demonstrate feasibility.

1. Use the fewest slices that deliver or verify observable behavior. For each, specify context files, file/component ownership, input/output contract, dependencies, acceptance check, and failure/recovery boundary.
2. Settle shared contracts before dependent work. Sequence overlapping writes and shared schema edits unless an explicit coordination plan resolves them. Name who composes the slices and which step verifies the integrated flow.

**Complete when:** Every criterion maps to a slice and check, every shared artifact has an owner and edit order, and integration has an owner and verification point. A plan for parallel work remains a plan until execution is authorized.

## Output Format

Use the user's language and format. For small decisions, report recommendation, evidence/tradeoff, and checks or blockers inline. For larger decisions use:

- **Decision:** Outcome, acceptance criteria, recommendation, accepted tradeoff.
- **Evidence:** Facts/sources, assumptions, hard constraints/preferences, open decisions.
- **Boundaries:** Flows, contracts, feasible alternatives, and material failure mappings.
- **Verification:** Criterion -> check -> status; migration conditions when applicable.
- **Slices, when needed:** Slice | Context/ownership | Contract/dependencies | Check | Recovery; integration owner and check.

## Important Principles

Domain outcomes and explicit commitments govern the decision; technical elegance is a tradeoff. Technical feasibility and organizational approval are distinct evidence. Existing project quality gates remain binding.

## Halt Conditions

- **Decision-changing gap or conflicting requirements:** Ask one focused question after inspecting available context; pause dependent choices and continue independent analysis.
- **No feasible option under hard constraints:** Name the conflicting constraints and the decision authority needed to change them; retain those constraints until authorized otherwise.
- **Destructive or external action outside authorization:** Stop before execution and request approval for the specific scope. Existing authorization covers ordinary reversible work.
- **Unavailable required evidence or check:** Mark the recommendation provisional and the check blocked with its reason; specify what would resolve it. A mock verifies its own boundary, not an unavailable real integration.

## Skill Verification

When editing or evaluating this skill, read [maintenance notes](./references/maintenance.md) and exercise affected [pressure scenarios](./evals/evals.json). Distinguish manual walkthroughs from independent agent runs.
