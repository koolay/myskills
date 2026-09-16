# AI-native project structure and bootstrap research

Date: 2026-09-16
Scope: reusable Codex skill for bootstrapping empty startup repositories and planning the AI-native evolution of existing repositories.

## Executive findings

The reusable skill should be a repository-harness initializer, not a framework generator. Its stable output is a navigable knowledge map, explicit contracts, executable checks, recoverable work state, and safe feedback loops. The technology-specific source tree should remain an adapter selected from the project's stated product and runtime needs.

The local harness-engineering note reaches the same conclusion: keep entry-point instructions short, move detail into progressively disclosed documents, encode architectural judgments as checks, require independent validation, make execution state durable, and control autonomy by observability, reversibility, and permissions ([local source](../../wiki/knowledge/ai-agents/harness-engineering.md)). OpenAI describes this as designing the environment so agents can execute against clear boundaries and feedback rather than relying on a larger prompt ([Harness engineering](https://openai.com/index/harness-engineering/)).

## Primary-source evidence and implications

| Evidence | Implication for the skill |
| --- | --- |
| OpenAI's harness-engineering report emphasizes repository knowledge, architectural constraints, isolated execution, observable applications, independent evaluation, and continuous cleanup ([source](https://openai.com/index/harness-engineering/)). | Bootstrap the control plane before adding feature code: instructions, architecture, plans, checks, evaluation, observability, and security boundaries. Treat repository quality as a maintained system, not a one-time scaffold. |
| OpenAI's ExecPlan guidance requires a self-contained plan with goal, context, milestones, commands, expected results, progress, discoveries, decisions, and review ([source](https://developers.openai.com/cookbook/articles/codex_exec_plans)). | Existing repositories must enter a plan-first mode. Persist the inventory, proposed layout, risks, acceptance checks, and decisions under `docs/exec-plans/active/`; do not silently reorganize a live codebase. |
| GitHub's first-party guidance recommends concise actionable repository instructions and organizing complex instruction sets into scoped files ([source](https://docs.github.com/en/enterprise-cloud@latest/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)). | Keep `AGENTS.md` as a short router: project purpose, commands, invariants, safety limits, and links. Put domain, frontend, security, and operations rules in separate documents that can be loaded only when relevant. |
| OpenTelemetry defines observability through emitted traces, metrics, and logs, with correlation making system behavior explainable ([source](https://opentelemetry.io/docs/what-is-opentelemetry/)). | Add an observability contract early. A bootstrap should identify how to run the system, where logs go, how requests/jobs are correlated, and which health/error signals prove a change worked. Avoid claiming end-to-end readiness when the app cannot be observed. |
| OWASP ASVS is a versioned security requirements standard for designing, developing, and testing web applications and services ([source](https://github.com/OWASP/ASVS)). GitHub documents `SECURITY.md` as the place for supported versions and vulnerability reporting ([source](https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository)). | Create a security baseline with threat assumptions, secret handling, dependency and input-validation checks, supported versions, and a reporting path. Reference a versioned standard instead of inventing vague “secure coding” prose. |
| Pytest's first-party documentation makes test discovery conventions explicit and configurable ([source](https://docs.pytest.org/en/stable/example/pythoncollection.html)). | Name the test command and discovery rules in the repository contract. The skill should detect the existing test runner; if none exists, add the smallest smoke/evaluation path rather than assuming a language-specific suite. |

Context7 lookups were used to validate current first-party material for GitHub repository instructions/Actions, OpenTelemetry, and pytest. The cited URLs are the authoritative sources; Context7 is a retrieval mechanism, not an additional authority.

## Recommended default layout

Use this as a capability map, adding only directories justified by the project. Empty projects should receive the minimal set; existing projects should map their current equivalents before introducing new paths.

```text
AGENTS.md                         # short entry point and navigation
README.md                         # user-facing purpose and quick start
ARCHITECTURE.md                   # stable system map, boundaries, invariants
SECURITY.md                       # reporting path, support policy, baseline
docs/
  product-specs/                  # user outcomes and acceptance language
  design-docs/                    # decisions, alternatives, consequences
  exec-plans/
    active/                       # self-contained plans in progress
    completed/                    # completed plans and verification summary
  references/                     # curated external references
  generated/                      # generated facts; never the sole source of truth
  quality/                        # quality, reliability, and evaluation policy
tests/                            # unit/integration/e2e or the existing equivalent
evals/                            # agent/task-level acceptance cases and fixtures
observability/                    # dashboards, runbooks, telemetry conventions
scripts/                          # repeatable setup, check, and maintenance commands
.github/workflows/                # CI checks with bounded time and permissions
src/                              # application code, shaped by the selected stack
```

The layout is intentionally not a claim that every project needs every directory. The skill should preserve an established convention when it is coherent, create links/aliases when migration is safer than moving files, and flag ambiguous ownership instead of duplicating competing sources of truth.

## Reusable Codex-skill behavior

### Mode A: empty startup project

1. Confirm the repository is empty enough to bootstrap: inspect tracked files, manifests, source directories, CI, and existing instructions; never infer emptiness from a blank README alone.
2. Capture product, users, runtime/deployment target, data sensitivity, language/framework constraints, and the first vertical slice. If essential choices are missing, record assumptions and ask only the questions that change the layout.
3. Create the minimal map: `AGENTS.md`, `README.md`, `ARCHITECTURE.md`, `SECURITY.md`, `docs/`, tests/evals, scripts, and CI placeholders appropriate to the chosen stack.
4. Add executable contracts: format/lint/type/build/test commands, a smoke test, secret checks, dependency checks, and a structural check that verifies required documents and links.
5. Add a small evaluation matrix: happy path, boundary/error cases, non-goals, and observable evidence. Keep it separate from implementation tests when it evaluates agent behavior or product outcomes.
6. Run the checks in a clean, bounded environment and write the result and remaining assumptions into the bootstrap plan. Do not add speculative framework layers or fake integrations.

### Mode B: non-empty repository

1. Inventory before editing: current layout, entry points, package/build commands, test/eval coverage, CI, runtime dependencies, observability, secrets/security files, and documentation sources of truth.
2. Produce `docs/exec-plans/active/ai-native-structure.md` (or the repository's established equivalent) containing current state, target state, gaps, dependency/risk analysis, migration slices, exact checks, and rollback boundaries.
3. Classify changes as documentation-only, additive harness, safe rename/move, or behavior-affecting refactor. Default to additive and reversible; do not reorganize code merely to match the reference tree.
4. Ask for approval before broad moves, public API changes, data migrations, permission changes, production configuration changes, or deleting competing documentation.
5. Implement one vertical slice at a time. After each slice, run the smallest relevant checks plus the independent structural/evaluation checks; update plan progress, discoveries, and decisions.
6. Finish with a freshness pass: verify links, commands, generated artifacts, CI behavior, security boundaries, and that `AGENTS.md` points to the real sources of truth.

## Acceptance gates for the future skill

The skill is successful only when it can show:

- a short entry-point instruction file with working links and no duplicated policy;
- a stable architecture map that names module boundaries and dependency direction;
- at least one reproducible setup/check/test command and a smoke or evaluation case;
- a plan and durable status for any multi-step change;
- a documented observability path for the primary run mode;
- security ownership, secret-handling rules, and a vulnerability-reporting path;
- CI or an explicitly recorded reason it is not yet possible, with a next step;
- validation evidence from a clean or isolated run, not only the implementing agent's summary;
- a clear halt/escalation condition for missing product decisions, destructive actions, production access, data loss, or unverifiable behavior.

These gates turn the reference layout into an adaptable engineering contract. The skill should report what it created, what it preserved, what it deferred, and the commands/evidence used; it should never claim that a repository is “AI-native” solely because it contains `AGENTS.md`.

## Sources

- Local: `../wiki/knowledge/ai-agents/harness-engineering.md` (available during research).
- [OpenAI — Harness engineering](https://openai.com/index/harness-engineering/).
- [OpenAI Cookbook — ExecPlans](https://developers.openai.com/cookbook/articles/codex_exec_plans).
- [GitHub Docs — repository custom instructions](https://docs.github.com/en/enterprise-cloud@latest/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot).
- [OpenTelemetry — What is OpenTelemetry?](https://opentelemetry.io/docs/what-is-opentelemetry/).
- [OWASP — Application Security Verification Standard](https://github.com/OWASP/ASVS).
- [GitHub Docs — repository security policy](https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository).
- [pytest — test discovery](https://docs.pytest.org/en/stable/example/pythoncollection.html).
