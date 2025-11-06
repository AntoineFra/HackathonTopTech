/**
 * OpenStreetMap Buildings API Service
 * Service pour récupérer les bâtiments via l'API Overpass d'OpenStreetMap
 * Documentation: https://wiki.openstreetmap.org/wiki/Overpass_API
 */

export interface OSMBuilding {
    type: "Feature";
    id: number | string;
    geometry: {
        type: "Polygon" | "MultiPolygon";
        coordinates: number[][][] | number[][][][];
    };
    properties: {
        id: number | string;
        building?: string; // Type de bâtiment (yes, house, commercial, etc.)
        height?: number; // Hauteur en mètres (parsée depuis string)
        "building:levels"?: number; // Nombre d'étages
        name?: string;
        addr_street?: string;
        addr_housenumber?: string;
        addr_city?: string;
        amenity?: string;
        shop?: string;
        office?: string;
    };
}

export interface IGNBuildingsResponse {
    type: "FeatureCollection";
    features: OSMBuilding[];
    totalFeatures?: number;
    numberMatched?: number;
    numberReturned?: number;
}

/**
 * Convertit les données Overpass OSM en format GeoJSON standard
 */
function overpassToGeoJSON(overpassData: any): IGNBuildingsResponse {
    const features: OSMBuilding[] = [];

    for (const element of overpassData.elements || []) {
        if (element.type === "way" && element.geometry) {
            // Convertir les coordonnées OSM (lat, lon) en [lon, lat] pour GeoJSON
            const coordinates = element.geometry.map((point: any) => [
                point.lon,
                point.lat,
            ]);

            // Fermer le polygone si nécessaire
            if (coordinates.length > 0) {
                const first = coordinates[0];
                const last = coordinates[coordinates.length - 1];
                if (first[0] !== last[0] || first[1] !== last[1]) {
                    coordinates.push([...first]);
                }
            }

            // Parser la hauteur si disponible
            let height: number | undefined;
            if (element.tags?.height) {
                const heightStr = element.tags.height;
                const parsed = parseFloat(heightStr);
                if (!isNaN(parsed)) {
                    height = parsed;
                }
            }

            // Estimer la hauteur depuis le nombre d'étages si pas de hauteur
            if (!height && element.tags?.["building:levels"]) {
                const levels = parseInt(element.tags["building:levels"]);
                if (!isNaN(levels)) {
                    height = levels * 3; // ~3m par étage
                }
            }

            features.push({
                type: "Feature",
                id: element.id,
                geometry: {
                    type: "Polygon",
                    coordinates: [coordinates],
                },
                properties: {
                    id: element.id,
                    building: element.tags?.building,
                    height: height,
                    "building:levels": element.tags?.["building:levels"]
                        ? parseInt(element.tags["building:levels"])
                        : undefined,
                    name: element.tags?.name,
                    addr_street: element.tags?.["addr:street"],
                    addr_housenumber: element.tags?.["addr:housenumber"],
                    addr_city: element.tags?.["addr:city"],
                    amenity: element.tags?.amenity,
                    shop: element.tags?.shop,
                    office: element.tags?.office,
                },
            });
        }
    }

    return {
        type: "FeatureCollection",
        features,
        totalFeatures: features.length,
        numberReturned: features.length,
    };
}

/**
 * Cache simple pour éviter de refaire les mêmes requêtes
 */
const buildingsCache = new Map<string, IGNBuildingsResponse>();

/**
 * Récupère les bâtiments d'une zone géographique via Overpass API (OpenStreetMap)
 * @param bbox - [minLon, minLat, maxLon, maxLat] en WGS84
 * @param timeout - Timeout de la requête en secondes (défaut: 25)
 * @param maxRetries - Nombre de tentatives en cas d'échec (défaut: 2)
 */
export async function fetchBuildingsByBBox(
    bbox: [number, number, number, number],
    timeout: number = 25,
    maxRetries: number = 2
): Promise<IGNBuildingsResponse> {
    const [minLon, minLat, maxLon, maxLat] = bbox;
    const cacheKey = bbox.join(",");

    // Vérifier le cache
    if (buildingsCache.has(cacheKey)) {
        console.log(`💾 Cache hit pour bbox ${cacheKey}`);
        return buildingsCache.get(cacheKey)!;
    }

    // Limiter le nombre de résultats pour éviter les timeouts
    const maxElements = 20000; // Augmenté pour Nice (zone dense)

    // Requête Overpass optimisée avec limite de résultats
    const query = `
        [out:json][timeout:${timeout}][maxsize:536870912];
        (
            way["building"](${minLat},${minLon},${maxLat},${maxLon});
        );
        out geom ${maxElements};
    `;

    const url = "https://overpass-api.de/api/interpreter";

    console.log(`🏗️ Fetching buildings from OSM in bbox ${bbox.join(",")} (max ${maxElements})...`);

    // Retry avec backoff exponentiel
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout * 1000 + 5000);

            const response = await fetch(url, {
                method: "POST",
                body: query,
                headers: {
                    "Content-Type": "text/plain",
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 429) {
                    // Rate limit - attendre plus longtemps
                    const waitTime = Math.pow(2, attempt) * 2000;
                    console.warn(`⏳ Rate limited, attente de ${waitTime}ms avant retry...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                }
                if (response.status === 504 && attempt < maxRetries) {
                    // Gateway timeout - réessayer avec un timeout plus long
                    const newTimeout = timeout + 10;
                    console.warn(`⏱️ Timeout (504), retry avec timeout=${newTimeout}s...`);
                    return fetchBuildingsByBBox(bbox, newTimeout, maxRetries - attempt - 1);
                }
                throw new Error(`OSM Overpass API error: ${response.status} ${response.statusText}`);
            }

            const overpassData = await response.json();
            const geoJSON = overpassToGeoJSON(overpassData);

            // Mettre en cache
            buildingsCache.set(cacheKey, geoJSON);

            console.log(`✅ OSM: Retrieved ${geoJSON.features.length} buildings`);
            if (geoJSON.features.length >= maxElements) {
                console.warn(`⚠️ Limite de ${maxElements} bâtiments atteinte, il y en a peut-être plus dans la zone`);
            }

            return geoJSON;
        } catch (error) {
            if (attempt === maxRetries) {
                console.error(`❌ Error fetching OSM buildings after ${maxRetries} retries:`, error);
                throw error;
            }

            const waitTime = Math.pow(2, attempt) * 1000;
            console.warn(`⚠️ Attempt ${attempt + 1} failed, retrying in ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    throw new Error("Failed to fetch buildings after all retries");
}

/**
 * Récupère les bâtiments autour d'un point (commune)
 * @param lat - Latitude du centre
 * @param lon - Longitude du centre
 * @param radiusKm - Rayon en kilomètres (défaut: 2km)
 */
export async function fetchBuildingsByCommune(
    inseeCode: string
): Promise<IGNBuildingsResponse> {
    // Map des centres de communes principales du 06
    const communeCenters: Record<string, [number, number]> = {
        "06088": [43.7102, 7.2620], // Nice
        "06029": [43.5483, 7.0175], // Cannes
        "06004": [43.5808, 7.1251], // Antibes
        "06069": [43.6584, 7.1472], // Grasse
        "06085": [43.6935, 7.2693], // Menton
    };

    const center = communeCenters[inseeCode];
    if (!center) {
        console.warn(`⚠️ Commune ${inseeCode} not in predefined list, using default bbox`);
        // Bbox réduite par défaut (éviter les timeouts)
        return fetchBuildingsByBBox([6.6, 43.4, 7.7, 44.3], 60); // Timeout plus long pour grande zone
    }

    const [lat, lon] = center;
    const radiusKm = 0.8; // Réduit de 2km à 0.8km pour éviter les timeouts

    // Calculer la bbox à partir du centre et du rayon
    // 1 degré de latitude ≈ 111km
    // 1 degré de longitude ≈ 111km * cos(latitude)
    const latDelta = radiusKm / 111;
    const lonDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    const bbox: [number, number, number, number] = [
        lon - lonDelta,
        lat - latDelta,
        lon + lonDelta,
        lat + latDelta,
    ];

    return fetchBuildingsByBBox(bbox, 30); // Timeout de 30s pour zone réduite
}

/**
 * Récupère les bâtiments d'une commune de manière intelligente
 * Si timeout, essaie de diviser la zone en 4 quadrants
 * @param inseeCode - Code INSEE de la commune
 * @param centerCoords - Coordonnées [lat, lon] du centre (optionnel)
 */
export async function fetchBuildingsByCommuneSmart(
    inseeCode: string,
    centerCoords?: [number, number]
): Promise<IGNBuildingsResponse> {
    try {
        // Essayer d'abord avec la méthode normale
        return await fetchBuildingsByCommune(inseeCode);
    } catch (error) {
        console.warn(`⚠️ Erreur lors du chargement standard, tentative avec quadrants...`);

        // Si échec, diviser en 4 quadrants plus petits
        const communeCenters: Record<string, [number, number]> = {
            "06088": [43.7102, 7.2620], // Nice
            "06029": [43.5483, 7.0175], // Cannes
            "06004": [43.5808, 7.1251], // Antibes
            "06069": [43.6584, 7.1472], // Grasse
            "06085": [43.6935, 7.2693], // Menton
        };

        const center = centerCoords || communeCenters[inseeCode];
        if (!center) {
            throw new Error(`Centre inconnu pour ${inseeCode}`);
        }

        const [lat, lon] = center;
        const radiusKm = 0.4; // Quadrants plus petits
        const latDelta = radiusKm / 111;
        const lonDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

        // 4 quadrants
        const quadrants: [number, number, number, number][] = [
            [lon - lonDelta, lat, lon, lat + latDelta], // NW
            [lon, lat, lon + lonDelta, lat + latDelta], // NE
            [lon - lonDelta, lat - latDelta, lon, lat], // SW
            [lon, lat - latDelta, lon + lonDelta, lat], // SE
        ];

        console.log(`🔄 Chargement par quadrants (4 zones)...`);

        const results = await Promise.allSettled(
            quadrants.map((bbox, i) =>
                fetchBuildingsByBBox(bbox, 25).catch(err => {
                    console.warn(`⚠️ Quadrant ${i + 1} échoué:`, err.message);
                    return { type: "FeatureCollection" as const, features: [], totalFeatures: 0 };
                })
            )
        );

        // Fusionner tous les résultats
        const allFeatures: OSMBuilding[] = [];
        results.forEach((result, i) => {
            if (result.status === "fulfilled") {
                allFeatures.push(...result.value.features);
                console.log(`✅ Quadrant ${i + 1}: ${result.value.features.length} bâtiments`);
            }
        });

        return {
            type: "FeatureCollection",
            features: allFeatures,
            totalFeatures: allFeatures.length,
            numberReturned: allFeatures.length,
        };
    }
}

/**
 * Récupère les bâtiments de plusieurs communes en parallèle
 * @param inseeCodes - Array de codes INSEE
 * @returns Promise avec toutes les collections de bâtiments
 */
export async function fetchBuildingsForMultipleCommunes(
    inseeCodes: string[]
): Promise<Record<string, IGNBuildingsResponse>> {
    console.log(`🏗️ Fetching buildings for ${inseeCodes.length} communes...`);

    const results = await Promise.allSettled(
        inseeCodes.map(async (code) => ({
            code,
            data: await fetchBuildingsByCommune(code),
        }))
    );

    const buildingsMap: Record<string, IGNBuildingsResponse> = {};

    results.forEach((result, index) => {
        if (result.status === "fulfilled") {
            buildingsMap[result.value.code] = result.value.data;
        } else {
            console.warn(`⚠️ Failed to fetch buildings for commune ${inseeCodes[index]}:`, result.reason);
        }
    });

    console.log(`✅ Successfully fetched buildings for ${Object.keys(buildingsMap).length}/${inseeCodes.length} communes`);

    return buildingsMap;
}

/**
 * Calcule des statistiques sur un ensemble de bâtiments OSM
 * @param buildings - Array de bâtiments OSM
 * @returns Statistiques (total, hauteur moyenne, par type)
 */
export function getBuildingsStats(buildings: OSMBuilding[]) {
    const total = buildings.length;

    // Hauteur moyenne
    const buildingsWithHeight = buildings.filter(b => b.properties.height !== undefined);
    const avgHeight = buildingsWithHeight.length > 0
        ? buildingsWithHeight.reduce((sum, b) => sum + (b.properties.height || 0), 0) / buildingsWithHeight.length
        : 0;

    // Répartition par type
    const byType: Record<string, number> = {};
    buildings.forEach(b => {
        const type = b.properties.building || "unknown";
        byType[type] = (byType[type] || 0) + 1;
    });

    return {
        total,
        avgHeight: Math.round(avgHeight * 10) / 10, // Arrondi à 1 décimale
        withHeight: buildingsWithHeight.length,
        byType,
    };
}
