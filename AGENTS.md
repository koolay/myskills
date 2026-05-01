# AGENTS.md

## Project Overview

This repository is a personal collection of reusable AI coding-agent skills for Codex and Claude Code. It is a documentation-first repository: each skill is stored as Markdown, with `SKILL.md` as the executable instruction file for that skill.

Key files:

- `README` - human-facing overview and usage notes.
- `NAMING.md` - required naming convention for every skill.
- `SKILL_TEMPLATE.md` - starting template for new skills.
- `index.md` - directory index; update it when adding, renaming, or removing skills.
- `ko-*/SKILL.md` - individual skill definitions.

There is currently no application runtime, package manager manifest, automated test suite, build system, or deployment pipeline.

## Repository Structure

```text
myskills/
|-- AGENTS.md
|-- README
|-- NAMING.md
|-- SKILL_TEMPLATE.md
|-- index.md
`-- ko-{category}-{function}/
    `-- SKILL.md
```

## Setup Commands

No install step is required. Work directly with the Markdown files.

Useful inspection commands:

- List files: `rg --files`
- Find skill names: `rg '^name:' -g 'SKILL.md'`
- Search docs: `rg '<term>'`
- Check current changes: `git status --short`

## Development Workflow

When adding a new skill:

1. Read `NAMING.md` first.
2. Create a directory using the required `ko-{category}-{function}` format.
3. Copy `SKILL_TEMPLATE.md` into the new directory as `SKILL.md`.
4. Set the frontmatter `name` to exactly match the directory name.
5. Write a one-line `description` that starts with `Use when...` and states triggers only.
6. Update `README` and `index.md` with the new skill.
7. Validate the skill with at least one realistic usage or pressure scenario before deploying it.

Example:

```bash
mkdir ko-dx-debug
cp SKILL_TEMPLATE.md ko-dx-debug/SKILL.md
```

When editing an existing skill:

- Keep the YAML frontmatter at the top of `SKILL.md`.
- Preserve the `name` unless the directory is also renamed.
- Make the trigger conditions in `description` specific enough that an agent can decide when to use the skill, but do not summarize the workflow there.
- Keep instructions actionable and ordered; prefer concrete phases, halt conditions, and output formats.
- Update `README` and `index.md` if the public description, category, or file structure changes.

## Naming Rules

All skill directories must follow:

```text
ko-{category}-{function}
```

Rules:

- `ko` is fixed.
- Category must be one of the registered two-letter prefixes in `NAMING.md`.
- Function name should be one or two lowercase kebab-case words.
- Directory name and `SKILL.md` frontmatter `name` must match exactly.

Before adding a new category, update the category table in `NAMING.md`.

## Testing Instructions

There is no automated test command for this repository. Validate changes by inspection:

```bash
rg '^---$|^name:|^description:' -g 'SKILL.md'
rg --files
git diff --check
```

For each changed `SKILL.md`, verify:

- Frontmatter starts and ends with `---`.
- `name` matches the parent directory.
- `description` is a concise trigger-oriented sentence.
- Required sections are coherent for the skill: goal, inputs, execution steps, output format, principles, and halt conditions.
- Markdown links and relative paths resolve from the repository root or the skill directory, as appropriate.

For new skills or meaningful behavior changes, also run a small skill test:

1. Define a realistic scenario that should trigger the skill.
2. Note the likely baseline failure without the skill, or run it in a separate agent if practical.
3. Apply the skill and verify the agent follows the intended decision rules.
4. Tighten the skill if the agent skips a step, over-applies it, or finds a loophole.

## Code Style

This repository is mostly Markdown. Follow these conventions:

- Use standard Markdown headings with one top-level `#` per document.
- Use fenced code blocks with language tags when helpful, especially `bash`, `markdown`, and `text`.
- Keep commands copy-pasteable.
- Prefer ASCII punctuation unless editing existing Chinese prose or another section that already uses non-ASCII text.
- Preserve bilingual context where it already exists; do not translate existing Chinese documentation unless requested.
- Avoid vague agent instructions such as "handle appropriately"; state the exact action or decision rule.

## Build and Deployment

There is no build or deploy process. Skills are consumed by copying or referencing the relevant `SKILL.md` content from this repository.

Claude Code usage is documented in `README`:

```bash
claude mcp add-skill /path/to/myskills/ko-dx-rca
```

Codex usage is currently documented as copying `SKILL.md` content into agent instructions or referencing it through project configuration.

## Pull Request Guidelines

Before committing:

- Run `git diff --check`.
- Review `git diff` for accidental formatting churn.
- Confirm `README`, `NAMING.md`, and `index.md` still agree with the skill directories.
- For new skills, confirm the naming checklist in `NAMING.md`.

Commit messages in the existing history use concise conventional-style messages where useful, for example `init: personal dev skills collection with rca skill`.

## Security Considerations

- Do not add secrets, credentials, API keys, private tokens, or machine-specific paths beyond documented examples.
- Skills should not instruct agents to run destructive commands without explicit confirmation and clear scope.
- If a skill includes commands that modify files or external systems, include halt conditions and verification steps.

## Maintenance Notes

- Treat `SKILL_TEMPLATE.md` as the source of truth for new skill shape.
- Treat `NAMING.md` as the source of truth for naming and category policy.
- Keep `index.md` synchronized with the actual file tree.
- If automated tests, linting, packaging, or CI are added later, update this file with exact commands.
