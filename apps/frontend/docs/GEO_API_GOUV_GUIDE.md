# geo.api.gouv.fr Integration Guide

## 🎉 Excellent Choice!

**geo.api.gouv.fr** is the **best free option** for French administrative data! It's:

- ✅ **Completely FREE** - No API key required
- ✅ **Official** - Maintained by French government (Etalab)
- ✅ **Complete** - All 35,000+ French communes
- ✅ **Rich Data** - Population, boundaries, coordinates, postal codes
- ✅ **GeoJSON Support** - Native geographic data format
- ✅ **No Rate Limits** - (Fair use policy)

## What You Can Get

### Administrative Data

- **Communes** (cities/towns) - All 35,000+ in France
- **Départements** (departments) - 101 including overseas
- **Régions** (regions) - 18 including overseas
- **EPCI** (Intercommunal cooperation) - Metropolitan areas

### Geographic Data

- **Boundaries** (contours) - Precise polygon geometries
- **Centers** - Geographic center point of each commune
- **Town Hall** (mairie) - Coordinates of city hall
- **Bounding Box** - Min/max coordinates

### Statistical Data

- **Population** - Latest official census data
- **Area** - Surface area in hectares
- **Postal Codes** - All codes for each commune
- **INSEE Codes** - Official identification codes

## API Endpoints

### 1. Get All Communes in Department 06

```typescript
import { fetchDepartmentCommunes } from "@/lib/data-sources/geo-api-service";

// Simple: Just names and population
const communes = await fetchDepartmentCommunes("06");

// With center coordinates
const withCenters = await fetchDepartmentCommunes("06", "centre");

// With full boundary polygons
const withBoundaries = await fetchDepartmentCommunes("06", "contour");

console.log(communes);
// [
//   { id: "06088", name: "Nice", population: 340017, ... },
//   { id: "06029", name: "Cannes", population: 74152, ... },
//   { id: "06004", name: "Antibes", population: 74875, ... },
//   ...
// ]
```

### 2. Get Specific Commune Details

```typescript
import {
    fetchCommuneByCode,
    COMMUNE_CODES_06,
} from "@/lib/data-sources/geo-api-service";

// Nice commune
const nice = await fetchCommuneByCode(COMMUNE_CODES_06.NICE, "contour");

console.log(nice);
// {
//   id: "06088",
//   name: "Nice",
//   population: 340017,
//   area: 71.92, // km²
//   coordinates: { lat: 43.7, lon: 7.25 },
//   bounds: [[43.6, 7.2], [43.7, 7.3], ...], // Polygon points
// }
```

### 3. Search by Name

```typescript
import { searchCommunesByName } from "@/lib/data-sources/geo-api-service";

// Find "Nice" (exact or fuzzy match)
const results = await searchCommunesByName("Nice", "population", 5);

// Returns sorted by population (boost=population)
console.log(results);
// [
//   { id: "06088", name: "Nice", population: 340017 },
//   { id: "06161", name: "Nice-sur-Ubaye" (not found - doesn't exist) },
//   ...
// ]
```

### 4. Find by Coordinates

```typescript
import { findCommuneByCoordinates } from "@/lib/data-sources/geo-api-service";

// Which commune contains this point?
const commune = await findCommuneByCoordinates(43.7, 7.25);

console.log(commune);
// { id: "06088", name: "Nice", ... }
```

### 5. Get Bounding Box for API Queries

```typescript
import { getCommuneBoundingBox } from "@/lib/data-sources/geo-api-service";

// Get bbox for fetching buildings from IGN/OSM
const bbox = await getCommuneBoundingBox("06088"); // Nice

console.log(bbox);
// [7.18, 43.64, 7.32, 43.75] // [minLon, minLat, maxLon, maxLat]

// Use with IGN
import { fetchIGNBuildings } from "@/lib/data-sources/ign-service";
const buildings = await fetchIGNBuildings(bbox);
```

### 6. Get Major Cities Only

```typescript
import { getMajorCommunes } from "@/lib/data-sources/geo-api-service";

// Get communes with population > 5000
const majorCities = await getMajorCommunes("06", 5000);

console.log(majorCities);
// [
//   { name: "Nice", population: 340017 },
//   { name: "Antibes", population: 74875 },
//   { name: "Cannes", population: 74152 },
//   { name: "Grasse", population: 51031 },
//   ...
// ] // Sorted by population descending
```

## Complete Example: Map with Real Commune Data

```typescript
// app/map-real/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  fetchDepartmentCommunes,
  getCommuneBoundingBox,
  COMMUNE_CODES_06
} from "@/lib/data-sources/geo-api-service";
import { fetchIGNBuildings } from "@/lib/data-sources/ign-service";
import { fetchEnterprisesInCommune } from "@/lib/data-sources/insee-service";
import Map3DViewer from "@/components/map3d/map-3d-viewer";

export default function RealMapPage() {
  const [communes, setCommunes] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRealData() {
      try {
        // 1. Get all communes in department 06 with boundaries
        const communesData = await fetchDepartmentCommunes("06", "contour");
        setCommunes(communesData);

        // 2. Get bounding box for Nice
        const niceBbox = await getCommuneBoundingBox(COMMUNE_CODES_06.NICE);

        // 3. Fetch buildings in Nice from IGN
        const niceBuildings = await fetchIGNBuildings(niceBbox, 500);

        // 4. Enrich with enterprise data from INSEE
        const enterprises = await fetchEnterprisesInCommune(COMMUNE_CODES_06.NICE);

        // Combine building and enterprise data
        const enrichedBuildings = niceBuildings.map(building => ({
          ...building,
          enterpriseCount: Math.floor(Math.random() * 10), // Simplification
        }));

        setBuildings(enrichedBuildings);
      } catch (error) {
        console.error("Error loading real data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRealData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading real data from geo.api.gouv.fr...</div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <Map3DViewer buildings={buildings} communes={communes} />
    </div>
  );
}
```

## Available Commune Codes (Department 06)

The service includes pre-defined codes for major cities:

```typescript
import { COMMUNE_CODES_06 } from "@/lib/data-sources/geo-api-service";

COMMUNE_CODES_06.NICE; // "06088"
COMMUNE_CODES_06.CANNES; // "06029"
COMMUNE_CODES_06.ANTIBES; // "06004"
COMMUNE_CODES_06.GRASSE; // "06069"
COMMUNE_CODES_06.CAGNES_SUR_MER; // "06027"
COMMUNE_CODES_06.LE_CANNET; // "06030"
COMMUNE_CODES_06.MENTON; // "06083"
COMMUNE_CODES_06.VALLAURIS; // "06155"
COMMUNE_CODES_06.MOUGINS; // "06085"
COMMUNE_CODES_06.VENCE; // "06157"
COMMUNE_CODES_06.MANDELIEU_LA_NAPOULE; // "06079"
COMMUNE_CODES_06.BEAUSOLEIL; // "06012"
COMMUNE_CODES_06.ROQUEBRUNE_CAP_MARTIN; // "06104"
COMMUNE_CODES_06.VILLEFRANCHE_SUR_MER; // "06159"
```

## Combining with Other APIs

### Workflow: geo.api.gouv.fr → IGN → INSEE

```typescript
import {
    fetchCommuneByCode,
    getCommuneBoundingBox,
} from "@/lib/data-sources/geo-api-service";
import { fetchIGNBuildings } from "@/lib/data-sources/ign-service";
import { fetchEnterprisesInCommune } from "@/lib/data-sources/insee-service";

async function getCompleteDataForCommune(communeCode: string) {
    // Step 1: Get commune info (population, area, boundaries)
    const commune = await fetchCommuneByCode(communeCode, "contour");

    // Step 2: Get geographic bounding box
    const bbox = await getCommuneBoundingBox(communeCode);

    // Step 3: Fetch real buildings from IGN
    const buildings = await fetchIGNBuildings(bbox);

    // Step 4: Get enterprise data from INSEE
    const enterprises = await fetchEnterprisesInCommune(communeCode);

    return {
        commune,
        buildings,
        enterprises,
        totalPopulation: commune.population,
        totalEnterprises: enterprises.length,
        buildingDensity: buildings.length / (commune.area || 1),
    };
}

// Use it
const niceData = await getCompleteDataForCommune("06088");
console.log(`Nice has ${niceData.totalPopulation} inhabitants`);
console.log(`${niceData.totalEnterprises} registered businesses`);
console.log(`${niceData.buildings.length} buildings`);
```

## API Response Format Examples

### Commune with Center

```json
{
    "id": "06088",
    "name": "Nice",
    "population": 340017,
    "area": 71.92,
    "enterpriseCount": 0,
    "coordinates": {
        "lat": 43.7031,
        "lon": 7.2661
    },
    "bounds": []
}
```

### Commune with Full Boundary

```json
{
  "id": "06088",
  "name": "Nice",
  "population": 340017,
  "area": 71.92,
  "coordinates": {
    "lat": 43.7031,
    "lon": 7.2661
  },
  "bounds": [
    [43.6509, 7.1833],
    [43.6518, 7.1856],
    ...hundreds more points...
    [43.6509, 7.1833]  // Closed polygon
  ]
}
```

## Performance & Caching

The service includes built-in caching:

- **Communes list**: Cached for 7 days (boundaries rarely change)
- **Commune details**: Cached for 7 days
- **Search results**: Cached for 24 hours
- **Coordinate lookups**: Cached for 24 hours

Cache is stored in memory and cleared on server restart.

## Limitations & Considerations

### What It DOESN'T Provide

- ❌ **Building geometries** - Use IGN or OSM for this
- ❌ **Enterprise data** - Use INSEE Sirene API
- ❌ **Real-time data** - Updated periodically, not live
- ❌ **3D building heights** - Use IGN BD TOPO

### Best Practices

1. **Always cache results** - The service is free but respect fair use
2. **Batch requests** - Get all communes at once rather than one by one
3. **Choose geometry wisely** - "centre" is much lighter than "contour"
4. **Use INSEE codes** - More reliable than names for lookups

## Comparison: geo.api.gouv.fr vs IGN vs OSM

| Feature                       | geo.api.gouv.fr  | IGN Géoportail | OpenStreetMap     |
| ----------------------------- | ---------------- | -------------- | ----------------- |
| **API Key**                   | ❌ Not needed    | ✅ Required    | ❌ Not needed     |
| **Rate Limits**               | Fair use         | 2M/year        | Fair use (~1-2/s) |
| **Administrative Boundaries** | ✅ **Excellent** | ✅ Good        | ⚠️ Variable       |
| **Building Geometries**       | ❌ No            | ✅ **Best**    | ✅ Good           |
| **Population Data**           | ✅ **Official**  | ❌ No          | ❌ No             |
| **Update Frequency**          | Quarterly        | Annual         | Real-time         |
| **Coverage**                  | 🇫🇷 France only   | 🇫🇷 France only | 🌍 Worldwide      |
| **Ease of Use**               | ✅ **Excellent** | ⚠️ Complex     | ⚠️ Complex        |

## Recommendation

**Use geo.api.gouv.fr for**:

- ✅ Getting list of communes
- ✅ Population statistics
- ✅ Administrative boundaries
- ✅ Determining which commune contains a point
- ✅ Getting bounding boxes for other API queries

**Combine with**:

- **IGN** - Building geometries and heights
- **INSEE** - Enterprise and employment data
- **OSM** - POIs and real-time updates

## Summary

geo.api.gouv.fr is **perfect** for your project! It provides exactly what you need for:

1. ✅ **Commune Selection** - Let users pick from real communes
2. ✅ **Geographic Context** - Show department boundaries
3. ✅ **Population Data** - Display real demographic information
4. ✅ **Spatial Queries** - "Which commune am I looking at?"
5. ✅ **API Coordination** - Get bounding boxes for IGN/OSM requests

**No API key, no limits, official government data - use it!** 🎉
