# 🗺️ Map Integration - Quick Reference

## 🚀 Fastest Way to Get Started

```typescript
// 1. Import the hook
import { usePredefinedCities, useSceneCommunes } from "@/lib/hooks/use-commune-data";

// 2. Load cities in your component
function MyMap() {
  const { cities, loading } = usePredefinedCities();
  const sceneCommunes = useSceneCommunes(cities);

  if (loading) return <div>Loading...</div>;

  return <Map3DScene communes={sceneCommunes} />;
}
```

That's it! You now have the 14 major cities (Nice, Cannes, etc.) loaded with real data from geo.api.gouv.fr.

---

## 📦 Most Common Functions

### Load Pre-defined Cities (Fastest)

```typescript
const { cities, loading, error } = usePredefinedCities();
// Returns: Nice, Cannes, Antibes, Grasse, etc. (14 cities)
```

### Load Major Communes by Population

```typescript
const { cities, loading } = useMajorCities(10000);
// Returns: All communes with > 10,000 inhabitants
```

### Load All Communes in Dept 06

```typescript
const { communes, loading } = useDepartmentCommunes();
// Returns: All 163 communes
```

### Load Specific Commune

```typescript
const { commune, loading } = useCommune("06088"); // Nice
```

### Search by Name

```typescript
const { results, search } = useSearchCommunes();
search("Nice"); // Find communes matching "Nice"
```

### Handle Selection with Camera Focus

```typescript
const { selectCommune, commune, cameraData } = useCommuneSelection();
selectCommune("06088"); // Select Nice & get camera position
```

---

## 🎯 Common Use Cases

### Case 1: Display Main Cities on Map

```typescript
function CityMap() {
  const { cities } = usePredefinedCities();
  const sceneCommunes = useSceneCommunes(cities);

  return <Map3DScene communes={sceneCommunes} />;
}
```

### Case 2: Search and Focus

```typescript
function SearchMap() {
  const { results, search } = useSearchCommunes();
  const { selectCommune } = useCommuneSelection();

  return (
    <>
      <input onChange={(e) => search(e.target.value)} />
      {results.map(c => (
        <button onClick={() => selectCommune(c.id)}>
          {c.name}
        </button>
      ))}
    </>
  );
}
```

### Case 3: AI Query → Map Update

```typescript
async function handleAIQuery(cityName: string) {
    // User asks: "Show me Nice"
    const results = await searchCommunes(cityName, 1);
    const commune = results[0];

    // Focus camera on it
    const camera = await getCommuneCameraPosition(commune.id);

    // Update map state
    updateMapView(commune, camera);
}
```

### Case 4: Combine with Buildings

```typescript
import { getCommuneBoundingBox } from "@/lib/map-integration/geo-data-loader";
import { fetchIGNBuildings } from "@/lib/data-sources/ign-service";

async function loadFullCommuneData(code: string) {
    // 1. Get commune from geo.api.gouv.fr (FREE!)
    const commune = await loadCommuneByCode(code);

    // 2. Get bbox for other API calls
    const bbox = await getCommuneBoundingBox(code);

    // 3. Get buildings from IGN
    const buildings = await fetchIGNBuildings(bbox);

    return { commune, buildings };
}
```

---

## 🗂️ Files You Created

| File                                          | Purpose                  | Lines |
| --------------------------------------------- | ------------------------ | ----- |
| `lib/map-integration/geo-data-loader.ts`      | Core integration service | 380   |
| `lib/hooks/use-commune-data.ts`               | React hooks              | 270   |
| `components/map3d/map-3d-viewer-enhanced.tsx` | Example component        | 200   |
| `docs/MAP_INTEGRATION_GUIDE.md`               | Complete guide           | 600+  |

---

## 🎨 What You Need to Do Next

### ✅ Already Done

- Data loading functions ✓
- React hooks ✓
- Coordinate transformation ✓
- Camera positioning ✓
- Caching ✓
- Documentation ✓

### 📝 To Do (Update Existing Components)

#### 1. Update `Map3DScene` to Accept Communes

```typescript
// In map-3d-scene.tsx
interface Map3DSceneProps {
    buildings: BuildingData[];
    communes?: SceneCommune[]; // ADD THIS
    focusCamera?: { position: Vector3; target: Vector3 } | null; // ADD THIS
}
```

#### 2. Create `CommuneBoundary` Component

```typescript
// Create: components/map3d/commune-boundary.tsx
// See MAP_INTEGRATION_GUIDE.md for full code
```

#### 3. Update Your Page to Use New Hooks

```typescript
// In your page.tsx
import { usePredefinedCities, useSceneCommunes } from "@/lib/hooks/use-commune-data";

export default function MapPage() {
  const { cities, loading } = usePredefinedCities();
  const sceneCommunes = useSceneCommunes(cities);

  return <Map3DViewer communes={sceneCommunes} />;
}
```

---

## 🔗 Quick Links

- **Full Guide**: `docs/MAP_INTEGRATION_GUIDE.md`
- **API Reference**: `docs/GEO_API_GOUV_GUIDE.md`
- **All APIs Setup**: `docs/REAL_DATA_QUICKSTART.md`

---

## 💡 Pro Tips

### Performance

```typescript
// Start with predefined cities (fast)
const { cities } = usePredefinedCities();

// Load more detail on user action
const { communes } = useDepartmentCommunes({
  autoLoad: false // Don't auto-load
});

// Manual trigger
<button onClick={reload}>Load All Communes</button>
```

### Debugging

```typescript
// Log what's loaded
const { cities } = usePredefinedCities();
console.log(
    "Loaded cities:",
    cities.map((c) => c.name),
);

// Check coordinates
import { geoToScene } from "@/lib/map-integration/geo-data-loader";
const pos = geoToScene({ lat: 43.7102, lon: 7.262 });
console.log("Nice position:", pos);
```

### Caching

All data is automatically cached:

- Commune data: 7 days
- Search results: 24 hours
- No manual cache management needed!

---

## 🆘 Need Help?

1. **Check the full guide**: `docs/MAP_INTEGRATION_GUIDE.md`
2. **See examples**: Look at `map-3d-viewer-enhanced.tsx`
3. **Test functions**: Use browser console:
    ```typescript
    import { loadPredefinedCities } from "@/lib/map-integration/geo-data-loader";
    const cities = await loadPredefinedCities();
    console.log(cities);
    ```

---

## 📊 Quick Stats

- **APIs**: 4 total (geo.api.gouv.fr, IGN, INSEE, OSM)
- **Free APIs**: 2 (geo.api.gouv.fr ✅, OSM ✅)
- **Pre-defined cities**: 14
- **Total communes**: 163
- **Functions created**: 25+
- **React hooks**: 8
- **No API key needed**: geo.api.gouv.fr ✅

---

**You're ready to integrate! Start with `usePredefinedCities()` 🚀**
