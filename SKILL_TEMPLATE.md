---
name: ko-{category}-{function}
description: "Use when [specific user intent, task type, symptom, or repo signal should trigger this skill]."
---

<!--
Project rules pinned for every skill:

1. Directory name MUST follow ko-{category}-{function}; see NAMING.md.
2. Frontmatter name MUST exactly match the parent directory.
3. Category MUST be registered in NAMING.md before use.
4. Description MUST start with "Use when..." and describe triggers only, not workflow.
5. New or changed skills MUST be tested with at least one pressure/usage scenario before deployment.
6. Keep instructions actionable: concrete inputs, ordered execution, output format, principles, and halt conditions.
7. Update README and index.md when adding, renaming, or removing a skill.
-->

# Skill Name

**Goal:** State what this skill achieves in one or two sentences.

**Use when:** List the concrete user requests, keywords, task types, or repo signals that should trigger this skill.

**Do not use when:** List nearby cases where another skill or normal execution is more appropriate.

## Inputs

- **primary_input** - Required. Describe the main user request or artifact.
- **context** (optional) - Relevant files, errors, constraints, links, or prior decisions.
- **scope** (optional) - Boundaries for the work. State the default if omitted.

## Execution

Follow these phases in order. Read relevant project files before making claims.

### Phase 1: ...

1. Step one
2. Step two

### Phase 2: ...

1. Step one
2. Step two

## Skill Verification

Before deploying this skill, test it like process TDD:

1. **RED:** Run at least one realistic scenario without this skill and record the failure, gap, or rationalization.
2. **GREEN:** Run the same scenario with this skill available and verify the agent follows it.
3. **REFACTOR:** If the agent finds a loophole, update the skill and re-run the scenario.

Record only the useful evidence in the PR, commit notes, or a short local test note. Do not add verbose session transcripts to the skill unless they teach a reusable rule.

## Output Format

Describe the exact structure the agent should return or produce. Prefer a Markdown template when the output must be consistent.

```markdown
# [Output Title]

## Findings / Result

- ...

## Next Steps

1. ...
```

## Important Principles

- Be specific. Prefer exact commands, file paths, and decision rules.
- Do not guess. If a claim depends on repository state, inspect the relevant files first.
- Keep the skill focused on one job. Split unrelated workflows into separate skills.
- Keep the description trigger-only. Do not summarize the workflow in frontmatter.
- Preserve user work. Do not instruct agents to revert unrelated changes.

## Halt Conditions

- HALT if required context is missing and a reasonable assumption would be risky - ask one concise clarification question.
- HALT if the task would require destructive operations without explicit user approval - explain the risk and wait.
- HALT if the requested work is outside this skill's scope - name the better skill or fallback workflow.

## Maintenance Checklist

Before considering the skill ready:

- [ ] Directory name follows `ko-{category}-{function}`.
- [ ] `name` matches the directory exactly.
- [ ] `description` starts with "Use when..." and contains triggers only.
- [ ] Execution steps are ordered and actionable.
- [ ] Output format is concrete enough for another agent to follow.
- [ ] Halt conditions cover missing context and unsafe operations.
- [ ] At least one RED/GREEN skill scenario was run or explicitly deferred with rationale.
- [ ] `README` and `index.md` are updated if this is a new or renamed skill.
