# onlypoems-atlas

The contributor map that runs on [onlypoems.com/atlas](https://onlypoems.com/atlas) — a globe
and an equal-area world map showing where every poet and writer ONLY POEMS has published is
from, or lives now.

## What's in here

| File | What it is |
| --- | --- |
| `op-atlas.js` | The whole map. One self-contained script, no dependencies, no build step. |
| `atlas.json` | The data it draws: simplified Natural Earth coastlines, plus one row per place. |
| `unplaced.md` | Who isn't on the map, and why. Rewritten by the rebuild — don't edit it by hand. |
| `build_atlas.py` | The rebuild: reads the CMS, works out where everyone goes, rewrites `atlas.json`. |
| `geo.py`, `place_rules.py` | Coordinates, and the two rules that decide each person's single dot. |

## How the page uses it

The page carries the headline, the four figures, the essay and the full poet index as real
HTML, so search engines read them without running any JavaScript. The script adds the picture
and the interactions on top, and corrects the figures and the index if the data has moved on
since the last publish.

```html
<div id="op-atlas-map"></div>
<script src="https://cdn.jsdelivr.net/gh/onlypoemsmag/onlypoems-atlas@v3/op-atlas.js"></script>
```

`atlas.json` is loaded from the same folder as the script. Point it somewhere else with
`data-atlas-src` on the container.

Versions are pinned to a tag, so the live site can never be surprised by a change here. To
ship an update: commit, cut a new tag, and change the number in Webflow. The old tag keeps
working, which is what makes rolling back a one-character edit.

## Keeping it current

The CMS is the source of truth. Every contributor's place comes from the `from` and `lives`
fields on their Poets Catalog or Authors record, written most-specific-first:

```
Chapel Hill, North Carolina, United States
Colorado, United States
Ibadan, Nigeria
Nigeria
```

Leave both blank and they simply aren't placed — they'll be listed in `unplaced.md`. Tick
`hide-from-atlas` and they're left off entirely.

`.github/workflows/rebuild.yml` runs on the 1st of each month, and on demand from the Actions
tab. It reads the CMS, rebuilds `atlas.json`, and commits it if anything moved. It needs one
repository secret, `WEBFLOW_TOKEN` — a Webflow API token with read access to the site's CMS.

The job **fails on purpose** if somebody has a location on file that `geo.py` has no
coordinates for. That's the one case worth an email: it means a real person would otherwise
drop off the map without anyone noticing. Add the coordinates and re-run.

## Two rules worth knowing

**Everybody gets one dot.** When a poet was born in one country and lives in another, the dot
goes to whichever of the two we've published from least. Nothing is invented — both candidates
already come from something they published about themselves.

**The map is equal-area.** It's Equal Earth (Šavrič, Patterson & Jenny, 2018), so every country
covers the share of the page it covers of the earth. Greenland is small. That's correct.

Coastlines are Natural Earth 1:50m, public domain, thinned to the points that still change the
shape at this size. They're drawn point to point every time you move, which is why the map
stays sharp however far you zoom. There is no tile server and no third-party request: nothing
on the page calls out to anyone.
