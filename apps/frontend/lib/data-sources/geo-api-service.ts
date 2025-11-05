/**
 * French Government geo.api.gouv.fr Service
 * Official French administrative boundaries and commune data
 * Documentation: https://geo.api.gouv.fr/decoupage-administratif/communes
 *
 * NO API KEY REQUIRED - Free government service
 */

import type { CommuneData } from "@/types/map";
import { fetchWithCache } from "./cache-service";

const GEO_API_BASE = "https://geo.api.gouv.fr";

/**
 * Commune data from geo.api.gouv.fr
 */
export interface GeoAPICommuneRaw {
    nom: string;
    code: string; // INSEE code (e.g., "06088" for Nice)
    codeDepartement: string;
    siren: string;
    codeEpci: string;
    codeRegion: string;
    codesPostaux: string[];
    population?: number;
    surface?: number; // in hectares
    centre?: {
        type: "Point";
        coordinates: [number, number]; // [lon, lat]
    };
    contour?: {
        type: "Polygon" | "MultiPolygon";
        coordinates: number[][][] | number[][][][];
    };
    mairie?: {
        type: "Point";
        coordinates: [number, number];
    };
    bbox?: {
        type: "Polygon";
        coordinates: number[][][];
    };
}

/**
 * GeoJSON response format
 */
interface GeoAPIGeoJSON {
    type: "FeatureCollection";
    features: Array<{
        type: "Feature";
        properties: GeoAPICommuneRaw;
        geometry: {
            type: string;
            coordinates: unknown;
        };
    }>;
}

/**
 * Fetch all communes in a department
 * @param departmentCode Department code (e.g., "06" for Alpes-Maritimes)
 * @param withGeometry Include geometry data (contour, center, mairie, bbox)
 */
export async function fetchDepartmentCommunes(
    departmentCode: string = "06",
    withGeometry: "centre" | "contour" | "mairie" | "bbox" | null = "centre",
): Promise<CommuneData[]> {
    const cacheKey = `geo-api-dept-${departmentCode}-${withGeometry}`;

    return fetchWithCache(
        cacheKey,
        async () => {
            const params = new URLSearchParams({
                fields: "nom,code,population,surface,codesPostaux,codeDepartement,codeRegion,siren,codeEpci",
            });

            if (withGeometry) {
                params.append("geometry", withGeometry);
                params.append("format", "geojson");
            }

            const url = `${GEO_API_BASE}/departements/${departmentCode}/communes?${params}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`geo.api.gouv.fr error: ${response.status}`);
            }

            const data: GeoAPICommuneRaw[] | GeoAPIGeoJSON =
                await response.json();

            // Handle GeoJSON format
            if (
                withGeometry &&
                "type" in data &&
                data.type === "FeatureCollection"
            ) {
                return data.features.map((feature) =>
                    mapToCommuneData(feature.properties, feature.geometry),
                );
            }

            // Handle regular JSON format
            return (data as GeoAPICommuneRaw[]).map((commune) =>
                mapToCommuneData(commune),
            );
        },
        7 * 24 * 60 * 60 * 1000, // Cache for 7 days
    );
}

/**
 * Fetch a specific commune by INSEE code
 * @param communeCode INSEE code (e.g., "06088" for Nice)
 * @param withGeometry Include geometry data
 */
export async function fetchCommuneByCode(
    communeCode: string,
    withGeometry: "centre" | "contour" | "mairie" | "bbox" | null = "contour",
): Promise<CommuneData> {
    const cacheKey = `geo-api-commune-${communeCode}-${withGeometry}`;

    return fetchWithCache(
        cacheKey,
        async () => {
            const params = new URLSearchParams({
                fields: "nom,code,population,surface,codesPostaux,codeDepartement,codeRegion,siren,codeEpci,centre",
            });

            if (withGeometry) {
                params.append("geometry", withGeometry);
                params.append("format", "geojson");
            }

            const url = `${GEO_API_BASE}/communes/${communeCode}?${params}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`geo.api.gouv.fr error: ${response.status}`);
            }

            const data = await response.json();

            // Handle GeoJSON format
            if (withGeometry && data.type === "Feature") {
                return mapToCommuneData(data.properties, data.geometry);
            }

            // Handle regular JSON format
            return mapToCommuneData(data);
        },
        7 * 24 * 60 * 60 * 1000, // Cache for 7 days
    );
}

/**
 * Search communes by name
 * @param name Commune name to search for
 * @param boost Boost results by population
 * @param limit Maximum number of results
 */
export async function searchCommunesByName(
    name: string,
    boost: "population" | null = "population",
    limit: number = 10,
): Promise<CommuneData[]> {
    const cacheKey = `geo-api-search-${name}-${boost}-${limit}`;

    return fetchWithCache(
        cacheKey,
        async () => {
            const params = new URLSearchParams({
                nom: name,
                fields: "nom,code,population,surface,codesPostaux,centre",
                limit: limit.toString(),
            });

            if (boost) {
                params.append("boost", boost);
            }

            const url = `${GEO_API_BASE}/communes?${params}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`geo.api.gouv.fr error: ${response.status}`);
            }

            const data: GeoAPICommuneRaw[] = await response.json();
            return data.map((commune) => mapToCommuneData(commune));
        },
        24 * 60 * 60 * 1000, // Cache for 24 hours
    );
}

/**
 * Find commune by geographic coordinates
 * @param lat Latitude
 * @param lon Longitude
 */
export async function findCommuneByCoordinates(
    lat: number,
    lon: number,
): Promise<CommuneData> {
    const cacheKey = `geo-api-coords-${lat.toFixed(4)}-${lon.toFixed(4)}`;

    return fetchWithCache(
        cacheKey,
        async () => {
            const params = new URLSearchParams({
                lat: lat.toString(),
                lon: lon.toString(),
                fields: "nom,code,population,surface,codesPostaux,centre,contour",
                geometry: "contour",
                format: "geojson",
            });

            const url = `${GEO_API_BASE}/communes?${params}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`geo.api.gouv.fr error: ${response.status}`);
            }

            const data: GeoAPIGeoJSON = await response.json();

            if (data.features.length === 0) {
                throw new Error(
                    `No commune found at coordinates ${lat}, ${lon}`,
                );
            }

            return mapToCommuneData(
                data.features[0].properties,
                data.features[0].geometry,
            );
        },
        24 * 60 * 60 * 1000, // Cache for 24 hours
    );
}

/**
 * Map geo.api.gouv.fr commune data to internal CommuneData format
 */
function mapToCommuneData(
    commune: GeoAPICommuneRaw,
    geometry?: { type: string; coordinates: unknown },
): CommuneData {
    // Extract center coordinates
    let coordinates: { lat: number; lon: number } = { lat: 0, lon: 0 };
    if (commune.centre) {
        coordinates = {
            lat: commune.centre.coordinates[1],
            lon: commune.centre.coordinates[0],
        };
    }

    // Extract boundary polygon
    let bounds: number[][] = [];
    if (geometry && geometry.type === "Polygon") {
        const coords = geometry.coordinates as number[][][];
        bounds = coords[0].map(([lon, lat]) => [lat, lon]); // Convert to [lat, lon]
    } else if (geometry && geometry.type === "MultiPolygon") {
        const coords = geometry.coordinates as number[][][][];
        bounds = coords[0][0].map(([lon, lat]) => [lat, lon]);
    } else if (commune.contour) {
        if (commune.contour.type === "Polygon") {
            const coords = commune.contour.coordinates as number[][][];
            bounds = coords[0].map(([lon, lat]) => [lat, lon]);
        } else if (commune.contour.type === "MultiPolygon") {
            const coords = commune.contour.coordinates as number[][][][];
            bounds = coords[0][0].map(([lon, lat]) => [lat, lon]);
        }
    }

    return {
        id: commune.code,
        name: commune.nom,
        population: commune.population,
        area: commune.surface ? commune.surface / 100 : undefined, // Convert hectares to km²
        enterpriseCount: 0, // Will be filled by INSEE API
        coordinates,
        bounds,
    };
}

/**
 * Get bounding box for a commune
 * Useful for determining which buildings to fetch from other APIs
 */
export async function getCommuneBoundingBox(
    communeCode: string,
): Promise<[number, number, number, number]> {
    const commune = await fetchCommuneByCode(communeCode, "bbox");

    if (!commune.bounds || commune.bounds.length === 0) {
        throw new Error(`No boundary data for commune ${communeCode}`);
    }

    // Calculate bbox from bounds
    const lats = commune.bounds.map((coord: number[]) => coord[0]);
    const lons = commune.bounds.map((coord: number[]) => coord[1]);

    return [
        Math.min(...lons), // minLon
        Math.min(...lats), // minLat
        Math.max(...lons), // maxLon
        Math.max(...lats), // maxLat
    ];
}

/**
 * Get all major communes (population > threshold) in department 06
 */
export async function getMajorCommunes(
    departmentCode: string = "06",
    populationThreshold: number = 5000,
): Promise<CommuneData[]> {
    const communes = await fetchDepartmentCommunes(departmentCode, "centre");
    return communes
        .filter((c) => (c.population || 0) >= populationThreshold)
        .sort((a, b) => (b.population || 0) - (a.population || 0));
}

/**
 * INSEE commune codes for major cities in department 06
 */
export const COMMUNE_CODES_06 = {
    NICE: "06088",
    CANNES: "06029",
    ANTIBES: "06004",
    GRASSE: "06069",
    CAGNES_SUR_MER: "06027",
    LE_CANNET: "06030",
    MENTON: "06083",
    VALLAURIS: "06155",
    MOUGINS: "06085",
    VENCE: "06157",
    MANDELIEU_LA_NAPOULE: "06079",
    BEAUSOLEIL: "06012",
    ROQUEBRUNE_CAP_MARTIN: "06104",
    VILLEFRANCHE_SUR_MER: "06159",
    MONACO: "99138", // Monaco (not technically in 06, but nearby)
} as const;
