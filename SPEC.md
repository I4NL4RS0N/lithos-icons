# Lithos Icons — Spec

Open icon set for finance: sectors, themes, countries and regions across the major classification standards. Outline + solid, optical sizes, adjustable stroke, MCP server. Modeled on iconmcp.com.

- **Site:** icons.lithos.design (Netlify)
- **Repo:** public, separate from the private Lithos repo
- **Licence:** icons MIT; data licences per standard (see §3)
- **Owner:** Ian Larson (personal project)

---

## 1. Decisions

| Area | Decision |
|---|---|
| Ownership | Personal side project |
| Icon licence | MIT |
| Styles | Outline + solid |
| Optical sizes | 16, 20, 24, 32, 48 — drawn separately, less detail as size drops |
| Stroke | User-adjustable within a per-size range |
| Visual style | Neutral / geometric (round caps & joins, consistent strokes) |
| Countries | 4:3 colour flag is default; map outline (outline/solid) is the alternative |
| Regions | Always maps with member countries filled |
| Disputed territories | User-selectable point of view |
| Agent review | Fully automated, with guardrails (§9) |
| Trending themes | Daily scan, auto-add |
| Launch formats | Website + SVG download, MCP + API, Figma library |
| Hosting | Netlify (site, API, MCP via Functions); agents in GitHub Actions |

## 2. Core principle

**Icons are concepts. Standards are lookup layers pointing at them.** GICS "Pharmaceuticals", ICB "Pharmaceuticals", and Moody's "Healthcare & Pharmaceuticals" are three nodes mapped to one concept, `pharma`. Only concepts get designed. Adding a standard is mostly mapping work.

## 3. Standards & licensing

Codes and names of proprietary standards are owned by their publishers. The icons are ours; the lists are not.

| Standard | Type | Owner | Ship publicly? |
|---|---|---|---|
| ISO 3166-1 / 3166-2 | Countries / subdivisions | ISO | Yes (codes widely used) |
| UN M49 | Regions | UNSD | Yes |
| NAICS | Industry | US/CA/MX gov | Yes (levels 2–4) |
| NACE | Industry | EU | Yes (sections, divisions, groups) |
| ISIC | Industry | UN | Yes (sections, divisions, groups) |
| SIC | Industry | US gov | Yes |
| GICS | Equity | MSCI / S&P DJI | **Published by permission**, non-commercial only (owner-confirmed 2026-11-13) |
| ICB | Equity | FTSE Russell | **Held** |
| BICS | Terminal | Bloomberg | **Held** |
| TRBC | Terminal | LSEG | **Held** |
| Fitch sectors | Credit | Fitch | **Published by permission**, non-commercial only (owner-confirmed 2026-11-13); 2020 list, partially reconstructed |
| Moody's sectors / CLO industries | Credit | Moody's | **Held** |
| S&P Ratings sectors | Credit | S&P | **Held** |

**Published by permission** means: the project owner has confirmed permission for non-commercial use. The scheme's names, codes and hierarchy are not MIT — each scheme file carries `licence: permission-noncommercial` and a credit line the site shows. If the project ever becomes commercial, or permission is withdrawn, set `publish: false` and remove the data. Built by `scripts/standards-licensed.mjs` from `standards-private/`.

**Held** means: mapping files live in a private `standards-private/` location (or are generated locally from a user's licensed data) and are not published until permission is granted. Icons for those concepts still ship — they're mapped to free standards and to search keywords.

**Bring-your-own mapping:** publish a mapping *template* format so licensed users can attach their own GICS/ICB/etc. codes to concept IDs locally.

**Before launch:** Ian checks Fitch's outside-activities / IP policy.

## 4. Data model

```
data/
  concepts/            one JSON per concept (the icon)
  schemes/             one JSON per standard version
  nodes/<scheme>/      code → concept mappings, one file per scheme
  geo/
    countries.json     ISO 3166-1 + metadata
    subdivisions/      ISO 3166-2 (US states first)
    m49.json           M49 hierarchy
    groupings/         membership-based groupings
    worldviews/        point-of-view variants
  themes/              trending themes
icons/
  <concept-id>/
    outline-16.svg … outline-48.svg
    solid-16.svg  … solid-48.svg
flags/
  <iso2>/4x3-16.svg … 4x3-48.svg
```

**Concept**
```json
{
  "id": "pharma",
  "name": "Pharmaceuticals",
  "kind": "sector",            // UI calls "theme" Topics; id stays theme. sector | asset-class | theme | country | region | grouping
  "keywords": ["drugs", "medicine", "biopharma", "pills"],
  "metaphor": "capsule",
  "status": "active",          // active | deprecated
  "replacedBy": null,
  "since": "0.1.0"
}
```

**Scheme**
```json
{
  "id": "naics",
  "name": "North American Industry Classification System",
  "version": "2022",
  "levels": ["sector", "subsector", "industry-group"],
  "licence": "public",
  "publish": true,
  "source": "https://www.census.gov/naics/"
}
```

**Node**
```json
{ "scheme": "naics@2022", "code": "3254", "name": "Pharmaceutical and Medicine Manufacturing",
  "level": "industry-group", "parent": "325", "concept": "pharma", "status": "active" }
```

**Grouping**
```json
{ "id": "fitch-developing-americas", "name": "Developing Americas", "source": "fitch",
  "version": "2026-11", "m49Private": 901, "members": ["AR", "BR", "CL", "..."], "publish": false }
```

**Theme**
```json
{ "id": "chip-shortage", "name": "Chip shortage", "concept": "theme-chip-shortage",
  "relatedConcepts": ["semiconductors", "autos"], "relatedGeo": ["TW", "KR"],
  "lifecycle": "emerging", "firstSeen": "2026-11-12", "signals": { "mentions7d": 0 } }
```

**Rules**
- Concept IDs are permanent. Never renamed, never deleted — deprecate with `replacedBy`.
- Retired codes in any scheme stay, `status: retired`, pointing to their successor.
- Cross-standard relations are derived from shared concepts and labelled **related**, not equivalent. Official concordances (e.g. NAICS↔ISIC) are stored separately and labelled **official**.

## 5. Geography

- **Countries:** ISO 3166-1 alpha-2 as primary key; alpha-3 and M49 numeric stored.
- **Subdivisions:** ISO 3166-2, starting with 50 US states + DC + territories (US public finance).
- **Regions:** UN M49 hierarchy (world → region → sub-region → intermediate). Note: Northern America is 021; North America (003) includes Central America and Caribbean. M49's developed/developing split was removed in Dec 2021.
- **Groupings:** membership lists with a source tag (EU, Eurozone, G7, G20, OECD, ASEAN, GCC, BRICS+, IMF, World Bank, MSCI, Fitch, …). Custom codes from the M49/ISO private-use range 900–999.
- **Classification tags (not icons):** MSCI Developed/Emerging/Frontier, World Bank income groups — used as filters.
- **Map source:** Natural Earth (public domain), including its point-of-view variants for disputed areas.
- **Generated, not drawn:** country outlines, region maps and grouping maps are generated from geodata, then simplified per size.
- **Coverage:** every geometry in Natural Earth 1:50m with an ISO code (234 countries and territories) and all 30 UN M49 regions including World. Not yet drawn: Antarctica, and areas without an ISO code (Kosovo, Somaliland, Northern Cyprus), which wait for the worldview work.
- **Names:** CLDR English names (`Intl.DisplayNames`); UN and Natural Earth names are kept as search keywords.
- **Projection:** azimuthal equal-area centred on each shape, so shapes are true and nothing breaks at the antimeridian or poles. Overrides: Europe (conic, clipped, Russia omitted from the outline but kept as a member), World (Equal Earth).
- **Main landmass:** keep everything chained to the largest landmass within a gap that scales with its size (2°–5.8°). Drops Alaska, Hawaii, French Guiana, the Canaries; keeps archipelagos. Regions use a 12° gap so overseas territories don't shrink the continent.
- **Islands:** when little survives as an outline at a size, lost islands are drawn as dots.
- **Squint test:** maps are exempt from the weight band because they follow real geography.
- **Site loading:** map paths are not inlined; the site fetches one JSON per size (`/geo/<size>.json`).
- **Small-country rule:** if a country's shape is under a minimum area at a given size, render a locator: simplified continent context + dot. Threshold tuned per size.
- **Flags:** 4:3 frame with a rounded clip and a neutral grey hairline (visible on light and dark). Five are our own drawings with detail reduced by size (US, JP, DE, FR, BR). The other 229 are adapted from flag-icons (MIT, credited in THIRD-PARTY.md) and placed unchanged in our frame; they are generated at build time and not committed. Replace them with our own drawings over time, emblem flags first, since those don't simplify at 16–20px. The site shows flags as images, so they don't respond to colour or stroke.
- **Worldview param:** `worldview=default|<iso2>` across site, API, MCP.

## 6. Design system

### Principles
We follow Helena Zhang's *7 Principles of Icon Design* (uxdesign.cc). Each principle has a rule we can check.

| Principle | Rule here | How it's checked |
|---|---|---|
| **Clarity** | Use familiar metaphors first (`data/metaphors.json`). Invent a new one only when no standard exists. | Metaphor review on new concepts |
| **Readability** | Gaps between shapes ≥ stroke + 1.5px. No interior detail at 16. | Validator (gap rules in kit), 16px preview |
| **Alignment** | Draw on keylines (circle, square, portrait, landscape) so shapes balance optically. Nudge by eye where needed. | Preview review |
| **Brevity** | Only detail that helps recognition. No decorative lines, text or texture. | Reduction note per concept |
| **Consistency** | One flat front-on perspective. Same stroke, radius, caps and joins across the set. | Validator + squint test (ink weight within band of median) |
| **Personality** | Soft geometric: generous radius (0.14 of live area), round caps and joins, full forms. | Preview review |
| **Ease of use** | Clear IDs and names, documented rules, previews at real sizes in light and dark. | `npm run all` |

### Metaphor rules
- **A sector uses the most recognised metaphor from research; where that is its industries' symbols, it combines them.** Example: Utilities is a drop with a bolt inside; Electric Utilities a bolt, Water Utilities a drop, Gas Utilities a flame on a burner.
- **Modifier: tranche base.** Two stacked lines under an asset mean a securitized product (RMBS = house, CMBS = office, ABS = card, CLO = loan document). One line at 16px.
- **No two concepts at the same level may share a silhouette at 16px.** Checked in the preview before merge.
- A child concept may reuse its parent's metaphor with a modifier, but never another branch's metaphor (Energy's flame ≠ Gas Utilities' burner flame).

### Metaphor research
Before drawing a new concept, the Designer agent runs `scripts/research.mjs <id>`:
1. Queries the Noun Project and Iconfinder APIs for the concept name and keywords.
2. Saves titles, tags, term counts and thumbnail URLs to `data/research/<id>.json`. Never their SVGs.
3. Groups the results by metaphor (using the thumbnails), picks the most widely recognised one that fits, and records `decision.metaphor` + `decision.rationale`.
4. Draws our own version on our grid. A similarity check against the reference thumbnails rejects near-copies.

Third-party icons are references only. Noun Project free icons require attribution and Iconfinder free icons carry per-creator licences, so nothing from either is copied, traced or shipped.

Secrets (GitHub Actions): `NOUN_PROJECT_KEY`, `NOUN_PROJECT_SECRET`, `ICONFINDER_KEY`.

### Grid per size
| Size | Padding | Default stroke | Allowed stroke | Tier |
|---|---|---|---|---|
| 16 | 1 | 1.25 | 1–1.75 | 0 — silhouette only |
| 20 | 1 | 1.5 | 1–2 | 1 — one key detail |
| 24 | 2 | 1.75 | 1.25–2.5 | 2 — master |
| 32 | 2 | 2.25 | 1.5–3 | 3 |
| 48 | 3 | 3 | 2–4 | 4 |

Each size has its own geometry from the drawing kit (`scripts/lib/kit.mjs`); nothing is scaled. Coordinates snap to a 0.25px grid.

### Keylines (fractions of live area)
- Circle: full live area. Square: 0.08 inset. Portrait: 0.12 inset left/right. Landscape: 0.12 inset top/bottom.
- Corner radius: 0.14.

### Construction
- Round caps, round joins, centred strokes.
- Outline: live strokes, `currentColor`, no fills.
- Solid: filled shapes with deliberate knockouts; a baked stroke of the same colour keeps the footprint identical to outline. Knockouts are drawn one stroke wider so they read at the right size. (Pre-1.0: flatten baked strokes into fills.)
- Colour: `currentColor` only. Flags are the only coloured assets.

### Detail reduction
Every concept records what drops at smaller sizes (`reduction` field). Example: `financials` has 2 columns at 16, 3 at 20+.

### Light and dark mode
- Icons inherit colour from text via `currentColor`, so they follow the theme automatically. No separate dark files.
- Previews always render both themes (`previews/pilot.png`: light on top, dark below). Review both before merging.
- Recommended tokens: light `#111111` on `#FFFFFF`; dark `#F2F2F2` on `#111214`. Muted icons must keep ≥ 3:1 contrast against their background (WCAG non-text contrast).
- Solid icons in dark mode read heavier; the squint test runs per style so both stay balanced.
- Flags: a 1px inner hairline at 12% opacity of `currentColor` keeps white-edged flags (Japan, Poland) visible in light mode and dark-edged ones visible in dark mode.
- Map outlines and region maps use `currentColor` for land; region highlights use `currentColor` at full strength and non-members at 25% opacity, so they work in both themes.

### Adjustable stroke
- Outline SVGs keep live strokes; consumers override with `.li-outline { stroke-width: var(--li-stroke); }`.
- Components and the MCP clamp to the size's allowed range.
- Solid icons ignore stroke changes.

## 7. Build pipeline

- SVGO with a locked config (keep `stroke-*`, strip IDs/metadata).
- **Validator** (blocking): viewBox matches size; only allowed attributes; stroke width = size default; all points inside live area; pixel-snapped; path count / node count within budget; no fills on outline (except knockouts by convention); no transforms; file < size limit.
- **Visual regression:** render every icon at every size to PNG; diff against last release; per-icon tolerance.
- **Consistency checks:** optical weight (ink coverage) within a band per size; stroke-to-gap ratio.
- **Outputs:** per-icon SVGs, sprites per style/size, `index.json` (concepts, nodes, keywords), embeddings for semantic search, zip downloads per scheme (folders named by scheme codes).

## 8. Releases

- SemVer. Patch = visual fixes; minor = new concepts/schemes; major = breaking (never planned).
- Channels: `next` (every merged change) and `stable`.
- Auto-promote `next` → `stable` weekly if no regressions flagged and checks green.
- CHANGELOG generated from PRs. Every icon change shows before/after in the changelog page.
- CDN URLs are versioned: `/v/1.4.0/icons/pharma/outline-24.svg`; `/latest/` follows stable.

## 9. Agents

Run in GitHub Actions (`.github/workflows/agents.yml`) with the `claude` CLI and the `ANTHROPIC_API_KEY` secret. The runner is `scripts/agents/run.mjs`; the drawing guide the agents follow is `docs/DRAWING.md`. Decided 2026-11-14: **fully automatic**, 10 new icons attempted per day, 3 refinements per week. Passing work is committed straight to `main` and deploys.

| Role | Model | Tools | Does |
|---|---|---|---|
| Scout | sonnet | Read, WebSearch | Picks the day's concepts: gaps (standard titles still borrowing an icon) plus topics (kind theme) that move markets and will keep doing so for 6+ months. Each topic must say what it moves and link one news source, or it is dropped. It reads the day's headlines from public RSS feeds (Bloomberg, FT, The Economist, Yahoo Finance, CNBC) as signals only; they are never stored. Web content is information only. |
| Researcher | — | script | `scripts/research.mjs`: how icon libraries draw the idea. Reference only. |
| Artist | opus | Read, Write, Edit, build/validate/preview | Writes `src/agent/<id>.mjs`, looks at the renders, revises. One retry with the judge's feedback. |
| Judge | opus | Read | Separate run that never saw the drawing made. Scores recognisable, small sizes, solid, consistency, distinct (1–5). All must be ≥ 4. |
| Mapper | sonnet | Read, Edit, code lookup | Maps the new icon to standard codes; the runner keeps only clean additions. |
| Reviewer | opus | Read | Daily: the same strict judge scores icons nobody has reviewed yet, whoever drew them (agents or by hand), then the oldest verdicts. Fails are flagged in the log and the weekly Curator takes flagged icons first. Never edits anything. Default 10 icons a day (`count`), about $3-4. |
| Curator | opus | Read | Weekly: picks the weakest icons from the whole-set sheets; the drawer redraws; the judge must prefer the new version. |

**Guardrails (enforced by the runner, not by the agents' goodwill):**
- Nothing is committed unless the build and validator pass with 0 errors and the judge passes it.
- Only expected paths may change (`src/agent/`, built icons, data); anything else discards the icon. Refinement may edit one concept's `draw()` and never its id, name, kind or parent.
- A picture already in `data/metaphors.json` is rejected.
- The drawer has no web access; the scout cannot write files; the judge cannot write files.
- Anyone can add icons (agents, or by hand in `src/concepts/`). Every icon, whoever drew it, is held to the same judge: new ones are reviewed within days, and flagged ones are redrawn by the weekly refine run. Agents are limited by file allow-lists; people are not.
- Parallel: add mode draws `PARALLEL` icons at once (repo variable, default 4). Each icon runs in its own child process in a throwaway git worktree (draw, checks, judge, map); the parent merges and commits finished icons one at a time and re-runs the checks on the merged tree. Icons drawn in the same batch don't see each other's pictures, so the merge step re-checks that the picture is unused. Refine mode stays sequential (concepts share source files).
- Spend: per-run cap `MAX_USD_PER_RUN` (repo variable, default 30, estimated), plus per-role turn and budget limits.
- Every attempt, pass or fail, is recorded in `data/agents/log.json` with scores, reason and cost. This is the source for the future feed.
- Never: held standards, text or currency symbols or logos in icons, copying third-party art (CLAUDE.md).
- Kill switch: disable the "Icon agents" workflow in the repo's Actions tab.

## 10. Website (icons.lithos.design)

Static site + Netlify Functions. Framework: Astro (static output, small JS islands).

**Global toggles (persisted in localStorage, reflected in URL):**
- Sector standard: NAICS | NACE | ISIC | SIC | (held schemes appear when published)
- Region standard: M49 | groupings source
- Country style: Flag | Map
- Worldview
- Style: Outline | Solid
- Size: 16 / 20 / 24 / 32 / 48
- Stroke: slider within allowed range

**Customize panel (live):** style, size, colour, stroke, corner radius, knockout gap, stroke scaling (constant / scale), flag or map, labels, appearance (auto / light / dark). Code-drawn icons are redrawn in the browser by the same drawing kit the build uses (`src/browser.mjs`, bundled with esbuild); maps and flags ship pre-rendered and respond to stroke and colour only. Not yet matched from IconMCP: dot size, a 40px size.

**Layout:** icon-first grid (no cards), floating command bar (category, search with ⌘K, outline/solid, Customize), detail panel with a shareable `?icon=` URL.

**Browse by standard:** the category menu lists each published standard (NAICS 2022, NACE Rev. 2.1, ISIC Rev. 4, SIC 1987, GICS 2025, Fitch Ratings 2020; every level). Navigation is two rows of tabs under the headline: subject (All icons · Sectors and industries · Credit · Countries · Regions), then, for sectors, "Organised by" (Plain names · each published standard). A standard's page is one flat grid like the main page (decided 2026-11-13, after trying nested layouts): every code at every level is an equal icon tile with its code chip, in code order so a parent sits just before its children (11, 111, 1111 …); schemes without codes keep the source order. A jump row links to the top-level codes. Search filters the tiles. Tree data loads on demand from `std/<scheme>.json`; rebuild node files with `scripts/standards.mjs`. Each node shows the icon of its mapped concept (`data/mappings/<scheme>.json`); a node without one shows its nearest ancestor's icon, faded. Codes are searchable everywhere, and each icon's panel lists its codes in every standard, labelled as related. GICS and Fitch Ratings are published by permission (non-commercial; §3); Fitch has no codes, so its tiles show names only. Held standards (ICB, BICS, TRBC, Moody's, S&P) stay in `standards-private/`, which is git-ignored.

**Brand marks (added 2026-11-20):** a separate page at `/marks/` (`site/marks.html`, engine in `src/marks/engine.mjs`, bundled as `MK` by `scripts/site.mjs`). Marks are drawn by code, not by agents: geometric marks are tile compositions (quarter discs, triangles, circles, mirrored or rotated, even-odd fill) and A–Z letters are stroked skeletons with adjustable weight, ends and corners. A mark id is `g-<seed in base 36>` or `l-<letter>`, so any generated mark can be linked (`/marks/?mark=g-2`). The 48 curated seeds are in `CURATED`; "Generate more" draws further seeds that pass `isGood`. Customise: mark colour, background (none, solid, gradient and angle), shape (square, rounded, squircle, circle), radius, padding, border; export SVG, or PNG at 16–1024 px (several sizes download as a zip). Marks are MIT but are starting points, not trademarks. The `icons / brand marks / atmospheres` header links appear on both pages (Atmospheres is a "soon" label until built). Icon rules (currentColor, per-size drawing) do not apply to marks.

**Which nodes get their own icon (decided 2026-11-13):** the top two levels of every standard always. Deeper nodes only when they are a visibly different thing people look for (Forestry, Fishing, Livestock under Agriculture) — never one icon per code. Everything else inherits from the nearest ancestor. One concept serves every standard (Forestry = SIC 08, NAICS 113, NACE A02). Agents must not add a concept for a node whose picture would be a near-duplicate of its parent's.

**Pages:** home (search + featured themes), browse by standard (tree), icon detail (all sizes/styles, codes in every scheme, related concepts, copy SVG/JSX/URL, download), themes, geography (map browser), changelog, licence & data sources, API/MCP docs.

**Search:** keyword + synonyms + semantic (embeddings), CLDR names in multiple languages, search by code in any published scheme. Log zero-result queries (anonymous) for the Gap filler.

## 11. API & MCP

**HTTP API** (Netlify Functions)
- `GET /api/search?q=&scheme=&kind=&limit=`
- `GET /api/icon/:concept?style=&size=&stroke=`
- `GET /api/code/:scheme/:code?style=&size=` → resolves to concept
- `GET /api/related/:scheme/:code?to=`
- `GET /api/schemes`
- `GET /api/geo/:iso2?style=flag|map&worldview=`

**MCP server** (Streamable HTTP at `/mcp`)
- `search_icons(query, scheme?, kind?, limit?)`
- `get_icon(id | {scheme, code}, style?, size?, stroke?, format: svg|jsx|url)`
- `get_country(iso, style: flag|map, size?, worldview?)`
- `list_schemes()`
- `related(scheme, code, to_scheme)`
- Server config: `default_scheme`, `default_size`, `country_style`, `worldview`.

Rate limiting per IP; no auth for read.

## 12. Figma library

- Generated from repo SVGs via a small Figma plugin (import script) — the Figma REST API can't create components.
- Component sets with variants: `style` (outline/solid) × `size` (16–48). Flags as a separate set.
- Published as a Figma Community library; version matches repo release.

## 13. Milestones

| # | Milestone | Done when |
|---|---|---|
| M0 | Repo + spec | This file, CLAUDE.md, CI skeleton |
| M1 | **Pilot** | ~40 concepts at all sizes/styles: 11 sector-level concepts, ~15 industry-level, 5 credit asset classes, 5 flags + maps, 3 region maps. Ian approves style |
| M2 | Data | Free schemes loaded (NAICS, NACE, ISIC, SIC, M49, ISO); concept list mapped |
| M3 | Geography | All flags, country maps, US states, M49 regions, groupings; worldviews |
| M4 | Full sector set | All concepts for free schemes + held schemes' concepts (icons only) |
| M5 | Site | icons.lithos.design live with toggles, search, downloads |
| M6 | API + MCP | Endpoints and MCP live |
| M7 | Agents | All agents running with guardrails |
| M8 | Figma | Community library published |
| M9 | Held standards | Each added as permission is granted |

## 14. Setup Ian does once

1. Create public GitHub repo (`lithos-icons`).
2. Connect repo to Netlify; set custom domain `icons.lithos.design`.
3. Add GitHub Actions secrets: `ANTHROPIC_API_KEY`, `NOUN_PROJECT_KEY`, `NOUN_PROJECT_SECRET`, `ICONFINDER_KEY`.
4. Check Fitch outside-activities / IP policy.

## 15. Open questions

- Which Moody's list: rating sectors, CLO industries, or both?
- Fitch "Developing Americas" and other Fitch regions — source list (held until permission).
- Themes: show on homepage at launch, or only after the scout has run for a few weeks?
- Analytics: Netlify Analytics vs Plausible for search logs.
