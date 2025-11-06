# Map Integration Guide - geo.api.gouv.fr → 3D Map

This guide shows you how to integrate real commune data from **geo.api.gouv.fr** into your 3D map visualization.

## 📚 Overview

We've created a complete integration layer that:

- ✅ Fetches commune data from geo.api.gouv.fr (FREE, no API key!)
- ✅ Transforms geographic coordinates to 3D scene coordinates
- ✅ Provides React hooks for easy data loading
- ✅ Includes camera positioning and focus utilities
- ✅ Caches data for performance

## 🗂️ Files Created

### 1. Core Integration Service

**`lib/map-integration/geo-data-loader.ts`** (380 lines)

- Main service that bridges geo.api.gouv.fr and your 3D map
- Coordinate transformation (WGS84 → Three.js Vector3)
- Commune loading functions for different use cases
- Camera positioning utilities

### 2. React Hooks

**`lib/hooks/use-commune-data.ts`** (270 lines)

- Easy-to-use hooks for React components
- Handles loading states, errors, caching
- Auto-reload and manual refresh options

### 3. Enhanced Viewer Component

**`components/map3d/map-3d-viewer-enhanced.tsx`** (200 lines)

- Example component showing full integration
- View mode switching (predefined cities / major communes)
- Commune selection and info display
- Loading states and transitions

## 🚀 Quick Start

### Step 1: Load Commune Data in Your Component

```typescript
import { usePredefinedCities, useSceneCommunes } from "@/lib/hooks/use-commune-data";

function MyMapComponent() {
  // Load the 14 pre-defined major cities (Nice, Cannes, etc.)
  const { cities, loading, error } = usePredefinedCities();

  // Convert to 3D scene format
  const sceneCommunes = useSceneCommunes(cities);

  if (loading) return <div>Loading communes...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Map3DScene communes={sceneCommunes} />
  );
}
```

### Step 2: Add Commune Boundaries to Your 3D Scene

You'll need to update `Map3DScene` to accept and render communes:

```typescript
// In map-3d-scene.tsx
import { SceneCommune } from "@/types/map";

interface Map3DSceneProps {
  buildings: BuildingData[];
  communes?: SceneCommune[]; // Add this
}

function SceneContent({ buildings, communes }: Map3DSceneProps) {
  return (
    <>
      {/* Existing building rendering */}
      {buildings.map((building) => (
        <Building key={building.id} data={building} />
      ))}

      {/* NEW: Render commune boundaries */}
      {communes?.map((commune) => (
        <CommuneBoundary key={commune.id} data={commune} />
      ))}
    </>
  );
}
```

### Step 3: Create CommuneBoundary Component

```typescript
// components/map3d/commune-boundary.tsx
import { SceneCommune } from "@/types/map";
import { Shape, ExtrudeGeometry } from "three";

interface Props {
  data: SceneCommune;
}

export function CommuneBoundary({ data }: Props) {
  const { boundary, userData } = data;

  // Create shape from boundary points
  const shape = new Shape();
  if (boundary.length > 0) {
    shape.moveTo(boundary[0].x, boundary[0].z);
    for (let i = 1; i < boundary.length; i++) {
      shape.lineTo(boundary[i].x, boundary[i].z);
    }
    shape.closePath();
  }

  return (
    <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <shapeGeometry args={[shape]} />
      <meshBasicMaterial
        color="#3b82f6"
        transparent
        opacity={0.2}
        depthWrite={false}
      />
      <lineSegments>
        <edgesGeometry args={[new ShapeGeometry(shape)]} />
        <lineBasicMaterial color="#60a5fa" />
      </lineSegments>
    </mesh>
  );
}
```

## 📦 Available Functions

### Loading Functions

#### `loadDepartmentCommunes(options)`

Load all 163 communes in département 06.

```typescript
import { loadDepartmentCommunes } from "@/lib/map-integration/geo-data-loader";

// All communes with geometry
const communes = await loadDepartmentCommunes({
    includeGeometry: true,
});

// Filter by population
const bigCommunes = await loadDepartmentCommunes({
    minPopulation: 10000,
});
```

#### `loadMajorCommunes(minPopulation)`

Load communes above population threshold.

```typescript
// Cities with > 10,000 inhabitants
const cities = await loadMajorCommunes(10000);
```

#### `loadPredefinedCities()`

Load the 14 pre-defined major cities (Nice, Cannes, Antibes, etc.).

```typescript
const majorCities = await loadPredefinedCities();
// Returns: Nice, Cannes, Antibes, Grasse, Cagnes-sur-Mer, etc.
```

#### `loadCommuneByCode(code)`

Load a specific commune by INSEE code.

```typescript
const nice = await loadCommuneByCode("06088", true);
console.log(nice.name); // "Nice"
console.log(nice.population); // ~340,000
```

#### `searchCommunes(query, limit)`

Search communes by name.

```typescript
const results = await searchCommunes("Nice", 5);
// Returns: Nice, Nice-la-Ravoire, etc.
```

### Coordinate Transformation

#### `geoToScene(coordinate)`

Convert lat/lon to 3D scene position.

```typescript
import { geoToScene } from "@/lib/map-integration/geo-data-loader";

const position = geoToScene({ lat: 43.7102, lon: 7.262 });
// Returns: Vector3(x, 0, z) for use in Three.js
```

#### `sceneToGeo(position)`

Convert 3D scene position back to lat/lon.

```typescript
const geoCoord = sceneToGeo(new Vector3(100, 0, -50));
// Returns: { lat: 43.xxx, lon: 7.xxx }
```

### Camera Utilities

#### `getCommuneCameraPosition(communeCode)`

Calculate optimal camera position to view a commune.

```typescript
const camera = await getCommuneCameraPosition("06088");
if (camera) {
    controls.target.copy(camera.target);
    camera.position.copy(camera.position);
}
```

#### `getCommuneSceneBounds(communeCode)`

Get 3D bounding box for a commune.

```typescript
const bounds = await getCommuneSceneBounds("06088");
if (bounds) {
    console.log("Min:", bounds.min); // Vector3
    console.log("Max:", bounds.max); // Vector3
}
```

### Data Transformation

#### `communeToSceneCommune(commune)`

Convert CommuneData to SceneCommune for rendering.

```typescript
const commune = await loadCommuneByCode("06088");
const sceneCommune = communeToSceneCommune(commune);
// Now has: boundary (Vector3[]), center (Vector3), userData
```

#### `communesToSceneCommunes(communes)`

Batch convert multiple communes.

```typescript
const communes = await loadMajorCommunes(5000);
const sceneCommunes = communesToSceneCommunes(communes);
// Ready to render in 3D scene!
```

## 🎣 React Hooks

### `usePredefinedCities(autoLoad)`

Load pre-defined major cities.

```typescript
const { cities, loading, error, reload } = usePredefinedCities();

// Manual reload
<button onClick={reload}>Refresh Cities</button>
```

### `useMajorCities(minPopulation, autoLoad)`

Load communes above population threshold.

```typescript
const { cities, loading, error } = useMajorCities(10000);
```

### `useDepartmentCommunes(options)`

Load all communes with options.

```typescript
const { communes, loading, error, reload } = useDepartmentCommunes({
    includeGeometry: true,
    minPopulation: 5000,
    autoLoad: true,
});
```

### `useCommune(communeCode, includeGeometry)`

Load a specific commune.

```typescript
const { commune, loading, error } = useCommune("06088", true);

if (commune) {
    console.log(commune.name); // "Nice"
    console.log(commune.population); // ~340,000
}
```

### `useCommuneSelection()`

Handle commune selection with camera focus.

```typescript
const {
  selectedCommune,
  commune,
  cameraData,
  loading,
  selectCommune,
  clearSelection
} = useCommuneSelection();

// Select a commune
<button onClick={() => selectCommune("06088")}>Focus on Nice</button>

// Use camera data
useEffect(() => {
  if (cameraData) {
    controls.target.copy(cameraData.target);
    camera.position.copy(cameraData.position);
  }
}, [cameraData]);
```

### `useSearchCommunes()`

Search communes with query.

```typescript
const { results, loading, error, search, clearResults } = useSearchCommunes();

const handleSearch = (query: string) => {
  search(query, 10);
};

// Display results
{results.map(commune => (
  <div key={commune.id}>{commune.name}</div>
))}
```

### `useSceneCommunes(communes)`

Convert CommuneData[] to SceneCommune[].

```typescript
const { cities } = usePredefinedCities();
const sceneCommunes = useSceneCommunes(cities);

// Pass to 3D scene
<Map3DScene communes={sceneCommunes} />
```

## 🎨 Integration Patterns

### Pattern 1: Simple City Display

```typescript
function SimpleMap() {
  const { cities, loading } = usePredefinedCities();
  const sceneCommunes = useSceneCommunes(cities);

  return (
    <Map3DScene
      buildings={[]}
      communes={sceneCommunes}
    />
  );
}
```

### Pattern 2: Progressive Loading

```typescript
function ProgressiveMap() {
  const [detail, setDetail] = useState<'low' | 'medium' | 'high'>('low');

  // Load different detail levels
  const { cities: majorCities } = usePredefinedCities(detail === 'low');
  const { cities: mediumCities } = useMajorCities(5000, detail === 'medium');
  const { communes: allCommunes } = useDepartmentCommunes({
    autoLoad: detail === 'high'
  });

  const communes = detail === 'low' ? majorCities :
                   detail === 'medium' ? mediumCities :
                   allCommunes;

  return <Map3DScene communes={useSceneCommunes(communes)} />;
}
```

### Pattern 3: Search and Focus

```typescript
function SearchableMap() {
  const { results, search } = useSearchCommunes();
  const { selectCommune, cameraData } = useCommuneSelection();

  return (
    <div>
      <input
        type="text"
        onChange={(e) => search(e.target.value)}
        placeholder="Rechercher une commune..."
      />
      <div>
        {results.map(commune => (
          <button onClick={() => selectCommune(commune.id)}>
            {commune.name}
          </button>
        ))}
      </div>
      <Map3DScene focusCamera={cameraData} />
    </div>
  );
}
```

### Pattern 4: AI Query Integration

```typescript
async function handleAIQuery(query: string) {
    // Example: "Show me Nice and Cannes"
    const communes = await searchCommunes("Nice Cannes", 2);
    const sceneCommunes = communesToSceneCommunes(communes);

    // Focus on first result
    const cameraPos = await getCommuneCameraPosition(communes[0].id);

    // Update map
    setMapCommunes(sceneCommunes);
    setMapCamera(cameraPos);
}
```

## 🔗 Integration with Existing APIs

### Combine with IGN Buildings

```typescript
import { fetchIGNBuildings } from "@/lib/data-sources/ign-service";
import { getCommuneBoundingBox } from "@/lib/map-integration/geo-data-loader";

async function loadCommuneData(communeCode: string) {
    // 1. Get commune boundaries from geo.api.gouv.fr
    const commune = await loadCommuneByCode(communeCode);

    // 2. Get bbox for API queries
    const bbox = await getCommuneBoundingBox(communeCode);

    // 3. Fetch buildings from IGN using bbox
    const buildings = await fetchIGNBuildings(bbox);

    return { commune, buildings };
}
```

### Combine with INSEE Enterprises

```typescript
import { fetchEnterprisesInCommune } from "@/lib/data-sources/insee-service";

async function loadCommuneWithEnterprises(communeCode: string) {
    const [commune, enterprises] = await Promise.all([
        loadCommuneByCode(communeCode),
        fetchEnterprisesInCommune(communeCode),
    ]);

    return {
        ...commune,
        enterpriseCount: enterprises.length,
    };
}
```

## 🎯 Pre-defined Cities

The following 14 major cities are pre-configured with codes:

| City                  | INSEE Code | Population |
| --------------------- | ---------- | ---------- |
| Nice                  | 06088      | ~340,000   |
| Cannes                | 06029      | ~74,000    |
| Antibes               | 06004      | ~76,000    |
| Grasse                | 06069      | ~51,000    |
| Cagnes-sur-Mer        | 06027      | ~51,000    |
| Le Cannet             | 06030      | ~42,000    |
| Menton                | 06083      | ~29,000    |
| Vallauris             | 06155      | ~27,000    |
| Mougins               | 06085      | ~19,000    |
| Vence                 | 06157      | ~19,000    |
| Mandelieu-la-Napoule  | 06079      | ~22,000    |
| Beausoleil            | 06012      | ~14,000    |
| Roquebrune-Cap-Martin | 06104      | ~13,000    |
| Villefranche-sur-Mer  | 06159      | ~6,000     |

Access via:

```typescript
import { COMMUNE_CODES_06 } from "@/lib/data-sources/geo-api-service";

const niceCode = COMMUNE_CODES_06.NICE; // "06088"
```

## 📊 Performance Tips

### 1. Progressive Loading

Load data in stages based on user interaction:

- **Initial**: Pre-defined cities (14 communes, fast)
- **User zoom**: Major cities > 5k pop (50-60 communes)
- **Detail view**: All communes (163 communes)

### 2. Geometry on Demand

Don't load geometry for all communes at once:

```typescript
// Initial load: centers only
const communes = await loadDepartmentCommunes({ includeGeometry: false });

// Load geometry when needed
const withGeometry = await loadCommuneByCode(code, true);
```

### 3. Caching

All functions use automatic caching:

- Commune data: 7 days
- Search results: 24 hours
- Coordinates: 24 hours

### 4. Batch Requests

Load multiple communes in parallel:

```typescript
const codes = ["06088", "06029", "06004"];
const communes = await Promise.all(
    codes.map((code) => loadCommuneByCode(code)),
);
```

## 🐛 Debugging

Enable cache logging:

```typescript
// In geo-data-loader.ts
console.log("Cache hit:", cacheKey);
console.log("Loading:", communes.length, "communes");
```

Check coordinate transformation:

```typescript
const pos = geoToScene({ lat: 43.7102, lon: 7.262 });
console.log("3D position:", pos);

const geo = sceneToGeo(pos);
console.log("Back to geo:", geo); // Should match original
```

## 🎓 Next Steps

1. **Update Map3DScene** to accept and render `communes` prop
2. **Create CommuneBoundary component** to display commune shapes
3. **Add click handlers** to select communes on the map
4. **Integrate with AI queries** to respond to user questions about communes
5. **Combine with building data** for complete visualization

## 📚 Related Documentation

- [geo.api.gouv.fr Guide](./GEO_API_GOUV_GUIDE.md) - Complete API reference
- [Real Data Quickstart](./REAL_DATA_QUICKSTART.md) - All APIs setup
- [AI Integration](./AI_INTEGRATION.md) - Connect queries to map

## ✅ Summary

You now have:

- ✅ **380 lines** of integration code
- ✅ **270 lines** of React hooks
- ✅ **15+ utility functions**
- ✅ **8 React hooks** for easy data loading
- ✅ Complete coordinate transformation
- ✅ Camera positioning utilities
- ✅ Search and selection support
- ✅ Automatic caching

Start with `usePredefinedCities()` to display the 14 major cities, then expand from there!
