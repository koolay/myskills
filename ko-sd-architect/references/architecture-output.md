# Architecture Design Output Specification

Apply when writing or materially updating an architecture design document or a substantial proposal for design review. This is a tailored documentation convention for this skill, informed by the sources below; it is not a claim of certification or conformance to an external standard.

## Tailoring and document state

- Preserve the user's language, requested depth, and project template. Map the content below into that template instead of maintaining duplicate documents. Give small decisions as an inline recommendation with supporting evidence and checks.
- Include the core content in sections 1-4 and 7-8. Select views in section 5 and topics in section 6 according to the concerns and affected boundaries. Include section 9 when implementation slices are requested or needed for feasibility. Omit inapplicable sections; briefly explain omissions that a reviewer would reasonably expect to see.
- Record the document's date, scope, baseline revision/version when known, status, and responsible author/owner when known. Identify the intended reviewers and their concerns. Link each consequential concern to the section that answers it; unknown decision authority is an explicit gap.
- Distinguish current, proposed, and transitional architecture. Mark decisions proposed until acceptance evidence exists; an agent's recommendation is not organizational approval. Reuse existing identifiers and links. Add local identifiers only where cross-references need them.

## Content contract

| Section | Required information | Review question |
| --- | --- | --- |
| 1. Outcome and scope | Problem, users, goals, exclusions, observable acceptance criteria, and relevant domain terms/invariants. | What outcome makes this design worthwhile, and where does it stop? |
| 2. Evidence and constraints | Current baseline and sources; assumptions; hard constraints vs. preferences; workload and capacity assumptions; consequential unknowns. | Which claims are known, proposed, or unresolved? |
| 3. Quality scenarios | Prioritized quality requirements using the scenario format below, with targets and verification mapping. | Can reviewers decide whether the desired quality is achieved? |
| 4. Strategy and decisions | Recommended approach, feasible alternatives including the current approach where applicable, decision criteria, accepted tradeoffs, and significant decision records. | Why does this approach fit these constraints? |
| 5. Architecture views | Context, structure, runtime, and deployment views selected using the rules below. | Can each audience locate the structure and behavior relevant to its concern? |
| 6. Contracts and shared concepts | Affected interface/data contracts and applicable shared mechanisms, such as identity, authorization, consistency, error handling, observability, or AI fallback. | Are the boundaries precise enough to implement and integrate? |
| 7. Risks and recovery | Material failure/impact/detection/recovery/owner mappings, known debt, and open decisions. For changes triggering migration rules, reference their transition and recovery conditions. | What could invalidate the design or prevent safe operation? |
| 8. Verification and readiness | Acceptance criterion or quality scenario -> design element/decision -> check -> evidence/status. State readiness limits and the next required validation. | What supports this recommendation, and what remains unverified? |
| 9. Implementation slices, when needed | Use step 4 of SKILL.md for slice content, ownership, dependencies, and composition. | Can the plan be executed and integrated under the approved scope? |

## Measurable quality scenarios

Use one authoritative table; reference it from goals, decisions, and verification instead of restating targets. Cover the quality concerns that determine architecture, such as availability, latency, security, recoverability, maintainability, or cost.

| Scenario | Context/environment | Trigger/source and affected element | Expected response | Measure/target | Basis | Check/status |
| --- | --- | --- | --- | --- | --- | --- |
| [Name or existing ID] | [Load, normal/degraded mode, environment] | [Who/what acts; component affected] | [Observable behavior] | [Threshold, units, interval/percentile where relevant] | [Required target + source / proposed target / unknown] | [Method and evidence or planned/blocked status] |

Specify workload and measurement conditions for performance/capacity targets. Security and correctness may use binary acceptance rules. If a target is missing, state the gap and decision impact; a proposed value remains a proposal until confirmed. Results require actual measurement evidence.

## Selecting and describing views

Choose the smallest set of views that answers the stated concerns. A full system proposal normally needs context and independently running/deployable units; a focused change can reference unchanged views and show the affected portion. C4 terminology is useful, but no diagram library or notation is required.

- **Context:** People/roles, the system boundary, external systems, and interactions. Distinguish external dependencies from owned components.
- **Structure:** Applications, services, stores, or modules and their responsibilities and relationships. In C4, a container is an application or data store, not necessarily an OS container. Add component detail only where internal responsibilities affect the decision.
- **Runtime:** For behavior spanning boundaries, show the acceptance flows and applicable failure paths identified in step 2 of SKILL.md. Sequence diagrams, numbered flows, or state transitions can capture sync/async interactions, ownership of state changes, and recovery.
- **Deployment:** When topology, isolation, scale, or operations affects feasibility, map runtime units to environments/nodes/zones and show relevant replication and failure domains. Distinguish a proposed topology from a verified deployment.

Give each diagram a title, view type, scope, and current/proposed/transitional state. Name elements and their responsibilities; label directed relationships with intent and, where relevant, protocol/data and sync/async behavior. Explain custom symbols, colors, and abbreviations in a legend. Keep names and abstraction levels consistent across views; make mappings between levels explicit. Use editable diagram source supported by the project, such as Mermaid, plus a brief explanation of the architectural point.

## Boundary contracts and decision records

For each affected API, event, or data boundary, include or link its producer/consumer, request/response or payload/schema, ownership, errors, compatibility/version policy, and applicable timeout/retry/idempotency/order semantics. Document persistence/consistency/lifecycle and access boundaries when they affect the decision. Link authoritative schemas rather than copying them. High-level exploratory designs may leave contract details open, with their impact on implementation readiness stated.

For each architecturally significant decision, record its title/identifier, date, status, context and criteria, choice and rationale, considered alternatives, consequences, and revisit condition. Follow existing ADR conventions; an inline record is sufficient unless the project requires a separate ADR. Link superseded decisions and explain what replaced them. Keep the rationale in one authoritative location.

## Completion review

Before delivering, check that:

- Every consequential reviewer concern and acceptance/quality criterion points to an answer or a named gap with its impact; every criterion has a verification mapping.
- Every shown relationship agrees with the relevant contract and runtime/deployment descriptions; current and proposed states are distinguishable.
- Every significant decision has rationale and evidence-based status; material risks have recovery or an explicit unresolved limitation.
- Planned checks remain planned, blocked checks have reasons, and executed checks cite actual results. State whether the output is exploratory, reviewable, or ready for implementation, with the remaining gates that justify that assessment.

## Primary sources and adaptation

Sources checked on 2026-09-30. The section selection, tables, readiness checks, and local naming above are this skill's adaptations.

- [arc42 overview](https://arc42.org/overview/): Tailorable coverage of goals, constraints, context, views, shared concepts, decisions, quality, risks, and terminology; used as the content baseline rather than a mandatory twelve-section document.
- [arc42 quality requirements](https://docs.arc42.org/section-10/): Scenario-based measurable quality requirements; adapted into the scenario and evidence table.
- [arc42 architecture decisions](https://docs.arc42.org/section-9/): Significant decisions with context, rationale, status, and consequences; adapted into inline or linked decision records.
- [C4 diagrams](https://c4model.com/diagrams): Select valuable abstraction levels and supporting runtime/deployment views; used to tailor views rather than require all four levels.
- [C4 review checklist](https://c4model.com/diagrams/checklist): Diagram scope, element meaning, and relationship clarity; adapted into the diagram review rules.
