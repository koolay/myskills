# Directory Index

## Files

- **[AGENTS.md](./AGENTS.md)** - Agent instructions for working in this repository
- **[NAMING.md](./NAMING.md)** - Skill naming rules and categories
- **[README](./README)** - Personal skills collection overview
- **[SKILL_TEMPLATE.md](./SKILL_TEMPLATE.md)** - New skill scaffold template
- **[evals/evals.json](./evals/evals.json)** - Pressure scenarios for skill validation

## Research Notes

- **[research/ai-native-project-structure.md](./research/ai-native-project-structure.md)** - Primary-source findings for AI-native project structure, bootstrap, and plan-first modernization
- **[research/maple-local-mode.md](./research/maple-local-mode.md)** - Primary-source findings for Maple Local observability and CLI behavior
- **[research/smolvm.md](./research/smolvm.md)** - smolvm local Linux verification research

## Plans

- **[docs/plans/ko-kb-html-red-green-validation.md](./docs/plans/ko-kb-html-red-green-validation.md)** - HTML companion validation plan

## Subdirectories

### ko-cq-agent-guidelines/

- **[README.md](./ko-cq-agent-guidelines/README.md)** - Usage guide, examples, inputs, outputs, and boundaries
- **[SKILL.md](./ko-cq-agent-guidelines/SKILL.md)** - Top-level coding-agent guidelines for judgment, scope, verification, and communication
- **[evals/evals.json](./ko-cq-agent-guidelines/evals/evals.json)** - Pressure scenarios for the coding-agent guidelines
- **[references/maintenance.md](./ko-cq-agent-guidelines/references/maintenance.md)** - On-demand source mapping, adaptations, and verification guidance

### ko-cq-review/

- **[README.md](./ko-cq-review/README.md)** - Usage guide, examples, inputs, outputs, and boundaries
- **[SKILL.md](./ko-cq-review/SKILL.md)** - Multi-lens, five-axis code review with independent context, evidence-based triage, dependency checks, and fix verification
- **[evals/evals.json](./ko-cq-review/evals/evals.json)** - Pressure scenarios for code review skill validation

### ko-dx-linux-verify/

- **[README.md](./ko-dx-linux-verify/README.md)** - Usage guide, examples, inputs, outputs, and boundaries
- **[SKILL.md](./ko-dx-linux-verify/SKILL.md)** - macOS 上使用本地 smolvm 验证 Linux-only 行为
- **[evals/evals.json](./ko-dx-linux-verify/evals/evals.json)** - Linux 验证 skill 压力场景

### ko-dx-maple-observe/

- **[README.md](./ko-dx-maple-observe/README.md)** - Usage guide, examples, inputs, outputs, and boundaries
- **[SKILL.md](./ko-dx-maple-observe/SKILL.md)** - Use existing Maple Local logs, traces, and metrics for local service diagnosis
- **[evals/evals.json](./ko-dx-maple-observe/evals/evals.json)** - Maple observability skill pressure scenarios

### ko-dx-rca/

- **[README.md](./ko-dx-rca/README.md)** - Usage guide, examples, inputs, outputs, and boundaries
- **[SKILL.md](./ko-dx-rca/SKILL.md)** - Structured root cause analysis workflow

### ko-kb-architecture-blueprint/

- **[README.md](./ko-kb-architecture-blueprint/README.md)** - Usage guide, examples, inputs, outputs, and boundaries
- **[SKILL.md](./ko-kb-architecture-blueprint/SKILL.md)** - Evidence-based map of an existing codebase's architecture, flows, and extension patterns

### ko-kb-html/

- **[README.md](./ko-kb-html/README.md)** - Usage guide, examples, inputs, outputs, and boundaries
- **[SKILL.md](./ko-kb-html/SKILL.md)** - Self-contained HTML companion workflow for substantial agent-written documents
- **[evals/evals.json](./ko-kb-html/evals/evals.json)** - HTML companion pressure scenarios
- **[references/html-quality-targets.md](./ko-kb-html/references/html-quality-targets.md)** - Document-type HTML quality targets
- **[references/md-to-html-companion-implementation.md](./ko-kb-html/references/md-to-html-companion-implementation.md)** - Reproducible Markdown-to-HTML implementation guidance
- **[references/mermaid-interaction-pattern.md](./ko-kb-html/references/mermaid-interaction-pattern.md)** - Mermaid rendering, zoom, pan, and fullscreen behavior
- **[templates/markdown-html-companion-generator.mjs](./ko-kb-html/templates/markdown-html-companion-generator.mjs)** - Reusable Markdown HTML companion generator template

### ko-kb-site-docs/

- **[README.md](./ko-kb-site-docs/README.md)** - Usage guide, examples, inputs, outputs, and boundaries
- **[SKILL.md](./ko-kb-site-docs/SKILL.md)** - Project documentation site generation and refactoring workflow
- **[evals/evals.json](./ko-kb-site-docs/evals/evals.json)** - Site docs skill validation scenarios
- **[references/vitepress-mermaid.md](./ko-kb-site-docs/references/vitepress-mermaid.md)** - VitePress Mermaid rendering reference pattern

### ko-sd-architect/

- **[README.md](./ko-sd-architect/README.md)** - Usage guide, examples, inputs, outputs, and boundaries
- **[SKILL.md](./ko-sd-architect/SKILL.md)** - Evidence-based architecture decisions, contract protection, bounded implementation slices, and composition checks
- **[evals/evals.json](./ko-sd-architect/evals/evals.json)** - Architecture decision pressure scenarios
- **[references/architecture-output.md](./ko-sd-architect/references/architecture-output.md)** - Tailored architecture document content, views, quality scenarios, decisions, and completion review
- **[references/maintenance.md](./ko-sd-architect/references/maintenance.md)** - Source mapping, independent adaptations, and manual scenario results
- **[references/migrations.md](./ko-sd-architect/references/migrations.md)** - Conditional compatibility, rollout, and data recovery rules

### ko-sd-project-harness/

- **[README.md](./ko-sd-project-harness/README.md)** - Usage guide, examples, inputs, outputs, and boundaries
- **[SKILL.md](./ko-sd-project-harness/SKILL.md)** - Empty-project bootstrap and plan-first AI-native engineering workflow
- **[evals/evals.json](./ko-sd-project-harness/evals/evals.json)** - Startup bootstrap and non-empty repository pressure scenarios

### ko-streaming-ux-acceptance/

- **[README.md](./ko-streaming-ux-acceptance/README.md)** - Usage guide, examples, inputs, outputs, and boundaries
- **[SKILL.md](./ko-streaming-ux-acceptance/SKILL.md)** - Streaming cadence, visible DOM timing, protocol integrity, and terminal/error acceptance
- **[evals/evals.json](./ko-streaming-ux-acceptance/evals/evals.json)** - Streaming UX acceptance pressure scenarios

### ko-ux-innovative-design/

- **[README.md](./ko-ux-innovative-design/README.md)** - Usage guide, examples, inputs, outputs, and boundaries
- **[SKILL.md](./ko-ux-innovative-design/SKILL.md)** - Subject-derived typography exploration, human visual judgement, explicit lock, and concrete production
- **[LICENSE](./ko-ux-innovative-design/LICENSE)** - Upstream MIT license notice
- **[evals/evals.json](./ko-ux-innovative-design/evals/evals.json)** - Creative isolation, selection, production, and scope pressure scenarios
- **[references/maintenance.md](./ko-ux-innovative-design/references/maintenance.md)** - Source mapping, local adaptations, and verification guidance

### ko-ux-agent-design/

- **[README.md](./ko-ux-agent-design/README.md)** - 使用示例、边界、来源适配与人工走查记录
- **[SKILL.md](./ko-ux-agent-design/SKILL.md)** - AI Agent 持续协作、记忆契约、授权行动与恢复体验设计
- **[evals/evals.json](./ko-ux-agent-design/evals/evals.json)** - 跨会话、权限、遗忘与触发边界压力场景
