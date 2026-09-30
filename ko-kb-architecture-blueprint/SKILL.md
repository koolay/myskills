---
name: ko-kb-architecture-blueprint
description: Use when documenting an existing codebase's implemented architecture and how new work should fit it.
---

# Architecture Blueprint

**Goal:** Produce an evidence-based map of the architecture that exists today and a practical guide for extending it consistently.

**Use when:** The user asks for an architecture blueprint, an architecture overview of an existing repository, or guidance on where and how to add features within its current structure.

**Do not use when:** The task is to choose a new architecture or make a significant design decision; use `ko-sd-architect` for that work. A single-module explanation does not need a project blueprint.

## Inputs

- **Repository or project:** Required. Use the current repository unless the user names another one.
- **Audience and focus:** Optional. Use the user's requested depth, format, and subsystem focus. Default to developers adding or changing features.
- **Output path:** Optional. Default to `docs/architecture-blueprint.md` if `docs/` exists, otherwise `Project_Architecture_Blueprint.md` at the repository root. Follow an existing project documentation convention when one is clear.

## Execution

### 1. Discover the implemented system

1. Read project instructions and existing architecture documents. Inspect the file tree, manifests, entry points, build and deployment configuration, and representative tests.
2. For an executable system, trace at least one real request, job, or user flow from its entry point through component boundaries to data or external dependencies. For a documentation or library repository, trace how a representative artifact is discovered and used. For each distinct subsystem in scope, inspect the files that establish its responsibilities and dependencies.
3. Identify the observed technology stack, runtime units, module boundaries, data ownership, dependency direction, and communication paths. Treat names such as "clean architecture" or "microservices" as claims to verify, not patterns to impose.
4. Record source paths for consequential claims. Separate observed behavior, documented intent, inference, and unknowns. Do not infer why a decision was made solely from its current implementation.

### 2. Write the blueprint

1. Summarize the system's purpose, scope, and implemented structure. Map major components to their responsibilities, entry points, dependencies, and source files.
2. Show a small architecture diagram only when it clarifies relationships. Use editable Mermaid or the project's existing format. Label edges with the interaction they represent and check every element against the inspected code.
3. Document applicable data flow, persistence, external interfaces, configuration, authentication, error handling, observability, testing, and deployment patterns. Omit topics with no evidence or relevance; state important unknowns explicitly.
4. Give concrete guidance for common extensions: where a similar feature belongs, which existing component or interface to follow, what contracts it must preserve, and which check validates integration. Cite one representative implementation for each pattern. Avoid speculative templates, extension points, and governance rules.
5. Link existing ADRs or decisions where they explain the architecture. Describe inferred tradeoffs as inference, not as historical fact. Note observed boundary violations or inconsistencies with examples, without silently redesigning the system.

### 3. Check the document

1. Recheck referenced paths and diagram relationships against the repository.
2. Make sure a developer can locate the relevant entry point or document, follow one representative flow, and identify the right place to add a comparable feature.
3. Mark the repository revision or date inspected and note areas outside the reviewed scope.

## Output Format

Write the blueprint at the chosen path and report the path to the user. Use the project's existing format where present. Otherwise organize it as:

```markdown
# Architecture Blueprint

## Scope and evidence
## System map
## Key flows and contracts
## Implementation patterns
## Adding or changing a feature
## Known gaps and unknowns
```

Include only sections supported by the inspected system. Link source files near the claims they support. Keep examples short and taken from the repository.

## Important Principles

- Describe the implemented architecture before suggesting improvements.
- Adjust depth to the project and request; do not generate a fixed catalogue of frameworks or empty sections.
- Existing documentation is evidence of intent; code and configuration establish current behavior when they differ.
- Preserve the user's requested format and scope.

## Halt Conditions

- If the repository or essential source files are unavailable, ask for access or a source archive before making architecture claims.
- If a consequential boundary cannot be resolved from available evidence, mark it unknown and ask a focused question only when the answer is necessary to complete the requested scope.
- Stop before destructive or externally mutating actions outside the user's authorization.

## Skill Verification

For a realistic existing-repository request, check that the agent traces a real flow, cites source files, separates observations from inference, and gives usable extension guidance. A repository containing only documentation should yield a documentation structure map, not invented runtime or service architecture.

Adapted from [GitHub's architecture blueprint generator](https://github.com/github/awesome-copilot/blob/main/skills/architecture-blueprint-generator/SKILL.md).
