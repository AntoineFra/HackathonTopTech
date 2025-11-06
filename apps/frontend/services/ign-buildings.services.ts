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
 * Récupère les bâtiments d'une zone géographique via Overpass API (OpenStreetMap)
 * @param bbox - [minLon, minLat, maxLon, maxLat] en WGS84
 * @param timeout - Timeout de la requête en secondes (défaut: 25)
 */
export async function fetchBuildingsByBBox(
    bbox: [number, number, number, number],
    timeout: number = 25
): Promise<IGNBuildingsResponse> {
    const [minLon, minLat, maxLon, maxLat] = bbox;

    // Requête Overpass pour récupérer les bâtiments dans la bbox
    const query = `
        [out:json][timeout:${timeout}];
        (
            way["building"](${minLat},${minLon},${maxLat},${maxLon});
            relation["building"](${minLat},${minLon},${maxLat},${maxLon});
        );
        out geom;
    `;

    const url = "https://overpass-api.de/api/interpreter";

    console.log(`🏗️ Fetching buildings from OSM in bbox ${bbox.join(",")}...`);

    try {
        const response = await fetch(url, {
            method: "POST",
            body: query,
            headers: {
                "Content-Type": "text/plain",
            },
        });

        if (!response.ok) {
            throw new Error(`OSM Overpass API error: ${response.status} ${response.statusText}`);
        }

        const overpassData = await response.json();
        const geoJSON = overpassToGeoJSON(overpassData);

        console.log(`✅ OSM: Retrieved ${geoJSON.features.length} buildings`);

        return geoJSON;
    } catch (error) {
        console.error(`❌ Error fetching OSM buildings:`, error);
        throw error;
    }
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
        // Bbox par défaut pour le département 06
        return fetchBuildingsByBBox([6.6, 43.4, 7.7, 44.3]);
    }

    const [lat, lon] = center;
    const radiusKm = 2;

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

    return fetchBuildingsByBBox(bbox);
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
