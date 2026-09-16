---
name: ko-sd-project-harness
description: "Use when initializing an empty startup repository or planning an existing codebase for AI-native engineering with repository structure, project layout, agent instructions, executable verification, and feedback loops."
---

# Project Harness Bootstrap and Structure

## Goal

Turn a startup project into a repository that an AI coding agent can navigate, modify, verify, and recover safely.

The skill has two deliberately different modes:

- **Empty repository:** create a small, stack-aware project control plane and implementation layout.
- **Non-empty repository:** inspect first and produce an incremental AI-native engineering plan. Do not reorganize or overwrite an existing codebase before the plan is approved.

The objective is not to maximize folders or documentation. Every artifact must make a decision, invariant, command, or feedback signal easier for an agent to discover and execute.

## Inputs

- **primary_input** - The target repository and the request to initialize, template, or AI-native-enable it.
- **context** (optional) - Product brief, target users, deployment environment, preferred language/framework, data stores, compliance constraints, team size, or existing engineering standards.
- **scope** (optional) - Which layers may change. Default to repository-local structure and documentation only; do not mutate remote systems, deploy, migrate data, or rotate credentials.

## Execution

### Phase 1: Classify the repository and establish safety boundaries

1. Resolve the repository root and inspect `git status --short` before editing.
2. Classify the target as **empty** when it has no meaningful application code, package/runtime manifest, infrastructure, tests, or project documentation beyond placeholders. Otherwise classify it as **non-empty**.
3. Read repository-local instructions first: `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, package manifests, CI configuration, and existing architecture or plan documents.
4. Preserve unrelated user changes. Never delete, rename, overwrite, or mass-format existing files as part of bootstrap.
5. Detect available runtimes and package managers from files, not from assumptions. Record the exact commands that are safe to run.
6. If the repository has secrets, private customer data, production configuration, or an in-progress merge/rebase, stop before broad inspection or structural edits and report the boundary.

### Phase 2: Inspect the product and runtime contract

For either mode, build a compact inventory before choosing a layout:

- product mission, primary user journey, non-goals, and first measurable outcome;
- runtime entry points, modules/packages, persistence and external services;
- local setup, test, lint, type-check, build, migration, and deploy commands;
- CI checks, branch/PR rules, release path, and ownership boundaries;
- logs, metrics, traces, health checks, error reporting, and local observability access;
- authentication, authorization, secrets, personal data, and trust boundaries;
- existing agent instructions, design docs, ADRs, runbooks, evals, and known debt.

Prefer repository-local evidence. If a fact is missing, label it as unknown instead of filling it with a plausible convention.

### Phase 3A: Bootstrap an empty repository

Use this phase only after Phase 1 identifies the repository as empty.

1. If the language, framework, deployment target, or product boundary is required to generate executable application code but is unknown, ask one concise clarification question. You may still create the technology-neutral control plane below.
2. If a framework is specified, use its official generator or documented project shape when available. Do not introduce a framework merely because it is familiar.
3. Create only the directories that the selected stack needs. A typical startup baseline is:

   ```text
   project/
   ├── AGENTS.md                    # short, executable agent contract
   ├── README.md                    # product, setup, commands, current status
   ├── ARCHITECTURE.md              # boundaries, data flow, invariants
   ├── CONTRIBUTING.md              # change and verification workflow
   ├── docs/
   │   ├── architecture/decisions/ # ADRs and structural decisions
   │   ├── domain/                  # business vocabulary and rules
   │   ├── plans/                   # executable multi-step plans
   │   ├── runbooks/                # operations and recovery procedures
   │   └── evals/                   # behavior scenarios and acceptance evidence
   ├── src/                         # implementation, grouped by business domain
   ├── tests/                       # unit, integration, e2e, structural as needed
   ├── scripts/                     # one source of truth for repeatable checks
   ├── ops/                         # deployment and observability only when applicable
   └── .github/                     # CI and contribution templates when applicable
   ```

4. Group application code by business domain first. Within a domain, use only the layers justified by the system, for example `types`, `config`, `repo`, `service`, `runtime`, and `ui`. Keep dependency direction explicit and enforce it mechanically where practical.
5. Put cross-cutting concerns such as auth, connectors, feature flags, telemetry, and configuration behind explicit provider or adapter interfaces. Do not allow arbitrary cross-domain imports.
6. Write `AGENTS.md` as a compact contract containing:

   - what the project does and where the source of truth lives;
   - exact setup, test, lint, type-check, build, and local-run commands;
   - directory ownership and dependency direction;
   - required checks for each change class;
   - data/security boundaries and forbidden operations;
   - where to write plans, decisions, runbooks, and eval results.

7. Write `README.md` for a new contributor: what the product is, how to start it, the command matrix, the repository map, the current limitations, and how to get help.
8. Write `ARCHITECTURE.md` around stable boundaries and invariants, not a speculative list of technologies. Include a small dependency diagram or table when relationships are non-linear.
9. Add CI, PR templates, issue templates, formatting, or generated configuration only when their runner and commands are known. Never add a green-looking placeholder workflow that cannot run.
10. For a public or networked service, add a `SECURITY.md` or equivalent security baseline with supported versions and a reporting path; do not include secrets or private incident details.
11. Add at least one executable smoke check or clearly mark the first missing verification gate in `docs/plans/`. Do not claim the project is initialized until the documented quickstart works.

### Phase 3B: Plan AI-native engineering for a non-empty repository

Use this phase whenever the repository contains meaningful existing work.

1. Do not reshape the repository immediately. Create a plan in the repository's established planning location; if none exists, use `docs/plans/ai-native-baseline.md`.
2. Start the plan with a current-state map: entry points, package boundaries, commands, CI, environments, observability, data/security boundaries, and documentation sources of truth.
3. Identify the smallest high-leverage gaps, in this order:

   - **Legibility:** root and scoped agent instructions, repository map, domain vocabulary, architecture decisions, and command matrix.
   - **Boundaries:** dependency direction, ownership, API/data contracts, schema validation at boundaries, and structural checks.
   - **Feedback:** deterministic tests, smoke checks, eval scenarios, CI gates, logs/metrics/traces, and machine-readable artifacts.
   - **Recoverability:** executable plans, checkpoints, worktree isolation, idempotent scripts, and documented rollback/recovery.
   - **Entropy control:** stale-doc checks, dead-code/dependency checks, size limits, naming rules, and a recurring cleanup loop.

4. For every proposed change, state the observed problem, the repository evidence, the smallest fix, the owner/source of truth, the verification command, and the migration risk.
5. Sequence the plan as vertical slices that each improve agent capability and leave the repository valid. Prefer one command or invariant that unlocks several downstream tasks over a broad reorganization.
6. Separate **must enforce mechanically**, **should document**, and **may remain a local implementation choice**. Do not turn taste into a hard rule without a failure mode and a check.
7. Include an acceptance gate for each slice. A gate must be independently runnable, capable of failing, and able to point an agent toward remediation.
8. Ask for approval before implementing structural migrations, moving files, changing public contracts, adding dependencies, changing CI permissions, or touching deployment/data.

### Phase 4: Make the layout agent-legible and business-safe

Apply these rules to new scaffolds and approved changes:

- Keep high-value knowledge in versioned repository-local artifacts. Link decisions to the code, schema, test, or runbook they govern.
- Use progressive disclosure: a short root instruction file, scoped instructions near complex subsystems, and deeper references only when needed.
- Make scripts the source of truth for repeatable workflows. Documentation should invoke the scripts instead of duplicating long command sequences.
- Validate external input at system boundaries and make data shapes discoverable in schemas or types.
- Prefer structured logs and stable event fields. Expose health, metrics, traces, and local inspection commands whenever the runtime has operational behavior.
- Treat tests and evals as separate but complementary: tests protect implementation contracts; evals exercise user-visible behavior and agent-facing workflows.
- Encode architectural invariants in structural tests or linters when a violation would otherwise recur. Error messages must explain the violated rule and the repair path.
- Keep secrets out of the repository. Use environment/configuration references and document required variables without recording values.
- Keep local, test, and production behavior as similar as practical; use disposable, isolated dependencies for development and verification.
- Use worktrees or equivalent isolation for parallel/long-running changes when the repository tooling supports it.
- Keep the baseline small. Do not create empty layers, fake integrations, speculative abstractions, or broad templates that the first feature will immediately invalidate.

### Phase 5: Verify and hand off

1. Re-read every generated instruction and command as a fresh agent would. Remove commands that cannot be run in the current stack.
2. Run the documented checks that are available: formatting, lint, type-check, unit/smoke tests, structural checks, and link/path validation. If a check is unavailable, report it as not run.
3. Verify that every new path is linked from the appropriate README, architecture map, index, or scoped instruction file.
4. Inspect `git diff --check`, `git status --short`, and the final tree. Confirm unrelated changes were preserved.
5. For a non-empty repository, stop after producing the plan unless the user explicitly approved implementation in the same request. For an empty repository, report the scaffold and the first runnable command.

## Output Format

Return a concise handoff with this structure:

~~~markdown
# AI-Native Project Bootstrap

## Mode

- Empty bootstrap | Non-empty assessment and plan
- Repository: `...`

## Result

- Created or planned: `...`
- Preserved or deferred: `...`

## Project Layout

```text
...
```

## Agent Contract

- Source of truth: `...`
- Commands: `...`
- Invariants: `...`
- Feedback surfaces: `...`

## Verification

- PASS: `...`
- NOT RUN: `...` (reason)

## Next Slice

1. ...

## Decisions / Questions

- ...
~~~

For non-empty repositories, the primary artifact is the linked plan. Do not present a proposed migration as completed work.

## Important Principles

- Humans specify product intent, boundaries, and risk; agents execute within explicit, inspectable contracts.
- Optimize for agent legibility, not documentation volume.
- Encode repeatable judgment as a check, not merely as prose.
- Prefer additive, reversible slices and truthful verification over impressive scaffolding.
- Keep business rules close to the domain that owns them; keep cross-cutting capabilities behind explicit interfaces.
- Make failure actionable: every failed check should identify the violated contract, evidence, and repair path.
- Use current repository evidence and first-party documentation for technology-specific decisions; label inference as inference.

## Halt Conditions

- HALT before structural edits when the repository is non-empty and the user has not approved the generated plan.
- HALT if product/runtime choices are required for executable code and cannot be inferred safely; ask one concise question after creating only safe control-plane artifacts.
- HALT if the task would delete, overwrite, migrate, deploy, change permissions, or mutate a remote system without explicit approval.
- HALT if secrets, private data, production configuration, or unresolved merge/rebase state makes inspection unsafe; identify the exact boundary.
- HALT if a requested command, framework, or service is unavailable and do not replace it with an invented passing stub.
- HALT if verification cannot run or produces contradictory results; report the evidence instead of claiming success.

## Sources

- Local reference: `../wiki/knowledge/ai-agents/harness-engineering.md`.
- [OpenAI: Harness engineering](https://openai.com/index/harness-engineering/) - repository legibility, explicit invariants, executable feedback, observability, and entropy control.
- [OpenAI Cookbook: Exec plans](https://developers.openai.com/cookbook/articles/codex_exec_plans) - recoverable plans for multi-step agent work.
- [GitHub Docs: Creating a template repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository) - reusable repository structure and files.
- [GitHub Docs: Setting guidelines for repository contributors](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors) - discoverable contribution and change guidance.
- [The Twelve-Factor App](https://12factor.net/) - declarative setup, environment-backed configuration, disposability, parity, and logs as event streams.
- [OpenTelemetry: What is OpenTelemetry?](https://opentelemetry.io/docs/what-is-opentelemetry/) - traces, metrics, logs, and correlation as observable runtime signals.
- [OWASP ASVS](https://github.com/OWASP/ASVS) - versioned application security requirements for a concrete baseline.

## Maintenance Checklist

- [ ] Empty and non-empty paths remain distinct and safe.
- [ ] The scaffold does not invent a runtime, dependency, CI pass, or deployment state.
- [ ] Every generated command is backed by the selected stack and was run or marked not run.
- [ ] Architectural invariants have a concrete verification path.
- [ ] The non-empty path produces a plan before migration.
- [ ] README and index entries describe the current skill behavior.
- [ ] Pressure scenarios cover empty bootstrap, non-empty plan-first behavior, and unsafe-operation halts.
