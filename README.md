# Lithos Icons

Open icons for finance: sectors, themes, countries and regions across the major classification standards. Outline and solid, drawn at 16/20/24/32/48 with less detail as they shrink, adjustable stroke. MIT.

Site (coming): icons.lithos.design

## Status
Pilot (M1). See [SPEC.md](SPEC.md).

## Develop
```
npm install
npm run all        # build SVGs, validate, render previews/pilot.png
```

- Concepts are drawn in `src/concepts/*.mjs` using the per-size kit in `scripts/lib/kit.mjs`.
- `npm run build` writes `icons/<id>/<style>-<size>.svg` and `data/concepts/<id>.json`.
- `npm run validate` checks every SVG (structure, stroke, ink inside live area).

## Using the icons
Outline icons keep live strokes, so you can change stroke width in CSS:

```css
.li-outline { stroke-width: var(--li-stroke, 1.5); }
```

Solid icons use a baked stroke to match the outline footprint — don't override their stroke width.

## Licence
Icons and code: MIT. Classification data: per standard, see SPEC.md §3. GICS and Fitch Ratings data are included by permission for non-commercial use only and are not MIT. Other proprietary standards are not published.
