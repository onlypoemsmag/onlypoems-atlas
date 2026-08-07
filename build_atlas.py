#!/usr/bin/env python3
"""Rebuild atlas.json from the ONLY POEMS CMS.

The CMS is the source of truth. Every contributor's place comes from the
`from` and `lives` fields on their Poets Catalog or Authors record, written
as "City, Region, Country" — trailing parts dropped where they don't apply:

    Chapel Hill, North Carolina, United States
    Colorado, United States
    Ibadan, Nigeria
    Nigeria

Nothing is invented. A record with both fields is pinned to whichever of the
two countries we have published from LEAST, so the map leans towards showing
range rather than repeating the same crowd (see place_rules.py).

The coastlines in atlas.json are Natural Earth, they never change, and this
script leaves them exactly as it found them. It only rewrites `places`.

Usage
    WEBFLOW_TOKEN=... python3 build_atlas.py
    python3 build_atlas.py --fixture path.json    # offline, for tests

Exit codes
    0  everything that had a location on file got placed
    1  someone had a location we could not turn into coordinates — that is a
       gap in geo.py and it needs a human, so the job fails loudly
       rather than quietly dropping a poet off the map.
"""
import argparse, html, json, os, re, sys, time, urllib.error, urllib.request

import geo
import place_rules

HERE = os.path.dirname(os.path.abspath(__file__))
# works whether this file sits at the repo root or in a build/ folder
ROOT = HERE if os.path.exists(os.path.join(HERE, "atlas.json")) else os.path.dirname(HERE)
ATLAS = os.path.join(ROOT, "atlas.json")
REPORT = os.path.join(ROOT, "unplaced.md")

API = "https://api.webflow.com/v2"
SITE_URL = "https://onlypoems.com"

POETS_CATALOG = "6835e70a8ae839aaf82d384f"   # /poems/<slug>  — every contributor
AUTHORS       = "684238191403b7b39ef670bb"   # /authors/<slug>
POETS_OF_WEEK = "6835ecae9cd4248a2fb8a4a1"   # /poets/<slug>  — the ones with an edition

# Stored in the CMS in capitals. Poets who write their own name in lower case
# (summa iru, ethan s. evans) are left exactly as they are.
NAME_FIX = {
    "HENRY CHRISTOPHER": "Henry Christopher",
    "TRINA GAYNON": "Trina Gaynon",
}


# ----------------------------------------------------------------- the CMS
def get(path):
    req = urllib.request.Request(
        API + path,
        headers={"Authorization": "Bearer " + os.environ["WEBFLOW_TOKEN"],
                 "accept-version": "2.0.0", "Accept": "application/json"})
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504) and attempt < 4:
                time.sleep(2 ** attempt)
                continue
            raise


def collection(cid):
    """Every live item in a collection."""
    out, offset = [], 0
    while True:
        page = get(f"/collections/{cid}/items?limit=100&offset={offset}")
        items = page.get("items", [])
        out.extend(items)
        offset += len(items)
        if not items or offset >= page.get("pagination", {}).get("total", 0):
            return out


# --------------------------------------------------------------- the field
def parse_place(s):
    """'City, Region, Country' | 'Region, Country' | 'City, Country' | 'Country'."""
    parts = [x.strip() for x in (s or "").split(",") if x.strip()]
    if not parts:
        return None
    if len(parts) >= 3:
        return {"city": parts[0], "region": parts[1], "country": parts[-1]}
    if len(parts) == 2:
        head, country = parts
        if (head, country) in geo.REGION:
            return {"city": "", "region": head, "country": country}
        return {"city": head, "region": "", "country": country}
    return {"city": "", "region": "", "country": parts[0]}


TAG = re.compile(r"<[^>]+>")


def poem_line(raw, limit=110):
    """The pull-quote shown under a name, as plain text."""
    t = html.unescape(TAG.sub(" ", raw or "")).replace("\xa0", " ")
    t = " ".join(t.split())
    if len(t) <= limit:
        return t
    return t[:limit].rsplit(" ", 1)[0] + "..."


def precision(loc):
    if not loc:
        return 0
    if loc.get("city"):
        return 3
    if loc.get("region"):
        return 2
    return 1


# ------------------------------------------------------------------ people
def gather(poets, authors, potw_slugs):
    """One record per human, deduped by name across both collections."""
    people = {}

    def absorb(item, role):
        fd = item.get("fieldData") or {}
        if item.get("isArchived") or item.get("isDraft"):
            return
        if fd.get("hide-from-atlas"):
            return
        name = (fd.get("name") or "").strip()
        if not name:
            return
        name = NAME_FIX.get(name, name)
        slug = fd.get("slug") or ""
        rec = people.setdefault(name, {
            "name": name, "slug": slug, "role": role,
            "origin": None, "current": None, "poem_line": "",
        })
        # a poet page beats an author page for the link
        if role == "poet" and rec["role"] == "author":
            rec["role"], rec["slug"] = "poet", slug
        for field, key in (("origin", "from"), ("current", "lives")):
            new = parse_place(fd.get(key))
            if precision(new) > precision(rec[field]):
                rec[field] = new
        if not rec["poem_line"]:
            rec["poem_line"] = poem_line(fd.get("text-above-the-poems-link"))

    for it in poets:
        absorb(it, "poet")
    for it in authors:
        absorb(it, "author")

    for rec in people.values():
        slug = rec["slug"]
        if not slug:
            rec["url"] = ""
        elif rec["role"] == "author":
            rec["url"] = f"{SITE_URL}/authors/{slug}"
        elif slug in potw_slugs:
            rec["url"] = f"{SITE_URL}/poets/{slug}"
        else:
            rec["url"] = f"{SITE_URL}/poems/{slug}"

    return sorted(people.values(), key=lambda p: p["name"].lower())


def build_places(people):
    freq = place_rules.country_frequency(people)
    buckets, no_location, ungeocodable = {}, [], []

    for p in people:
        loc, which = place_rules.choose_place(p, freq)
        if not loc:
            no_location.append(p["name"])
            continue
        before = sum(geo.MISSES.values())
        c = geo.lookup(loc)
        if not c:
            ungeocodable.append((p["name"], ", ".join(
                x for x in (loc["city"], loc["region"], loc["country"]) if x)))
            continue
        if sum(geo.MISSES.values()) > before:
            # placed, but only by falling back to a coarser anchor
            ungeocodable.append((p["name"], ", ".join(
                x for x in (loc["city"], loc["region"], loc["country"]) if x) +
                "  (fell back to a coarser pin)"))
        lat, lon, prec = c
        city, region, country = loc["city"], loc["region"], loc["country"]
        if prec == "city":
            key, label = f"c|{city}|{country}", city
        elif prec == "region":
            key, label = f"r|{region}|{country}", region
        else:
            key, label = f"n|{country}", ""
        bk = buckets.setdefault(key, {
            "city": label, "country": country, "lat": lat, "lon": lon,
            "precision": prec, "continent": geo.CONTINENT.get(country, "—"),
            "poets": [],
        })
        bk["poets"].append({"n": p["name"], "u": p["url"],
                            "l": p["poem_line"], "f": which, "d": False})

    for b in buckets.values():
        b["poets"].sort(key=lambda x: x["n"].lower())
    rows = sorted(buckets.values(), key=lambda r: -len(r["poets"]))
    return rows, no_location, ungeocodable


# ------------------------------------------------------------------- write
def report(people, rows, no_location, ungeocodable):
    placed = sum(len(r["poets"]) for r in rows)
    lines = [
        "# Who is not on the map",
        "",
        "Rebuilt automatically. Do not edit by hand — change the CMS instead.",
        "",
        f"- contributors in the CMS: **{len(people)}**",
        f"- placed on the map: **{placed}**",
        f"- no location on file: **{len(no_location)}**",
        f"- had a location we could not place: **{len(ungeocodable)}**",
        "",
        "## No location on file",
        "",
        "Nothing they have published says where they are from or where they live.",
        "Fill in `from` or `lives` on their CMS record and they appear next run.",
        "",
    ]
    lines += [f"- {n}" for n in sorted(no_location, key=str.lower)] or ["_nobody_"]
    lines += [
        "",
        "## Location on file, but we could not place it",
        "",
        "These need a coordinate adding to `geo.py`. Until then the person",
        "sits at a coarser pin or is missing entirely, so the build fails on purpose.",
        "",
    ]
    lines += [f"- {n} — `{w}`" for n, w in sorted(ungeocodable)] or ["_nobody_"]
    open(REPORT, "w").write("\n".join(lines) + "\n")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fixture", help="read CMS items from a local file instead")
    ap.add_argument("--out", default=ATLAS)
    args = ap.parse_args()

    if args.fixture:
        fx = json.load(open(args.fixture))
        poets, authors, potw = fx["poets"], fx["authors"], set(fx["potw"])
    else:
        poets = collection(POETS_CATALOG)
        authors = collection(AUTHORS)
        potw = {(i.get("fieldData") or {}).get("slug") for i in collection(POETS_OF_WEEK)}

    people = gather(poets, authors, potw)
    rows, no_location, ungeocodable = build_places(people)

    previous = json.load(open(ATLAS))
    land = previous["land"]                        # never rebuilt
    placed_now = sum(len(r["poets"]) for r in rows)
    placed_was = sum(len(r["poets"]) for r in previous.get("places", []))
    if placed_was and placed_now < placed_was * 0.9:
        print(f"refusing to write: {placed_now} people placed, down from "
              f"{placed_was}. Something is wrong upstream — atlas.json left "
              f"alone.", file=sys.stderr)
        report(people, rows, no_location, ungeocodable)
        return 1

    totals = {"contributors": len(people), "placed": placed_now}
    with open(args.out, "w") as f:
        json.dump({"land": land, "places": rows, "totals": totals},
                  f, separators=(",", ":"))

    report(people, rows, no_location, ungeocodable)

    placed = sum(len(r["poets"]) for r in rows)
    countries = len({r["country"] for r in rows if r["country"]})
    continents = len({r["continent"] for r in rows if r["continent"] != "—"})
    cities = sum(1 for r in rows if r["precision"] == "city")
    print(f"contributors {len(people)}  placed {placed}  "
          f"countries {countries}  continents {continents}  cities {cities}")
    print(f"no location on file: {len(no_location)}")
    if geo.MISSES:
        print("geocoder misses:", dict(geo.MISSES), file=sys.stderr)
    if ungeocodable:
        print("\nCould not place:", file=sys.stderr)
        for n, w in ungeocodable:
            print(f"  {n} — {w}", file=sys.stderr)
        print("\nAdd the coordinates to geo.py and re-run.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
