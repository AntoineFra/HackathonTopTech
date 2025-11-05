# 🗺️ Map Integration - START HERE

## ✅ Setup Complete!

All integration code is **ready to use**. Start implementing in **3 simple steps**:

---

## 🚀 Step 1: Import the Hook

```typescript
import {
    usePredefinedCities,
    useSceneCommunes,
} from "@/lib/hooks/use-commune-data";
```

---

## 🚀 Step 2: Use in Your Component

```typescript
function MyMap() {
  const { cities, loading } = usePredefinedCities();
  const sceneCommunes = useSceneCommunes(cities);

  if (loading) return <div>Loading...</div>;

  return <Map3DScene communes={sceneCommunes} />;
}
```

---

## 🚀 Step 3: That's It!

You now have **14 major cities** loaded from **geo.api.gouv.fr** (FREE, no API key needed).

---

## 📚 Documentation

| File                                     | Purpose                         |
| ---------------------------------------- | ------------------------------- |
| **CALL_FUNCTIONS_SETUP.md**              | Quick reference - all functions |
| **docs/MAP_INTEGRATION_QUICKSTART.md**   | Common use cases                |
| **docs/MAP_INTEGRATION_GUIDE.md**        | Complete guide                  |
| **docs/MAP_ARCHITECTURE.md**             | System architecture             |
| **examples/minimal-map-integration.tsx** | Copy-paste examples             |

---

## 💡 Quick Examples

### Load Major Cities

```typescript
const { cities } = usePredefinedCities();
// Returns: Nice, Cannes, Antibes, etc. (14 cities)
```

### Search by Name

```typescript
const { results, search } = useSearchCommunes();
search("Nice");
```

### Get Specific Commune

```typescript
const { commune } = useCommune("06088"); // Nice
```

### Convert Coordinates

```typescript
import { geoToScene } from "@/lib/map-integration/geo-data-loader";
const pos = geoToScene({ lat: 43.7, lon: 7.2 });
```

---

## 🎯 What You Can Do Now

✅ Load 14 major cities (instant)
✅ Load all 163 communes
✅ Search communes by name
✅ Get specific commune data
✅ Convert lat/lon ↔ Vector3
✅ Get camera positions
✅ Get bounding boxes
✅ Combine with buildings/enterprises

---

## 📦 Files Created

- `lib/map-integration/geo-data-loader.ts` (380 lines)
- `lib/hooks/use-commune-data.ts` (270 lines)
- `examples/minimal-map-integration.tsx` (250 lines)
- `docs/MAP_INTEGRATION_*.md` (1500+ lines)

**Total: ~2,400 lines ready to use!**

---

## 🎉 Start Building!

**Simplest possible code:**

```typescript
const { cities } = usePredefinedCities();
console.log(`Loaded ${cities.length} cities!`);
```

**Need help?** Read `CALL_FUNCTIONS_SETUP.md`

**Everything works!** 🚀
