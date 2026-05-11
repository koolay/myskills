# Mermaid Interaction Pattern

Use this when building or repairing Mermaid support in generated static HTML.

## Goal

Match the useful behavior of framework renderers without adopting their runtime:

- Render Mermaid as inline SVG.
- Preserve the Mermaid source in a nearby collapsed details block.
- Provide zoom in, zoom out, reset, fit, download, fullscreen, wheel zoom, and drag pan when diagrams are large.
- Keep diagrams readable on a light board in both normal and fullscreen modes.
- Keep generated output offline and reproducible.

## Dependency Pattern

Prefer this order:

1. Existing project `mermaid` package for rendering.
2. Existing browser automation such as Playwright for build-time rendering and verification.
3. Native HTML/CSS/JS for all runtime interaction.

Avoid runtime Vue, VitePress, React, pan/zoom libraries, icon packs, CDNs, or Mermaid runtime scripts in every generated page unless the user explicitly asks for live client-side rendering.

## DOM Shape

Use a structure like this:

```html
<figure class="doc-figure diagram" data-diagram-zoomable="true">
  <figcaption>Mermaid diagram</figcaption>
  <div class="diagram-shell">
    <div class="diagram-viewport">
      <div class="diagram-svg">
        <svg>...</svg>
      </div>
    </div>
    <div class="diagram-toolbar">...</div>
  </div>
  <details class="diagram-source">...</details>
</figure>
```

The toolbar is a sibling of `.diagram-viewport`, not a child of `.diagram-svg`, so controls do not move when the diagram is panned.

## Sharp Zoom

Avoid `transform: scale(...)` on a fit-compressed SVG. Browsers may rasterize the compressed layer and the zoomed text becomes blurry.

Use this mental model instead:

- Store the SVG natural width from the `width` attribute, `viewBox`, or measured rect.
- Compute a `fitScale` from viewport width so 100% can mean "fits the current viewport".
- Set `svg.style.width = naturalWidth * fitScale * zoomScale`.
- Keep `svg.style.maxWidth = "none"` and `height = "auto"`.
- Use `transform: translate3d(x, y, 0)` only for pan offsets on the inner diagram layer.
- Keep the viewport `overflow: hidden` so zoom never creates document or container scrollbars.

This preserves vector sharpness while still behaving like a clipped pan/zoom canvas.

## Fullscreen

Fullscreen should isolate the diagram, not enlarge the whole document.

- Create a fixed `.diagram-dialog-layer` with a dark backdrop.
- Move the figure into a centered panel and restore it to the original parent and sibling on close.
- Add a body class such as `diagram-dialog-open`.
- Hide or fully mask all body children except the dialog layer; otherwise background headings and text can show through the SVG.
- Keep the fullscreen diagram board light, for example `#f8fafc`, so Mermaid edge labels and connector lines remain readable.
- Use `Escape` and backdrop click to close.

## Interaction Rules

- Use fixed scale steps such as `50, 75, 100, 125, 150, 175, 200, 250, 300`.
- Make wheel zoom call `preventDefault()` with a non-passive listener.
- Keep zoom centered near the pointer by adjusting pan offsets when scale changes.
- Drag should ignore buttons, links, summaries, form controls, and contenteditable elements.
- Reset should clear pan and return to 100%.
- Fit should be explicit; in a fit-baseline implementation it can reset to 100%.
- Download should serialize the inline SVG and save `diagram.svg`.
- On resize, recompute the fit scale for every zoomable figure.

## Verification Matrix

For each changed page, or at least one representative page per generated template:

| Check | Expected |
|---|---|
| Default render | Diagram visible, not raw Mermaid code |
| Source | Mermaid source remains available in collapsed details |
| Normal zoom buttons | Label updates and SVG size changes |
| Normal wheel zoom | Wheel changes scale without page scroll |
| Normal drag | Diagram pans; toolbar stays fixed |
| Normal sharpness | Text/lines remain crisp when zoomed |
| Normal overflow | No document horizontal scrollbar |
| Fullscreen open | Panel fills most viewport; page content behind is hidden or masked |
| Fullscreen board | Board stays light; lines and edge labels readable |
| Fullscreen wheel/drag | Same controls work in modal |
| Close | Escape/backdrop restores original DOM without duplicate layers |
| Mobile | No horizontal document overflow; toolbar remains reachable |
| Regeneration | Second generator run is unchanged or reports no regeneration |

## Failure Clues

- **Black fullscreen with invisible lines:** the SVG inherited or sits on a dark surface. Add a light board behind the SVG.
- **Background text appears over the diagram:** the backdrop is translucent or body children remain visible. Hide or fully mask non-dialog body children.
- **Zoom gets blurry only on the normal page:** the SVG was compressed to fit and then transform-scaled. Use natural-width SVG resizing.
- **Scrollbars appear after zoom:** the viewport is scrolling instead of clipping. Use `overflow: hidden` and pan with transform offsets.
- **Toolbar moves away or becomes unreachable:** toolbar is inside the transformed layer. Move it outside.
- **Generated pages regress later:** the fix was applied to generated HTML instead of the generator.
