/**
 * IGN Géoportail Data Service
 * Documentation: https://geoservices.ign.fr/
 */

import type { BuildingData } from "@/types/map";
import { fetchWithCache } from "./cache-service";

const IGN_WFS_URL = "https://wxs.ign.fr/";
const IGN_API_KEY = process.env.NEXT_PUBLIC_IGN_API_KEY;

interface IGNFeature {
    type: "Feature";
    properties: {
        id?: string;
        nom?: string;
        commune?: string;
        hauteur?: number;
        nature?: string;
        [key: string]: unknown;
    };
    geometry: {
        type: string;
        coordinates: number[][][][] | number[][][] | number[][];
    };
}

interface IGNGeoJSON {
    type: "FeatureCollection";
    features: IGNFeature[];
}

/**
 * Fetch buildings from IGN BD TOPO
 * @param bbox Bounding box [minLon, minLat, maxLon, maxLat]
 * @param maxCount Maximum number of buildings to fetch (default 1000)
 */
export async function fetchIGNBuildings(
    bbox: [number, number, number, number],
    maxCount: number = 1000,
): Promise<BuildingData[]> {
    if (!IGN_API_KEY) {
        console.warn("IGN_API_KEY not configured, using mock data");
        return [];
    }

    const [minLon, minLat, maxLon, maxLat] = bbox;
    const cacheKey = `ign-buildings-${bbox.join("-")}`;

    return fetchWithCache(
        cacheKey,
        async () => {
            const params = new URLSearchParams({
                service: "WFS",
                version: "2.0.0",
                request: "GetFeature",
                typename: "BDTOPO_V3:batiment",
                outputFormat: "application/json",
                srsname: "EPSG:4326", // WGS84
                bbox: `${minLat},${minLon},${maxLat},${maxLon}`,
                count: maxCount.toString(),
            });

            const url = `${IGN_WFS_URL}${IGN_API_KEY}/geoportail/wfs?${params}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`IGN API error: ${response.status}`);
            }

            const geojson: IGNGeoJSON = await response.json();

            return geojson.features.map((feature, index) => {
                const coords = extractCoordinates(feature.geometry);
                const center = calculatePolygonCenter(coords);

                return {
                    id: feature.properties.id || `ign-${index}`,
                    name: feature.properties.nom,
                    commune: feature.properties.commune || "Inconnu",
                    coordinates: { lat: center[1], lon: center[0] },
                    footprint: coords,
                    height: feature.properties.hauteur || 10,
                    floors: Math.floor((feature.properties.hauteur || 10) / 3),
                    type: mapIGNBuildingType(feature.properties.nature),
                    metadata: {
                        source: "IGN BD TOPO",
                        ign_id: feature.properties.id,
                        nature: feature.properties.nature,
                        date_import: new Date().toISOString(),
                    },
                };
            });
        },
        24 * 60 * 60 * 1000, // Cache for 24 hours
    );
}

/**
 * Fetch administrative boundaries (communes) from IGN
 */
export async function fetchIGNCommunes(
    departmentCode: string = "06",
): Promise<IGNGeoJSON> {
    if (!IGN_API_KEY) {
        console.warn("IGN_API_KEY not configured");
        return { type: "FeatureCollection", features: [] };
    }

    const cacheKey = `ign-communes-${departmentCode}`;

    return fetchWithCache(
        cacheKey,
        async () => {
            const params = new URLSearchParams({
                service: "WFS",
                version: "2.0.0",
                request: "GetFeature",
                typename: "ADMINEXPRESS-COG-CARTO.LATEST:commune",
                outputFormat: "application/json",
                srsname: "EPSG:4326",
                cql_filter: `INSEE_DEP='${departmentCode}'`,
            });

            const url = `${IGN_WFS_URL}${IGN_API_KEY}/geoportail/wfs?${params}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`IGN API error: ${response.status}`);
            }

            return await response.json();
        },
        7 * 24 * 60 * 60 * 1000, // Cache for 7 days
    );
}

/**
 * Extract coordinates from IGN geometry (handles Polygon and MultiPolygon)
 */
function extractCoordinates(geometry: IGNFeature["geometry"]): number[][] {
    if (geometry.type === "Polygon") {
        // Polygon coordinates are [ring1, ring2, ...]
        const coords = geometry.coordinates as number[][][];
        return coords[0];
    } else if (geometry.type === "MultiPolygon") {
        // MultiPolygon coordinates are [polygon1, polygon2, ...]
        // Each polygon is [ring1, ring2, ...]
        const coords = geometry.coordinates as number[][][][];
        return coords[0][0];
    }
    return [];
}

/**
 * Calculate center point of a polygon
 */
function calculatePolygonCenter(coords: number[][]): [number, number] {
    if (coords.length === 0) return [0, 0];

    const sum = coords.reduce(
        (acc, [lon, lat]) => [acc[0] + lon, acc[1] + lat],
        [0, 0],
    );

    return [sum[0] / coords.length, sum[1] / coords.length];
}

/**
 * Map IGN building nature to our building types
 */
function mapIGNBuildingType(nature?: string): string {
    if (!nature) return "residential";

    const mapping: Record<string, string> = {
        "Bâtiment industriel": "industrial",
        "Industriel, agricole ou commercial": "industrial",
        "Bâtiment commercial et services": "commercial",
        "Bâtiment commercial": "commercial",
        "Commercial et services": "commercial",
        "Bâtiment religieux": "other",
        Religieux: "other",
        Construction: "residential",
        Indifférencié: "residential",
        Remarquable: "other",
        Sportif: "other",
    };

    return mapping[nature] || "residential";
}

/**
 * Split large bbox into smaller chunks for better performance
 */
export function createBboxChunks(
    bbox: [number, number, number, number],
    chunkSize: number = 0.05,
): Array<[number, number, number, number]> {
    const [minLon, minLat, maxLon, maxLat] = bbox;
    const chunks: Array<[number, number, number, number]> = [];

    for (let lon = minLon; lon < maxLon; lon += chunkSize) {
        for (let lat = minLat; lat < maxLat; lat += chunkSize) {
            chunks.push([
                lon,
                lat,
                Math.min(lon + chunkSize, maxLon),
                Math.min(lat + chunkSize, maxLat),
            ]);
        }
    }

    return chunks;
}

/**
 * Fetch buildings in chunks to handle large areas
 */
export async function fetchIGNBuildingsInChunks(
    bbox: [number, number, number, number],
    chunkSize: number = 0.05,
): Promise<BuildingData[]> {
    const chunks = createBboxChunks(bbox, chunkSize);
    const allBuildings: BuildingData[] = [];

    console.log(`Fetching buildings in ${chunks.length} chunks...`);

    for (const [index, chunk] of chunks.entries()) {
        console.log(`Processing chunk ${index + 1}/${chunks.length}`);

        const buildings = await fetchIGNBuildings(chunk, 500);
        allBuildings.push(...buildings);

        // Add delay to respect rate limits (2M/day is ~23 requests/second)
        if (index < chunks.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }

    console.log(`Loaded ${allBuildings.length} buildings from IGN`);

    // Remove duplicates based on ID
    const uniqueBuildings = allBuildings.filter(
        (building, index, self) =>
            index === self.findIndex((b) => b.id === building.id),
    );

    return uniqueBuildings;
}
