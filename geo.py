#!/usr/bin/env python3
"""Geocode tables for the ONLY POEMS contributor atlas.

Lookup order: (city, state) -> (city, country) -> state anchor -> country anchor.
Keying US and Canadian cities by state/province matters: the catalogue holds both
Wilmington DE and Wilmington NC, both Bowling Green KY and OH, both Columbus OH
and MS, and Huntsville TX (not AL).
"""

# ---------------------------------------------------------------- US cities
CITY_US = {
    ("Washington", "District of Columbia"): (38.90, -77.04),
    ("Washington", ""): (38.90, -77.04),          # unqualified reads as D.C.
    ("Phoenix", "Arizona"): (33.45, -112.07),
    ("Tempe", "Arizona"): (33.43, -111.94),
    ("Tucson", "Arizona"): (32.22, -110.97),
    ("Anaheim", "California"): (33.84, -117.91),
    ("Benicia", "California"): (38.05, -122.16),
    ("Long Beach", "California"): (33.77, -118.19),
    ("Los Angeles", "California"): (34.05, -118.24),
    ("Norwalk", "California"): (33.91, -118.08),
    ("Oakland", "California"): (37.80, -122.27),
    ("Redondo Beach", "California"): (33.85, -118.39),
    ("San Diego", "California"): (32.72, -117.16),
    ("San Francisco", "California"): (37.77, -122.42),
    ("Santa Barbara", "California"): (34.42, -119.70),
    ("Santa Monica", "California"): (34.02, -118.49),
    ("Vallejo", "California"): (38.10, -122.26),
    ("Denver", "Colorado"): (39.74, -104.99),
    ("Thornton", "Colorado"): (39.87, -104.97),
    ("New Haven", "Connecticut"): (41.31, -72.93),
    ("Middletown", "Delaware"): (39.45, -75.72),
    ("Newark", "Delaware"): (39.68, -75.75),
    ("Wilmington", "Delaware"): (39.74, -75.55),
    ("Jacksonville", "Florida"): (30.33, -81.66),
    ("Miami", "Florida"): (25.77, -80.19),
    ("St. Petersburg", "Florida"): (27.77, -82.64),
    ("Tallahassee", "Florida"): (30.44, -84.28),
    ("Tampa", "Florida"): (27.95, -82.46),
    ("West Palm Beach", "Florida"): (26.72, -80.05),
    ("Athens", "Georgia"): (33.96, -83.38),
    ("Atlanta", "Georgia"): (33.75, -84.39),
    ("Honolulu", "Hawaii"): (21.31, -157.86),
    ("Maui", "Hawaii"): (20.80, -156.33),
    ("Rexburg", "Idaho"): (43.83, -111.79),
    ("Chicago", "Illinois"): (41.88, -87.63),
    ("Elgin", "Illinois"): (42.04, -88.28),
    ("Glen Ellyn", "Illinois"): (41.88, -88.07),
    ("Indianapolis", "Indiana"): (39.77, -86.16),
    ("Iowa City", "Iowa"): (41.66, -91.53),
    ("Bowling Green", "Kentucky"): (36.99, -86.44),
    ("Lake Charles", "Louisiana"): (30.21, -93.22),
    ("New Orleans", "Louisiana"): (29.95, -90.07),
    ("Bangor", "Maine"): (44.80, -68.77),
    ("Farmington", "Maine"): (44.67, -70.15),
    ("Annapolis", "Maryland"): (38.98, -76.49),
    ("College Park", "Maryland"): (38.99, -76.94),
    ("Boston", "Massachusetts"): (42.36, -71.06),
    ("Cambridge", "Massachusetts"): (42.37, -71.11),
    ("Cape Cod", "Massachusetts"): (41.68, -70.20),
    ("Chelsea", "Massachusetts"): (42.39, -71.03),
    ("Greenfield", "Massachusetts"): (42.59, -72.60),
    ("Northampton", "Massachusetts"): (42.33, -72.63),
    ("Salem", "Massachusetts"): (42.52, -70.90),
    ("Ann Arbor", "Michigan"): (42.28, -83.74),
    ("Chelsea", "Michigan"): (42.32, -84.02),
    ("Detroit", "Michigan"): (42.33, -83.05),
    ("Grand Ledge", "Michigan"): (42.75, -84.75),
    ("Grand Rapids", "Michigan"): (42.96, -85.67),
    ("Minneapolis", "Minnesota"): (44.98, -93.27),
    ("Columbus", "Mississippi"): (33.50, -88.43),
    ("Kansas City", "Missouri"): (39.10, -94.58),
    ("St. Louis", "Missouri"): (38.63, -90.20),
    ("Livingston", "Montana"): (45.66, -110.56),
    ("Missoula", "Montana"): (46.87, -113.99),
    ("Hanover", "New Hampshire"): (43.70, -72.29),
    ("Princeton", "New Jersey"): (40.35, -74.66),
    ("Randolph", "New Jersey"): (40.85, -74.58),
    ("Farmington", "New Mexico"): (36.73, -108.19),
    ("Binghamton", "New York"): (42.10, -75.91),
    ("Brooklyn", "New York"): (40.68, -73.94),
    ("Buffalo", "New York"): (42.89, -78.88),
    ("Garden City", "New York"): (40.73, -73.63),
    ("Ithaca", "New York"): (42.44, -76.50),
    ("Mount Kisco", "New York"): (41.20, -73.73),
    ("New York", "New York"): (40.71, -74.01),
    ("Queens", "New York"): (40.73, -73.79),
    ("Rochester", "New York"): (43.16, -77.61),
    ("Rockland County", "New York"): (41.15, -74.02),
    ("Syracuse", "New York"): (43.05, -76.15),
    ("Asheville", "North Carolina"): (35.60, -82.55),
    ("Black Mountain", "North Carolina"): (35.62, -82.32),
    ("Bolton", "North Carolina"): (34.32, -78.42),
    ("Chapel Hill", "North Carolina"): (35.91, -79.06),
    ("Hillsborough", "North Carolina"): (36.07, -79.10),
    ("Raleigh", "North Carolina"): (35.78, -78.64),
    ("Wilmington", "North Carolina"): (34.23, -77.94),
    ("Bowling Green", "Ohio"): (41.37, -83.65),
    ("Cleveland", "Ohio"): (41.50, -81.69),
    ("Columbus", "Ohio"): (39.96, -83.00),
    ("Granville", "Ohio"): (40.07, -82.52),
    ("Corvallis", "Oregon"): (44.56, -123.26),
    ("Portland", "Oregon"): (45.52, -122.68),
    ("Broomall", "Pennsylvania"): (39.98, -75.36),
    ("Erie", "Pennsylvania"): (42.13, -80.09),
    ("Philadelphia", "Pennsylvania"): (39.95, -75.17),
    ("Providence", "Rhode Island"): (41.82, -71.41),
    ("Conway", "South Carolina"): (33.84, -79.05),
    ("James Island", "South Carolina"): (32.73, -79.94),
    ("Knoxville", "Tennessee"): (35.96, -83.92),
    ("Nashville", "Tennessee"): (36.16, -86.78),
    ("Austin", "Texas"): (30.27, -97.74),
    ("Houston", "Texas"): (29.76, -95.37),
    ("Huntsville", "Texas"): (30.72, -95.55),
    ("The Woodlands", "Texas"): (30.16, -95.49),
    ("Salt Lake City", "Utah"): (40.76, -111.89),
    ("Blacksburg", "Virginia"): (37.23, -80.41),
    ("Charlottesville", "Virginia"): (38.03, -78.48),
    ("Roanoke", "Virginia"): (37.27, -79.94),
    ("Bellingham", "Washington"): (48.75, -122.48),
    ("Port Townsend", "Washington"): (48.12, -122.76),
    ("San Juan Island", "Washington"): (48.53, -123.08),
    ("Seattle", "Washington"): (47.61, -122.33),
    ("Huntington", "West Virginia"): (38.42, -82.45),
}

# ---------------------------------------------------------------- Canada
CITY_CA = {
    ("Vancouver", "British Columbia"): (49.28, -123.12),
    ("Fredericton", "New Brunswick"): (45.96, -66.64),
    ("Kitchener", "Ontario"): (43.45, -80.49),
    ("Toronto", "Ontario"): (43.65, -79.38),
    ("Windsor", "Ontario"): (42.32, -83.04),
    ("Montreal", "Quebec"): (45.50, -73.57),
}

# ---------------------------------------------------------------- elsewhere
CITY_WORLD = {
    ("Xiamen", "China"): (24.48, 118.09),
    ("Berlin", "Germany"): (52.52, 13.40),
    ("Bengaluru", "India"): (12.97, 77.59),
    ("Chandigarh", "India"): (30.73, 76.78),
    ("Delhi", "India"): (28.61, 77.21),
    ("New Delhi", "India"): (28.61, 77.21),
    ("Kozhikode", "India"): (11.26, 75.78),
    ("Port Antonio", "Jamaica"): (18.18, -76.45),
    ("Beirut", "Lebanon"): (33.89, 35.50),
    ("Durango", "Mexico"): (24.02, -104.65),
    ("Mexico City", "Mexico"): (19.43, -99.13),
    ("Agulu", "Nigeria"): (6.08, 7.02),
    ("Ibadan", "Nigeria"): (7.38, 3.90),
    ("Lagos", "Nigeria"): (6.52, 3.38),
    ("Gaza", "Palestine"): (31.50, 34.47),
    ("Lima", "Peru"): (-12.05, -77.04),
    ("Manila", "Philippines"): (14.60, 120.98),
    ("Warsaw", "Poland"): (52.23, 21.01),
    ("Bucharest", "Romania"): (44.43, 26.10),
    ("Singapore", "Singapore"): (1.35, 103.82),
    ("Busan", "South Korea"): (35.18, 129.08),
    ("Dar es Salaam", "Tanzania"): (-6.79, 39.21),
    ("Kyiv", "Ukraine"): (50.45, 30.52),
    ("Odesa", "Ukraine"): (46.48, 30.72),
    ("London", "United Kingdom"): (51.51, -0.13),
}

# ---------------------------------------------------------------- state / province
REGION = {
    ("Alabama", "United States"): (32.80, -86.80),
    ("Arizona", "United States"): (34.20, -111.60),
    ("Arkansas", "United States"): (34.80, -92.40),
    ("California", "United States"): (37.20, -119.50),
    ("Colorado", "United States"): (39.00, -105.55),
    ("Delaware", "United States"): (39.00, -75.50),
    ("Florida", "United States"): (28.60, -82.40),
    ("Georgia", "United States"): (32.70, -83.40),
    ("Hawaii", "United States"): (20.30, -156.40),
    ("Illinois", "United States"): (40.00, -89.20),
    ("Indiana", "United States"): (39.90, -86.30),
    ("Iowa", "United States"): (42.00, -93.50),
    ("Kentucky", "United States"): (37.50, -85.30),
    ("Maine", "United States"): (45.40, -69.20),
    ("Maryland", "United States"): (39.00, -76.80),
    ("Massachusetts", "United States"): (42.25, -71.80),
    ("Michigan", "United States"): (44.30, -85.40),
    ("Midwest", "United States"): (41.50, -89.00),
    ("Minnesota", "United States"): (46.30, -94.30),
    ("Missouri", "United States"): (38.40, -92.50),
    ("Montana", "United States"): (47.00, -109.60),
    ("New Jersey", "United States"): (40.20, -74.70),
    ("New York", "United States"): (42.90, -75.50),
    ("North Carolina", "United States"): (35.50, -79.40),
    ("Ohio", "United States"): (40.30, -82.70),
    ("Oregon", "United States"): (43.90, -120.60),
    ("Pennsylvania", "United States"): (40.90, -77.80),
    ("Rhode Island", "United States"): (41.70, -71.60),
    ("Tennessee", "United States"): (35.80, -86.40),
    ("Texas", "United States"): (31.50, -99.30),
    ("Vermont", "United States"): (44.10, -72.70),
    ("Virginia", "United States"): (37.50, -78.80),
    ("Washington", "United States"): (47.40, -120.50),
    ("West Virginia", "United States"): (38.60, -80.60),
    ("British Columbia", "Canada"): (54.00, -125.00),
    ("New Brunswick", "Canada"): (46.50, -66.10),
    ("Ontario", "Canada"): (50.00, -86.00),
    ("Quebec", "Canada"): (52.00, -72.00),
}

# ---------------------------------------------------------------- country anchors
COUNTRY = {
    "Argentina": (-35.00, -65.00), "Australia": (-25.00, 134.00),
    "Bangladesh": (23.70, 90.40), "Belgium": (50.64, 4.67),
    "Brazil": (-10.00, -52.00), "Canada": (56.00, -106.00),
    "Chile": (-35.70, -71.10), "China": (35.00, 104.00),
    "Colombia": (4.10, -73.00), "Croatia": (45.10, 15.20),
    "Cuba": (21.50, -79.50), "Egypt": (26.80, 30.80),
    "Ethiopia": (9.10, 40.50), "Finland": (64.00, 26.00),
    "France": (46.60, 2.30), "Germany": (51.20, 10.40),
    "Ghana": (7.95, -1.03), "Greece": (39.10, 21.80),
    "Hong Kong": (22.32, 114.17), "India": (22.00, 79.00),
    "Indonesia": (-2.50, 118.00), "Iran": (32.40, 53.70),
    "Iraq": (33.20, 43.70), "Ireland": (53.40, -8.00),
    "Israel": (31.50, 34.90), "Italy": (42.80, 12.60),
    "Jamaica": (18.11, -77.30), "Japan": (36.20, 138.30),
    "Kenya": (0.02, 37.90), "Lebanon": (33.89, 35.50),
    "Malaysia": (4.20, 102.00), "Mexico": (23.60, -102.50),
    "Morocco": (31.80, -7.10), "Nepal": (28.40, 84.10),
    "Netherlands": (52.20, 5.30), "New Zealand": (-41.50, 172.80),
    "Nigeria": (9.08, 8.68), "Norway": (61.00, 8.50),
    "Pakistan": (30.40, 69.30), "Palestine": (31.95, 35.23),
    "Peru": (-9.20, -75.00), "Philippines": (12.88, 121.77),
    "Poland": (52.00, 19.40), "Romania": (45.94, 24.97),
    "Russia": (61.50, 90.00), "Singapore": (1.35, 103.82),
    "South Africa": (-29.00, 24.70), "South Korea": (36.50, 127.90),
    "Spain": (40.00, -3.70), "Sri Lanka": (7.90, 80.80),
    "Sweden": (62.00, 15.00), "Taiwan": (23.70, 121.00),
    "Tanzania": (-6.37, 34.89), "Tunisia": (34.00, 9.50),
    "Turkey": (39.00, 35.20), "Uganda": (1.40, 32.30),
    "Ukraine": (48.38, 31.17), "United Kingdom": (54.00, -2.50),
    "United States": (39.50, -98.35), "Venezuela": (7.00, -66.00),
    "Vietnam": (14.06, 108.28), "Zimbabwe": (-19.00, 29.90),
}

CONTINENT = {
    "United States": "North America", "Canada": "North America",
    "Mexico": "North America", "Cuba": "North America", "Jamaica": "North America",
    "United Kingdom": "Europe", "Germany": "Europe", "Croatia": "Europe",
    "Finland": "Europe", "Ukraine": "Europe", "Poland": "Europe",
    "Ireland": "Europe", "France": "Europe", "Spain": "Europe",
    "Italy": "Europe", "Netherlands": "Europe", "Sweden": "Europe",
    "Norway": "Europe", "Greece": "Europe", "Russia": "Europe",
    "Romania": "Europe", "Belgium": "Europe",
    "India": "Asia", "Philippines": "Asia", "Singapore": "Asia",
    "China": "Asia", "Indonesia": "Asia", "Pakistan": "Asia",
    "Lebanon": "Asia", "Palestine": "Asia", "Hong Kong": "Asia",
    "Taiwan": "Asia", "Japan": "Asia", "South Korea": "Asia",
    "Sri Lanka": "Asia", "Bangladesh": "Asia", "Nepal": "Asia",
    "Malaysia": "Asia", "Vietnam": "Asia", "Turkey": "Asia",
    "Iran": "Asia", "Iraq": "Asia", "Israel": "Asia",
    "Nigeria": "Africa", "Tanzania": "Africa", "Tunisia": "Africa",
    "Egypt": "Africa", "Ghana": "Africa", "Kenya": "Africa",
    "South Africa": "Africa", "Ethiopia": "Africa", "Uganda": "Africa",
    "Zimbabwe": "Africa", "Morocco": "Africa",
    "Venezuela": "South America", "Brazil": "South America",
    "Argentina": "South America", "Chile": "South America",
    "Colombia": "South America", "Peru": "South America",
    "Australia": "Oceania", "New Zealand": "Oceania",
}

# What is still a judgement call after state-level matching
AMBIGUOUS = {
    "Washington (no state given)": "read as Washington, D.C.",
    "Cape Cod": "a peninsula, not a town — pinned near Barnstable",
    "Rockland County": "a county, not a town — pinned at its centre",
    "San Juan Island": "pinned at Friday Harbor",
    "Salish Sea": "straddles Washington State and British Columbia, so one poet stays unplaced",
    "Midwest / American South": "named as regions with no state, so they sit on a coarse anchor",
}

MISSES = __import__("collections").Counter()


def lookup(loc):
    """-> (lat, lon, precision) or None. precision: city | region | country"""
    if not loc:
        return None
    city = (loc.get("city") or "").strip()
    region = (loc.get("region") or "").strip()
    country = (loc.get("country") or "").strip()

    if city:
        if country == "United States" and (city, region) in CITY_US:
            return (*CITY_US[(city, region)], "city")
        if country == "Canada" and (city, region) in CITY_CA:
            return (*CITY_CA[(city, region)], "city")
        if (city, country) in CITY_WORLD:
            return (*CITY_WORLD[(city, country)], "city")
        MISSES[("city", city, region, country)] += 1
    if region:
        if (region, country) in REGION:
            return (*REGION[(region, country)], "region")
        MISSES[("region", "", region, country)] += 1
    if country:
        if country in COUNTRY:
            return (*COUNTRY[country], "country")
        MISSES[("country", "", "", country)] += 1
    return None
