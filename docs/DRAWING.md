# Drawing an icon

Read this before writing or changing any `draw()` function. `SPEC.md` §6 has the design rules; this is the how.

## Where code goes

- Agent-made icons: one file per concept at `src/agent/<id>.mjs`, `export default { ...concept }`. Then run `node scripts/agent-index.mjs`.
- Hand-made icons live in `src/concepts/*.mjs` (arrays of concepts). Good worked examples: `src/concepts/roadmap2.mjs`, `roadmap3.mjs`.

```js
import { KEY } from '../../scripts/lib/kit.mjs';
import { pick, quadPts, circlePts } from '../lib/shapes.mjs';

export default {
  id: 'waste-management',            // kebab-case, permanent
  name: 'Waste Management',
  kind: 'industry',                  // sector | industry | asset-class | theme
  parent: 'industrials',             // an existing concept id (omit for sector, asset-class)
  metaphor: 'bin',                   // one picture, registered in data/metaphors.json
  keywords: ['waste', 'recycling', 'sanitation'],
  reduction: '16: one rib. 20+: two ribs.',   // what changes by size, in plain words
  draw(k) {
    // return { outline: [pathD, ...], solid: [{ d: pathD, fill: true|false }, ...] }
  },
};
```

## Coordinates

You draw in the live area, `0..1` on both axes, y down. `(0,0)` is top-left, `(1,1)` bottom-right. The kit converts to pixels for the size being built and adds the padding. Strokes are centred on the path, so a line at `x = 0` puts half its stroke in the padding; that is allowed.

Sizes are 16, 20, 24, 32, 48. `k.tier` is 0–4 for those sizes. `pick(k, [a, b, c, d, e])` returns the value for the current size. **Every size is drawn separately**: use `k.tier` to drop detail at small sizes. Never rely on scaling.

Useful numbers: `k.L` is the live area in px (14, 18, 20, 28, 42). `k.sw` is the stroke in px (1.25, 1.5, 1.75, 2.25, 3). So at 16px one stroke is 0.09 of the width; at 24px it is 0.0875.

Keylines (use them so shapes carry equal weight): circle `0..1`, square `0.08..0.92`, portrait `0.12..0.88` wide and full height, landscape full width and `0.12..0.88` high. Standard corner radius `KEY.radius` (0.14).

## The kit (`k`)

| Call | Returns |
|---|---|
| `k.path([['M',x,y],['L',x,y],['H',x],['V',y],['Q',cx,cy,x,y],['C',…],['A',rx,ry,rot,large,sweep,x,y],['Z']], { snap: false })` | path data. Snaps to a quarter pixel unless `snap: false`; use `snap: false` for diagonals and curves. |
| `k.rrect(x0, y0, x1, y1, r)` | rounded rectangle |
| `k.circle(cx, cy, r)` | circle |
| `k.poly(points, { closed: true, snap: true })` | polygon or, with `closed: false`, a polyline |
| `k.capsule(x1, y1, x2, y2, widthPx)` | a pill between two points, width in **px**. Used as a knockout in solid shapes. |
| `k.offsetLine(points, halfWidthPx)` | a polyline turned into a closed shape with round ends |
| `k.offsetLines([points, …], halfWidthPx)` | same for several lines, merged where they cross |
| `k.offsetPoly(points, deltaPx)` | a polygon grown by `deltaPx` |
| `k.ring(points)`, `k.fat(points, halfWidthPx)` | shapes for `k.bool` |
| `k.bool(addShapes, subtractShapes)` | union of the first list minus the second, as one path. Use it to make **one clean silhouette** from overlapping parts. |
| `k.holeW(visualPx)` | the path width a knockout needs to *look* `visualPx` wide in solid style |
| `k.holeN(visualPx)` | the same, normalized |
| `k.gapN(px = 1.5)` | normalized distance between two stroke centres that leaves `px` of clear space |
| `k.grow` | half a stroke, normalized |
| `k.solid`, `k.tier`, `k.sw`, `k.L` | style flag and the numbers above |

Shape helpers in `src/lib/shapes.mjs`: `pick`, `quadPts(p0, ctrl, p1, n)` and `circlePts(cx, cy, r, n)` (sample curves into points for `k.bool`), `arc(cx, cy, r, a0, a1)`, `dropPts`, `flame`, `gearPts`, `plusPts`.

## Outline style

`outline` is a list of path strings. They are stroked with round caps and joins, never filled. Open paths are fine.

- Two strokes need clear space between them: a closed shape must be at least `2 × stroke + 1px` across or it clogs. At 16px that is 3.5px, a quarter of the icon. If a detail can't meet that at 16 or 20, drop it at those tiers.
- Overlapping parts look like a wireframe. Build one silhouette with `k.bool([...])` instead and stroke that.
- A dot is a very short line: `k.path([['M', x - 0.004, y], ['H', x + 0.004]], { snap: false })`.

## Solid style

`solid` is a list of `{ d, fill }`. `fill: true` paints the shape **and** strokes its edge in the same colour, so the solid icon has the same footprint as the outline one. `fill: false` is a plain stroke (use it for thin parts: stems, handles, ground lines).

- Fills use the even-odd rule: append a knockout path to `d` to cut a hole. A knockout must lie fully inside the shape.
- Because the edge is stroked, a hole shrinks by one stroke. Size holes with `k.holeW(px)` (capsules, offset lines) or `k.holeN(px)` (circle diameter): `k.circle(x, y, k.holeN(1.5) / 2)`.
- Two filled shapes that should stay separate need their edges `k.gapN(1)` apart, or they fuse.
- A cut that must reach the edge of a shape (to split it in two) needs `k.bool([shape], [k.fat(line, k.holeW(px) / 2)])`.
- Several knockouts close together merge into a blob. Use fewer, wider-spaced ones in solid than lines in outline.

## Process

1. Read `data/research/<id>.json` for how people already draw the idea. It is reference only: never copy a specific icon.
2. Check `data/metaphors.json`. The picture must not already be used by another concept, and must not be a near-copy of the parent's.
3. Write the 24px drawing first, then decide what to drop at 16 and 20 and what to add at 32 and 48.
4. `node scripts/agent-index.mjs && npm run build && npm run validate`. Zero errors is required. Weight warnings are advice.
5. `node scripts/preview.mjs <id> agent-<id>` then **look at** `previews/agent-<id>.png`. Check 16px first. Ask: without the label, what would someone call this? Fix and repeat.
6. Compare with neighbours: `node scripts/preview.mjs <id>,<parent>,<two siblings> agent-<id>-near`.

## What goes wrong most

- The 16px outline is a clogged blob. Remove a part; do not shrink it.
- The solid version is an unreadable lump because the knockouts are too thin or too many.
- The picture reads as something else (a coin stack that looks like a database; a turbine that looks like a plane). Change the silhouette, not the details.
- Thin, light icons (a few lines) look weak beside the set. Give the main part a closed shape.
- Text, letters, currency symbols, logos or brand marks: never.
