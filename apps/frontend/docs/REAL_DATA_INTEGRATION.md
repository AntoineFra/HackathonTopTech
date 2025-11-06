# Guide d'intégration de données réelles

## 🗺️ Sources de données disponibles

### 1. IGN Géoportail (Institut Géographique National)

- **API WFS** : Données vectorielles (bâtiments, routes, limites administratives)
- **API WMTS** : Tuiles cartographiques raster
- **Géoplateforme** : Nouvelle API REST moderne
- **Documentation** : https://geoservices.ign.fr/

### 2. INSEE (Institut National de la Statistique)

- **API Sirene** : Données d'entreprises (SIREN, SIRET)
- **API Données locales** : Statistiques démographiques, emploi
- **Documentation** : https://api.insee.fr/

### 3. OpenStreetMap (OSM)

- **Overpass API** : Requêtes personnalisées sur données OSM
- **Nominatim** : Géocodage et recherche d'adresses
- **OSM Buildings** : Données 3D de bâtiments
- **Documentation** : https://wiki.openstreetmap.org/wiki/API

### 4. Data.gouv.fr

- **API CKAN** : Accès aux jeux de données publics
- **Base Adresse Nationale (BAN)** : Adresses géolocalisées
- **Documentation** : https://www.data.gouv.fr/fr/apidoc/

## 📋 Architecture d'intégration

```
lib/
  data-sources/
    ign-service.ts          # IGN Géoportail API
    insee-service.ts        # INSEE API (Sirene, statistiques)
    osm-service.ts          # OpenStreetMap Overpass API
    datagouv-service.ts     # Data.gouv.fr API
    cache-service.ts        # Système de cache local

  data-processors/
    building-processor.ts   # Traitement données bâtiments
    commune-processor.ts    # Traitement données communes
    enterprise-processor.ts # Traitement données entreprises

  hooks/
    use-real-data.ts        # Hook React pour charger données réelles
```

## 🔑 Authentification et clés API

### Obtention des clés

**1. IGN Géoportail**

```bash
# Créer un compte sur https://geoservices.ign.fr/
# Créer une clé API gratuite
# Limites : 2M requêtes/jour (gratuit)
```

**2. INSEE**

```bash
# S'inscrire sur https://api.insee.fr/
# Demander l'accès à l'API Sirene
# OAuth 2.0 requis
```

**3. OpenStreetMap**

```bash
# Pas de clé requise pour Overpass API
# Respecter la politique d'usage équitable
# Max 2 requêtes simultanées
```

### Configuration dans Next.js

Créer `.env.local` :

```bash
# IGN
NEXT_PUBLIC_IGN_API_KEY=your_ign_key_here

# INSEE
INSEE_CONSUMER_KEY=your_insee_key
INSEE_CONSUMER_SECRET=your_insee_secret

# OpenStreetMap (optionnel, pas de clé requise)
NEXT_PUBLIC_OSM_USER_AGENT=YourApp/1.0

# Cache
NEXT_PUBLIC_ENABLE_CACHE=true
NEXT_PUBLIC_CACHE_DURATION=86400 # 24h en secondes
```

## 🏗️ Exemples d'implémentation

### 1. Service IGN - Bâtiments BD TOPO

```typescript
// lib/data-sources/ign-service.ts
import { GeoJSON, BuildingData } from "@/types/map";

const IGN_WFS_URL = "https://wxs.ign.fr/";
const IGN_API_KEY = process.env.NEXT_PUBLIC_IGN_API_KEY;

export async function fetchIGNBuildings(
    bbox: [number, number, number, number], // [minLon, minLat, maxLon, maxLat]
): Promise<BuildingData[]> {
    const [minLon, minLat, maxLon, maxLat] = bbox;

    const params = new URLSearchParams({
        service: "WFS",
        version: "2.0.0",
        request: "GetFeature",
        typename: "BDTOPO_V3:batiment", // Couche bâtiments
        outputFormat: "application/json",
        srsname: "EPSG:4326", // WGS84
        bbox: `${minLat},${minLon},${maxLat},${maxLon}`,
        count: "1000", // Limite de résultats
    });

    const url = `${IGN_WFS_URL}${IGN_API_KEY}/geoportail/wfs?${params}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("IGN API error");

        const geojson: GeoJSON = await response.json();

        return geojson.features.map((feature, index) => {
            const coords = feature.geometry.coordinates[0];
            const center = calculateCenter(coords);

            return {
                id: feature.properties.id || `ign-${index}`,
                name: feature.properties.nom || undefined,
                commune: feature.properties.commune || "Unknown",
                coordinates: { lat: center[1], lon: center[0] },
                footprint: coords,
                height: feature.properties.hauteur || 10,
                floors: Math.floor((feature.properties.hauteur || 10) / 3),
                type: mapIGNType(feature.properties.nature),
                metadata: {
                    source: "IGN BD TOPO",
                    ign_id: feature.properties.id,
                    nature: feature.properties.nature,
                },
            };
        });
    } catch (error) {
        console.error("Error fetching IGN buildings:", error);
        return [];
    }
}

function mapIGNType(nature: string): string {
    const mapping: Record<string, string> = {
        "Bâtiment industriel": "industrial",
        "Bâtiment commercial": "commercial",
        "Bâtiment religieux": "other",
        Construction: "residential",
    };
    return mapping[nature] || "residential";
}

function calculateCenter(coords: number[][]): [number, number] {
    const sum = coords.reduce(
        (acc, [lon, lat]) => [acc[0] + lon, acc[1] + lat],
        [0, 0],
    );
    return [sum[0] / coords.length, sum[1] / coords.length];
}
```

### 2. Service INSEE - Données d'entreprises

```typescript
// lib/data-sources/insee-service.ts

interface INSEEToken {
    access_token: string;
    expires_at: number;
}

let tokenCache: INSEEToken | null = null;

async function getINSEEToken(): Promise<string> {
    if (tokenCache && tokenCache.expires_at > Date.now()) {
        return tokenCache.access_token;
    }

    const credentials = Buffer.from(
        `${process.env.INSEE_CONSUMER_KEY}:${process.env.INSEE_CONSUMER_SECRET}`,
    ).toString("base64");

    const response = await fetch("https://api.insee.fr/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    const data = await response.json();

    tokenCache = {
        access_token: data.access_token,
        expires_at: Date.now() + (data.expires_in - 60) * 1000,
    };

    return data.access_token;
}

export async function fetchEnterprisesInCommune(communeCode: string): Promise<{
    count: number;
    sectors: Record<string, number>;
    enterprises: Array<{ siret: string; name: string; sector: string }>;
}> {
    const token = await getINSEEToken();

    const url = `https://api.insee.fr/entreprises/sirene/V3/siret?q=codeCommuneEtablissement:${communeCode}&nombre=1000`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("INSEE API error");
    }

    const data = await response.json();
    const establishments = data.etablissements || [];

    const sectors: Record<string, number> = {};
    const enterprises = establishments.map((etab: any) => {
        const sector = mapAPEtoSector(etab.uniteLegale?.activitePrincipale);
        sectors[sector] = (sectors[sector] || 0) + 1;

        return {
            siret: etab.siret,
            name: etab.uniteLegale?.denominationUniteLegale || "Entreprise",
            sector,
        };
    });

    return {
        count: establishments.length,
        sectors,
        enterprises,
    };
}

function mapAPEtoSector(ape?: string): string {
    if (!ape) return "Other";

    const code = parseInt(ape.substring(0, 2));

    if (code >= 1 && code <= 3) return "Manufacturing";
    if (code >= 5 && code <= 9) return "Manufacturing";
    if (code >= 10 && code <= 33) return "Manufacturing";
    if (code >= 35 && code <= 39) return "Services";
    if (code >= 41 && code <= 43) return "Real Estate";
    if (code >= 45 && code <= 47) return "Retail";
    if (code >= 49 && code <= 53) return "Services";
    if (code >= 55 && code <= 56) return "Tourism";
    if (code >= 58 && code <= 63) return "Technology";
    if (code >= 64 && code <= 66) return "Finance";
    if (code >= 68 && code <= 68) return "Real Estate";
    if (code >= 69 && code <= 75) return "Services";
    if (code >= 77 && code <= 82) return "Services";
    if (code >= 84 && code <= 84) return "Services";
    if (code >= 85 && code <= 85) return "Services";
    if (code >= 86 && code <= 88) return "Healthcare";

    return "Other";
}
```

### 3. Service OpenStreetMap - Overpass API

```typescript
// lib/data-sources/osm-service.ts

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export async function fetchOSMBuildings(
    bbox: [number, number, number, number],
): Promise<BuildingData[]> {
    const [minLon, minLat, maxLon, maxLat] = bbox;

    // Requête Overpass QL pour récupérer les bâtiments
    const query = `
    [out:json][timeout:25];
    (
      way["building"](${minLat},${minLon},${maxLat},${maxLon});
      relation["building"](${minLat},${minLon},${maxLat},${maxLon});
    );
    out body;
    >;
    out skel qt;
  `;

    try {
        const response = await fetch(OVERPASS_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent":
                    process.env.NEXT_PUBLIC_OSM_USER_AGENT || "YourApp/1.0",
            },
            body: `data=${encodeURIComponent(query)}`,
        });

        if (!response.ok) throw new Error("Overpass API error");

        const data = await response.json();

        return processOSMData(data);
    } catch (error) {
        console.error("Error fetching OSM buildings:", error);
        return [];
    }
}

function processOSMData(data: any): BuildingData[] {
    const nodes: Record<string, { lat: number; lon: number }> = {};

    // Index nodes
    data.elements
        .filter((el: any) => el.type === "node")
        .forEach((node: any) => {
            nodes[node.id] = { lat: node.lat, lon: node.lon };
        });

    // Process buildings (ways)
    return data.elements
        .filter((el: any) => el.type === "way" && el.tags?.building)
        .map((way: any, index: number) => {
            const coords = way.nodes
                .map((nodeId: number) => nodes[nodeId])
                .filter(Boolean)
                .map((node: any) => [node.lon, node.lat]);

            if (coords.length === 0) return null;

            const center = calculateCenter(coords);
            const height = parseFloat(
                way.tags["height"] || way.tags["building:levels"] * 3 || "10",
            );

            return {
                id: `osm-${way.id}`,
                name: way.tags.name,
                commune: way.tags["addr:city"] || "Unknown",
                coordinates: { lat: center[1], lon: center[0] },
                footprint: coords,
                height,
                floors: parseInt(
                    way.tags["building:levels"] ||
                        String(Math.floor(height / 3)),
                ),
                type: mapOSMBuildingType(way.tags.building),
                metadata: {
                    source: "OpenStreetMap",
                    osm_id: way.id,
                    amenity: way.tags.amenity,
                    shop: way.tags.shop,
                },
            };
        })
        .filter(Boolean) as BuildingData[];
}

function mapOSMBuildingType(building: string): string {
    const mapping: Record<string, string> = {
        apartments: "residential",
        house: "residential",
        residential: "residential",
        commercial: "commercial",
        retail: "commercial",
        industrial: "industrial",
        office: "office",
        hotel: "commercial",
        yes: "residential",
    };
    return mapping[building] || "other";
}
```

### 4. Hook React pour charger les données réelles

```typescript
// lib/hooks/use-real-data.ts
import { useState, useEffect } from "react";
import { BuildingData, CommuneData } from "@/types/map";
import { fetchIGNBuildings } from "@/lib/data-sources/ign-service";
import { fetchOSMBuildings } from "@/lib/data-sources/osm-service";
import { fetchEnterprisesInCommune } from "@/lib/data-sources/insee-service";

export function useRealBuildingData(
    bbox: [number, number, number, number],
    source: "ign" | "osm" | "mock" = "mock",
) {
    const [buildings, setBuildings] = useState<BuildingData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (source === "mock") return;

        const loadData = async () => {
            setLoading(true);
            setError(null);

            try {
                let data: BuildingData[] = [];

                if (source === "ign") {
                    data = await fetchIGNBuildings(bbox);
                } else if (source === "osm") {
                    data = await fetchOSMBuildings(bbox);
                }

                setBuildings(data);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Error loading data",
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [bbox, source]);

    return { buildings, loading, error };
}

export function useCommuneEnterprises(communeCode: string) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!communeCode) return;

        const loadData = async () => {
            setLoading(true);
            try {
                const enterprises =
                    await fetchEnterprisesInCommune(communeCode);
                setData(enterprises);
            } catch (err) {
                console.error("Error loading enterprises:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [communeCode]);

    return { data, loading };
}
```

## 🔄 Système de cache

```typescript
// lib/data-sources/cache-service.ts

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

class DataCache {
    private cache = new Map<string, CacheEntry<any>>();
    private readonly defaultTTL = 24 * 60 * 60 * 1000; // 24h

    set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + ttl,
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    clear(): void {
        this.cache.clear();
    }

    has(key: string): boolean {
        return this.get(key) !== null;
    }
}

export const dataCache = new DataCache();

// Wrapper pour requêtes avec cache
export async function fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number,
): Promise<T> {
    const cached = dataCache.get<T>(key);
    if (cached !== null) {
        console.log(`Cache hit: ${key}`);
        return cached;
    }

    console.log(`Cache miss: ${key}`);
    const data = await fetcher();
    dataCache.set(key, data, ttl);

    return data;
}
```

## 🎯 Utilisation dans les composants

```typescript
// components/map3d/map-3d-viewer-real.tsx
"use client";

import { useRealBuildingData } from "@/lib/hooks/use-real-data";
import { DEPARTMENT_06_CONFIG } from "@/lib/geo-data/department-06";
import { Map3DScene } from "./map-3d-scene";

export function Map3DViewerReal() {
  const bbox: [number, number, number, number] = [
    DEPARTMENT_06_CONFIG.bounds.west,
    DEPARTMENT_06_CONFIG.bounds.south,
    DEPARTMENT_06_CONFIG.bounds.east,
    DEPARTMENT_06_CONFIG.bounds.north,
  ];

  const { buildings, loading, error } = useRealBuildingData(bbox, "ign");

  if (loading) {
    return <div>Chargement des données IGN...</div>;
  }

  if (error) {
    return <div>Erreur: {error}</div>;
  }

  return (
    <div className="relative w-full h-[800px]">
      <Map3DScene buildings={buildings} />
      <div className="absolute bottom-4 left-4 text-xs text-white bg-black/50 p-2 rounded">
        {buildings.length} bâtiments chargés depuis IGN BD TOPO
      </div>
    </div>
  );
}
```

## ⚡ Optimisations

### 1. Pagination et chunking

```typescript
async function fetchBuildingsInChunks(
    largeBbox: [number, number, number, number],
    chunkSize: number = 0.1, // 0.1 degré
): Promise<BuildingData[]> {
    const chunks = createBboxChunks(largeBbox, chunkSize);
    const allBuildings: BuildingData[] = [];

    for (const chunk of chunks) {
        const buildings = await fetchIGNBuildings(chunk);
        allBuildings.push(...buildings);

        // Pause entre requêtes pour respecter rate limits
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return allBuildings;
}
```

### 2. Web Workers pour traitement

```typescript
// workers/data-processor.worker.ts
self.onmessage = (e) => {
    const { data, type } = e.data;

    if (type === "process-buildings") {
        const processed = processBuildings(data);
        self.postMessage({ type: "buildings-processed", data: processed });
    }
};
```

## 📊 Tableau comparatif des sources

| Source        | Avantages                         | Inconvénients           | Meilleur pour             |
| ------------- | --------------------------------- | ----------------------- | ------------------------- |
| **IGN**       | Données officielles, précises, 3D | Clé API requise, quotas | Bâtiments, limites admin  |
| **OSM**       | Gratuit, communautaire, détaillé  | Qualité variable        | Bâtiments, POI, routes    |
| **INSEE**     | Données entreprises officielles   | OAuth complexe          | Statistiques, entreprises |
| **Data.gouv** | Datasets publics variés           | Qualité variable        | Données contextuelles     |

## 🚀 Prochaines étapes

1. **Obtenir les clés API** (IGN, INSEE)
2. **Tester les services** avec des bboxes limitées
3. **Implémenter le cache** pour éviter requêtes répétées
4. **Ajouter rate limiting** pour respecter quotas
5. **Créer UI de sélection** de source de données
6. **Monitorer performances** et ajuster chunk sizes

Besoin d'aide pour une étape spécifique ?
