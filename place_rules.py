#!/usr/bin/env python3
"""Two rules that decide the single place each contributor is pinned to.

1. GRANULARITY — city/state only where a country anchor would mislead (big
   countries) or where the city is a world city everyone knows. Everywhere else
   the pin is the country. Nothing finer than a city; counties, islands and
   regions roll up to their state.

2. RARITY — a person with both an origin and a current address is pinned to
   whichever of the two sits in the LESS represented country. Francis, from
   Finland and living in the UK, pins to Finland. Nothing is invented: both
   candidates already come from something published about them.
"""

# Countries big enough that one dot in the middle says nothing useful.
KEEP_CITY_COUNTRIES = {
    "United States", "Canada", "India", "China", "Brazil", "Australia",
    "Russia", "Mexico", "Indonesia", "Argentina", "Nigeria", "Peru",
    "Kazakhstan", "Algeria", "Iran", "Egypt", "Tanzania", "Ukraine",
    "Pakistan", "Turkey", "South Africa", "Colombia", "Ethiopia", "Chile",
}

# Cities a reader places instantly, wherever they are.
FAMOUS_CITIES = {
    "London", "Paris", "Berlin", "Madrid", "Rome", "Lisbon", "Amsterdam",
    "Vienna", "Prague", "Budapest", "Warsaw", "Bucharest", "Kyiv", "Istanbul",
    "Moscow", "Dublin", "Edinburgh", "Stockholm", "Copenhagen", "Oslo",
    "Helsinki", "Athens", "Beirut", "Tel Aviv", "Cairo", "Lagos", "Nairobi",
    "Johannesburg", "Cape Town", "Dar es Salaam", "Accra", "Tokyo", "Seoul",
    "Busan", "Beijing", "Shanghai", "Hong Kong", "Taipei", "Singapore",
    "Bangkok", "Manila", "Jakarta", "Delhi", "New Delhi", "Mumbai",
    "Bengaluru", "Karachi", "Lahore", "Dhaka", "Sydney", "Melbourne",
    "Auckland", "Wellington", "Toronto", "Montreal", "Vancouver",
    "Mexico City", "Lima", "Bogotá", "Santiago", "Buenos Aires",
    "São Paulo", "Rio de Janeiro", "Havana", "Kingston", "Gaza", "Jerusalem",
}

# Counties, islands and regions given in bios — coarser than a city, so they
# sit on their state instead of pretending to be a town.
ROLL_UP_TO_STATE = {
    # A county is an administrative box with no shape a reader recognises.
    # Islands and peninsulas stay: if a place reads as itself on the map,
    # that beats tidiness.
    ("Rockland County", "United States"): "New York",
}


def rollup(loc):
    """Return a display-level copy of a location, or None."""
    if not loc:
        return None
    city = (loc.get("city") or "").strip()
    region = (loc.get("region") or "").strip()
    country = (loc.get("country") or "").strip()
    if not country:
        return None

    if (city, country) in ROLL_UP_TO_STATE:
        region, city = ROLL_UP_TO_STATE[(city, country)], ""

    if city:
        big = country in KEEP_CITY_COUNTRIES
        if not (big or city in FAMOUS_CITIES):
            city, region = "", ""            # small country -> country pin
    if not city and region and country not in ("United States", "Canada"):
        region = ""                          # only US/Canada carry a state pin

    out = dict(loc)
    out["city"], out["region"], out["country"] = city, region, country
    return out


def country_frequency(people):
    """How many PEOPLE have each country among their candidate places."""
    freq = {}
    for p in people:
        seen = set()
        for f in ("origin", "current"):
            loc = rollup(p.get(f))
            if loc:
                seen.add(loc["country"])
        for c in seen:
            freq[c] = freq.get(c, 0) + 1
    return freq


def choose_place(p, freq):
    """-> (location, which_field) picking the rarer country; origin breaks ties."""
    o, c = rollup(p.get("origin")), rollup(p.get("current"))
    if o and not c:
        return o, "from"
    if c and not o:
        return c, "lives"
    if not o and not c:
        return None, ""
    fo, fc = freq.get(o["country"], 0), freq.get(c["country"], 0)
    if fc < fo:
        return c, "lives"
    return o, "from"
