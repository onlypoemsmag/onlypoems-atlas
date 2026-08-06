# onlypoems-atlas

The contributor map that runs on **[onlypoems.com/atlas](https://onlypoems.com/atlas)** — a globe and an equal-area world map showing where every poet and writer ONLY POEMS has published is from, or lives now.

## What's in here

| File | What it is |
| --- | --- |
| `op-atlas.js` | The whole map. One self-contained script, no dependencies, no build step. |
| `atlas.json` | The data it draws: simplified Natural Earth coastlines plus one row per place. |

## How the page uses it

The Webflow page carries the headline, the counters, the essay and the full poet index as real HTML, so search engines read all of it without running any JavaScript. This script only fills in the map.

Put an empty element with the right id somewhere on the page:

```html
<div id="op-atlas-map"></div>
```

Then load the script anywhere after it:

```html
<script src="https://cdn.jsdelivr.net/gh/onlypoemsmag/onlypoems-atlas@v1/op-atlas.js" defer></script>
```

The script finds `#op-atlas-map`, injects its own styles and markup, and fetches `atlas.json` from whatever folder it was loaded from. To point it somewhere else, put the URL on the element:

```html
<div id="op-atlas-map" data-atlas-src="https://example.com/atlas.json"></div>
```

If the data can't be fetched, the map replaces itself with a line telling the reader the list of places below is complete. The page never breaks.

## Versioning

The site loads a pinned tag, never `@main`, so a commit here can't change what's live. To ship an update: push the new files, cut the next tag, then change `@v1` to `@v2` in the Webflow embed.

Releases are immutable on jsDelivr once fetched, so the site keeps serving the old files until that one character changes.

## Where the data comes from

`atlas.json` is generated, not hand-edited. Two sources feed it:

- **Places** — the `from` and `lives` fields on the Poets Catalog and Authors collections in Webflow. Every location traces back to a sentence the writer had already published about themselves. Nobody was geolocated.
- **Coastlines** — [Natural Earth](https://www.naturalearthdata.com/) 1:50m, public domain, simplified to the points that still change the shape at this size.

The map draws on [Equal Earth](https://equal-earth.com/) (Šavrič, Patterson & Jenny, 2018), an equal-area projection, so every country covers the share of the page it covers of the earth.

Nothing on the page calls out to a tile server. There is no Google Maps or Mapbox here, and no request that reveals where a reader is looking.

## Anything wrong?

If you've been published by us and you're missing, misplaced, or you'd rather not be on the map at all, write to us at [karan@onlypoems.net](mailto:karan@onlypoems.net) and we'll fix it right away.
