# Third-party material

Lithos Icons is MIT-licensed. It includes or is generated from the following.

## flag-icons (flags)
Flags for countries we have not yet drawn ourselves are adapted from **flag-icons** v7.6.0 by Panayiotis Lipiridis
(https://github.com/lipis/flag-icons), placed unchanged inside our 4:3 frame. Each country record says which
source its flag uses (`flag: "own"` or `flag: "flag-icons"`).

> The MIT License (MIT)
>
> Copyright (c) 2013 Panayiotis Lipiridis
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
> documentation files (the "Software"), to deal in the Software without restriction, including without limitation
> the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
> to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of
> the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
> THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
> CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
> DEALINGS IN THE SOFTWARE.

## Natural Earth (map outlines)
Country and region outlines are generated from Natural Earth 1:50m data (public domain, https://www.naturalearthdata.com),
via the `world-atlas` package.

## Codes and names
ISO 3166-1 codes via `i18n-iso-countries` (MIT); UN M49 regions via `un-m49` (MIT); country names from Unicode CLDR.

## Industry classifications
NAICS 2022 and SIC 1987 are US government works (public domain); titles read from `naicsjs` (MIT) and `naics-sic-crosswalk` (MIT, Census concordance; SIC industry titles are the concordance's short forms).
ISIC Rev. 4 © United Nations, reuse permitted with attribution; division, group and class titles read from the `polca/premise` repository (BSD-3-Clause).
NACE Rev. 2.1 © European Union, reuse permitted with attribution (Eurostat); read from `nace-mcp` (MIT).

## GICS and Fitch Ratings (not MIT)
GICS is a standard of MSCI Inc. and S&P Dow Jones Indices. The Fitch Ratings market sector list is Fitch's (2020, partially reconstructed).
Both are included with permission for non-commercial use, as confirmed by the project owner on 2026-11-13. The MIT licence does not
cover their names, codes or hierarchy (`data/{schemes,nodes,mappings}/{gics-2025,fitch-2020}.json`); do not reuse them commercially.

## Metaphor research
The Noun Project is used as a reference for which images people recognise. No Noun Project artwork is copied or shipped.

## Brand marks typefaces
The letters and numbers on the Brand marks page are outlines of glyphs from nineteen open-licensed typefaces, all under the SIL Open Font License 1.1 (https://openfontlicense.org): Syne (© The Syne Project Authors), Unbounded (© The Unbounded Project Authors), Bricolage Grotesque (© The Bricolage Grotesque Project Authors), Instrument Serif (© The Instrument Serif Project Authors), Fraunces (© The Fraunces Project Authors), Gloock (© The Gloock Project Authors), Dela Gothic One (© The Dela Gothic One Project Authors), Rubik Mono One (© The Rubik Mono One Project Authors), Major Mono Display (© The Major Mono Display Project Authors), Monoton (© The Monoton Project Authors), Michroma (© The Michroma Project Authors), Krona One (© The Krona One Project Authors), Zen Dots (© The Zen Dots Project Authors), Tilt Warp (© The Tilt Warp Project Authors), Climate Crisis (© The Climate Crisis Project Authors), Big Shoulders Display (© The Big Shoulders Display Project Authors), Silkscreen (© The Silkscreen Project Authors), Bungee Shade (© The Bungee Shade Project Authors), Bagel Fat One (© The Bagel Fat One Project Authors). Glyphs were read from the `@fontsource/*` packages by `scripts/marks-fonts.mjs` and shipped as vector paths in `src/marks/fonts/`. The fonts themselves are not shipped. The typeface names above are credited, not used to name any derived font.
