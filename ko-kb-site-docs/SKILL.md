---
name: ko-kb-site-docs
description: "Use when creating, restructuring, or repairing a project documentation site for users, developers, operators, or internal teams; especially when docs need navigation, page hierarchy, generated reference pages, diagrams, search, deployable static output, or broken-link/build verification."
---

# Project Site Docs

**Goal:** Generate or refactor a project documentation site that is navigable, maintainable, and publish-ready. Framework choice is secondary; information architecture is the product.

**Do not use when:** The task is a one-off Markdown note, standalone HTML companion, or prose edit without site structure. For self-contained offline HTML companions, use `ko-kb-html`.

## Inputs

- **source_material** - Existing docs, README, code structure, API schemas, examples, product notes, or outline.
- **audience** - Required or inferred: new users, contributors, API consumers, operators, support, decision makers.
- **site_target** (optional) - VitePress, Docusaurus, Nextra, plain static HTML, GitHub Pages, Vercel, internal portal.
- **scope** (optional) - Default: smallest coherent docs site satisfying the request.

## Execution

1. Identify audience and the job the docs must do.
2. Define the minimum useful page set before choosing a framework.
3. Separate content types: start-here, task guides, reference, operations, architecture/decisions, contributing.
4. HALT and ask one concise question if audience, publishing target, or source material is missing and guessing would create the wrong site.

### Navigation First

Create a page inventory with stable lowercase slugs. Group pages by user task, not repo folder accident. Preserve public URLs unless the user approves redirects or breaking route changes. Make important pages reachable from homepage, nav, sidebar, or section index pages. Put generated reference under `reference/`, `api/`, or `cli/`.

### Choose Implementation Path

| Situation | Preferred path |
| --- | --- |
| Existing docs framework | Preserve it; update config and pages in-place |
| VitePress requested/present | Use `.vitepress/config.*`, `layout: home`, nav/sidebar, Markdown-first pages |
| React-heavy docs already present | Fit Nextra/Docusaurus conventions if the project uses them |
| API/reference-first docs | Generate reference from source where practical, then add hand-written guides |
| Lightweight internal docs | Plain Markdown/static HTML is acceptable when search/build/deploy needs are minimal |

Do not add a docs framework just because this skill names one. Prefer the project's existing stack unless it blocks the docs goal.

### Content and Config

For each page:

1. Put the user goal in the first screen.
2. List prerequisites before commands.
3. Keep commands copy-pasteable and state repo-root assumptions.
4. Link guides to the next likely page.
5. Use diagrams only when they reduce explanation cost; keep diagram source versioned and rendered in the site preview.
6. Do not leave Mermaid as a visible fenced code block unless the user explicitly asks for source-only docs.
7. Mark generated content and document the regeneration command.

Configure the framework equivalents for title, description, language, base path, clean URLs, last-updated metadata, homepage, nav, sidebar, search, Markdown extensions, diagram rendering, anchors, and broken-link behavior.

For VitePress Mermaid rendering, use `references/vitepress-mermaid.md`. The acceptance criterion is rendered SVG/diagram output in build/preview, not a visible `mermaid` code block.

## Quick Reference

| Need | Action |
| --- | --- |
| New docs site | Inventory pages, choose target, scaffold smallest coherent site |
| Existing messy docs | Preserve URLs, regroup nav/sidebar, add missing index pages |
| VitePress site | Update `.vitepress/config.*`, homepage frontmatter, nav/sidebar, build scripts |
| Generated reference | Put under stable section, document generator, link from guides |
| Mermaid diagrams | Configure renderer, then verify preview shows rendered diagrams |
| Broken links | Check case, anchors, base path, clean URL behavior, generated routes |
| Publish readiness | Run build, preview locally, verify homepage, diagrams, and critical routes |

## Skill Verification Scenarios

| Scenario | Baseline failure to catch | Expected behavior |
| --- | --- | --- |
| "Generate docs for this repo" | Pages dumped into `docs/` with no audience/nav plan | Define audience, inventory, nav, and verification first |
| "Make a VitePress docs site" | VitePress config treated as the whole task | Design docs IA, then implement VitePress conventions |
| "Add API docs" | Disconnected reference pages | Link generated reference from guides and document regeneration |
| "Add architecture diagrams" | Mermaid appears as code blocks | Configure rendering and verify diagrams visually |
| "Fix docs build" | Only the failing link is patched | Check route casing, base path, generated pages, nav/sidebar, and preview |

## Output Format

- Changed file paths and one-line purpose for each.
- Site structure summary: audience, sections, important routes.
- Build/preview commands run, with pass/fail result and diagram rendering status when diagrams exist.
- Known gaps: missing source material, unpublished routes, unverified external links, or route compatibility risks.

## Principles

- Information architecture first; framework second.
- Public routes are product surface area.
- A docs site is incomplete until navigation and verification work.
- Generated reference docs need a regeneration command and a human-written path into them.
- Prefer incremental repair over full rewrites when an existing docs site has users.

## Halt Conditions

- HALT if the site would publish secrets, private customer data, credentials, or internal-only operational details to a public path.
- HALT if the user asks to replace public docs but route compatibility or redirects are unspecified.
- HALT if the source of truth is ambiguous between generated files and hand-edited files.
- HALT before destructive deletion of existing docs unless the user explicitly approves the exact scope.
