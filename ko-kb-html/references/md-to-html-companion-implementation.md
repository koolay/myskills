# Markdown To HTML Companion Implementation Pattern

Use this pattern after reading `html-quality-targets.md`, especially for substantial Markdown with Mermaid, tables, architecture boundaries, flows, or review findings.

## What The Reference Implementation Did

The `galaxy-platform-environment-inspection-technical-design.md` companion used a project-local generator rather than hand-written HTML:

- Read Markdown as the source of truth.
- Strip YAML frontmatter before rendering.
- Collect headings and build a TOC with stable slug IDs.
- Convert Markdown with the project-installed `marked` package.
- Detect Mermaid code fences and render them at build time.
- Use the project-installed `mermaid` runtime in a temporary Playwright page when direct Node rendering has no DOM.
- Embed rendered SVG inline in the final HTML.
- Preserve Mermaid source in adjacent collapsed `<details>`.
- Wrap tables in scroll containers.
- Add first-viewport architecture summary cards: current implementation, target design, forbidden paths.
- Add native JavaScript controls for zoom, fit, reset, download, fullscreen, wheel zoom, and drag pan.
- Verify in a browser at desktop and mobile widths.
- Re-run the generator and compare hashes to confirm idempotence.

## Decision Tree

1. **One short linear doc, no diagrams/tables:** hand-authored HTML may be enough, but skip HTML if it adds little value.
2. **Long doc or likely regeneration:** create a project-local generator.
3. **Markdown has Mermaid and project has `mermaid`:** render SVG at build time and embed inline.
4. **`mermaid.render()` fails with `document is not defined`:** use existing Playwright as a build-time DOM host; do not add `jsdom` unless Playwright is unavailable and the user approves.
5. **No Mermaid package installed:** ask before adding dependencies; otherwise preserve source and use lightweight static fallback only if faithful.
6. **Existing project generator exists:** patch the generator and regenerate; do not hand-patch generated HTML.

## Generator Shape

Keep the generator small and explicit:

- `sourcePath`: the Markdown source.
- `outputPath`: sibling `.html`.
- `stripFrontmatter(source)`.
- `collectHeadings(source)` and stable `slug(title)`.
- `collectMermaidBlocks(source, headings)`.
- `renderMermaidSvg(sources)` using project `mermaid` and existing browser automation when needed.
- `renderDiagramFigure(index, diagram, svg)`.
- `injectHeadingIds(html, headings)`.
- `wrapTables(html)`.
- `getCss()` and `getJs()` as generator-owned assets.
- `writeFileSync(outputPath, html)`.

Use `templates/markdown-html-companion-generator.mjs` as a starting skeleton when no suitable project generator exists.

## Runtime HTML Contract

The final HTML should be self-contained:

- No CDN, remote fonts, trackers, external images, or runtime Mermaid script.
- Exactly one small inline script is acceptable for progressive interaction.
- Inline CSS only.
- Inline SVG diagrams.
- Markdown source remains separate and authoritative.
- Generated HTML can be deleted and recreated from the generator.

## Architecture Companion Layout

For architecture docs, avoid a generic article wrapper. Use this first-viewport structure:

- Document identity, status, date, and scope.
- Metric cards for diagram count, table/model count, modes, services, or risk areas.
- Three concise panels:
  - Current implementation
  - Target design / planned work
  - Forbidden paths / invariants
- Desktop-first reading layout with sticky left TOC.
- Left TOC is collapsible on desktop. Collapsed mode keeps a slim rail and expands the main content column.
- Persist nav collapse state in `localStorage` when appropriate; default to expanded for first-time desktop readers.
- On mobile, content/hero must appear before the long TOC.

Then render the full Markdown body with anchors, wrapped tables, and interactive diagrams.

## Diagram DOM Contract

Use this structure:

```html
<figure class="doc-figure diagram" data-diagram-zoomable="true">
  <figcaption><span>Diagram title</span><small>diagram type</small></figcaption>
  <div class="diagram-shell">
    <div class="diagram-viewport">
      <div class="diagram-svg"><svg>...</svg></div>
    </div>
    <div class="diagram-toolbar">...</div>
  </div>
  <details class="diagram-source"><summary>Mermaid source</summary>...</details>
</figure>
```

Rules:

- Toolbar is a sibling of `.diagram-viewport`, not inside `.diagram-svg`.
- `.diagram-viewport` uses `overflow: hidden`.
- Zoom changes the SVG CSS width from its natural width.
- Pan changes `.diagram-svg { transform: translate3d(...) }`.
- Fullscreen moves the figure into a fixed overlay panel and restores it on close.
- The diagram board stays light in normal and fullscreen modes.

## CSS Notes

Use system fonts. A good default architecture palette is:

- Background: light neutral gradient or plain `#f5f7fb`.
- Panel: `#ffffff`.
- Ink: `#102033`.
- Border: `#dbe4ef`.
- Accent blue: `#2563eb`.
- Success green: `#16803c`.
- Warning amber: `#b45309`.

Do not over-index on a single hue. Keep cards compact and radius moderate. Use table wrappers with horizontal scrolling inside the wrapper only, not the page.

Mobile rules:

- Single column.
- Hero before TOC when TOC is long.
- Navigation may become a lower-page section, a collapsed panel, or a compact rail; it must not occupy the first mobile viewport.
- No document horizontal overflow.
- Diagram toolbar wraps and remains reachable.

## Browser Verification

When browser tooling is available, run checks equivalent to:

- Page title exists.
- Expected SVG count equals Mermaid block count.
- Expected Mermaid source details count equals Mermaid block count.
- No `_favorite` or other frontmatter is visible.
- No horizontal overflow on desktop or mobile.
- Zoom label changes after clicking zoom.
- Fullscreen layer opens, board is light, and closes cleanly.
- Mobile first viewport shows the document identity, not only a long TOC.
- Desktop nav collapse toggles without layout breakage; main content expands and diagrams remain usable.
- Re-run generator and compare file hash for idempotence.

Record the checks in the final response.

## Common Fixes

- **Frontmatter visible:** strip YAML frontmatter before Markdown conversion.
- **Mobile starts with long TOC:** reorder layout with CSS so main content appears before nav.
- **Mermaid render fails in Node:** render in a temporary Playwright page with project `mermaid.min.js`.
- **Generated HTML loads external URLs:** scan for `https?://`; SVG namespace URLs are acceptable.
- **Zoom blurry:** resize inline SVG width instead of transform-scaling a compressed layer.
- **Fullscreen background leaks:** use a fixed overlay with an opaque/semi-opaque backdrop and a light board.
- **Idempotence fails:** remove time-varying IDs or stabilize Mermaid render IDs.
