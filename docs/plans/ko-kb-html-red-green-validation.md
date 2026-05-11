# ko-kb-html Red/Green Validation Plan

## Goal

Verify that `ko-kb-html` reliably triggers for substantial docs and produces document-type-specific HTML quality for plans, architecture docs, PRDs, prototypes, and reviews.

## Scenarios

1. Baseline agent without the skill on a long architecture/PRD/prototype task.
2. Agent with the skill on the same task.
3. Tiny-answer control case that should not produce HTML.
4. Sensitive-data control case that should halt before public HTML output.

## Success Criteria

- Baseline misses or under-specifies HTML behavior in at least one substantial-document scenario.
- Skill-enabled runs produce a browsable HTML companion with document-type-specific structure.
- Control cases avoid over-triggering and unsafe output paths.

## Outputs

- Record baseline and skill-enabled outcomes.
- Patch the skill only if the tests expose a real gap.
- Commit and push verified changes to `main`.
