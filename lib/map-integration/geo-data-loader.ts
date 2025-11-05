/**
 * Geo Data Loader - Integration between geo.api.gouv.fr and Map3D
 *
 * This service fetches commune data from geo.api.gouv.fr and transforms it
 * for use in the 3D map visualization.
 */

import {
    fetchDepartmentCommunes,
    fetchCommuneByCode,
    searchCommunesByName,
    getCommuneBoundingBox,
    getMajorCommunes,
    COMMUNE_CODES_06,
} from "@/lib/data-sources/geo-api-service";
import { CommuneData, GeoCoordinate, SceneCommune } from "@/types/map";
import { Vector3 } from "three";

/**
 * Lambert 93 projection constants for département 06
 * These values are approximate and should be calibrated with real projection library
 */
const LAMBERT_93_ORIGIN = {
    lat: 43.7, // Approximate center of dept 06
    lon: 7.2,
};

const SCALE_FACTOR = 10000; // Meters to 3D units conversion

/**
 * Convert geographic coordinates (WGS84) to 3D scene coordinates
 * This is a simplified conversion - for production use a proper projection library
 */
export function geoToScene(coord: GeoCoordinate): Vector3 {
    const x = (coord.lon - LAMBERT_93_ORIGIN.lon) * SCALE_FACTOR;
    const z = -(coord.lat - LAMBERT_93_ORIGIN.lat) * SCALE_FACTOR; // Negative because Z+ is south in Three.js
    return new Vector3(x, 0, z);
}

/**
 * Convert 3D scene coordinates back to geographic coordinates
 */
export function sceneToGeo(position: Vector3): GeoCoordinate {
    return {
        lon: position.x / SCALE_FACTOR + LAMBERT_93_ORIGIN.lon,
        lat: -position.z / SCALE_FACTOR + LAMBERT_93_ORIGIN.lat,
    };
}

/**
 * Transform CommuneData coordinates array to Vector3 boundary points
 */
export function transformCommuneBoundary(bounds: number[][]): Vector3[] {
    return bounds.map(([lon, lat]) => {
        const x = (lon - LAMBERT_93_ORIGIN.lon) * SCALE_FACTOR;
        const z = -(lat - LAMBERT_93_ORIGIN.lat) * SCALE_FACTOR;
        return new Vector3(x, 0, z);
    });
}

/**
 * Load all communes in département 06 with their boundaries
 * This is the main function to populate the map with commune data
 */
export async function loadDepartmentCommunes(
    options: {
        includeGeometry?: boolean;
        minPopulation?: number;
    } = {},
): Promise<CommuneData[]> {
    const { includeGeometry = true, minPopulation } = options;

    try {
        // Fetch all communes with geometry
        const communes = await fetchDepartmentCommunes(
            "06",
            includeGeometry ? "contour" : undefined,
        );

        // Filter by population if specified
        if (minPopulation) {
            return communes.filter(
                (commune) =>
                    commune.population && commune.population >= minPopulation,
            );
        }

        return communes;
    } catch (error) {
        console.error("Error loading department communes:", error);
        throw new Error("Failed to load commune data");
    }
}

/**
 * Load specific communes by their names
 * Useful for focusing on specific cities mentioned in queries
 */
export async function loadCommunesByNames(
    names: string[],
): Promise<CommuneData[]> {
    try {
        const promises = names.map((name) =>
            searchCommunesByName(name, "population", 1),
        );
        const results = await Promise.all(promises);

        // Flatten and take the first result for each search
        return results.map((matches) => matches[0]).filter(Boolean);
    } catch (error) {
        console.error("Error loading communes by names:", error);
        return [];
    }
}

/**
 * Load major communes (cities) with population > threshold
 * Perfect for initial map display without overwhelming detail
 */
export async function loadMajorCommunes(
    minPopulation: number = 10000,
): Promise<CommuneData[]> {
    try {
        return await getMajorCommunes("06", minPopulation);
    } catch (error) {
        console.error("Error loading major communes:", error);
        return [];
    }
}

/**
 * Load a specific commune by its INSEE code
 */
export async function loadCommuneByCode(
    code: string,
    includeGeometry: boolean = true,
): Promise<CommuneData | null> {
    try {
        return await fetchCommuneByCode(
            code,
            includeGeometry ? "contour" : undefined,
        );
    } catch (error) {
        console.error(`Error loading commune ${code}:`, error);
        return null;
    }
}

/**
 * Load pre-defined major cities (Nice, Cannes, Antibes, etc.)
 * This uses the COMMUNE_CODES_06 constant for fast initial loading
 */
export async function loadPredefinedCities(): Promise<CommuneData[]> {
    try {
        const codes = Object.keys(COMMUNE_CODES_06);
        const promises = codes.map((code) =>
            fetchCommuneByCode(code, "contour"),
        );
        const results = await Promise.all(promises);
        return results.filter(
            (commune): commune is CommuneData => commune !== null,
        );
    } catch (error) {
        console.error("Error loading predefined cities:", error);
        return [];
    }
}

/**
 * Convert CommuneData to SceneCommune for 3D rendering
 */
export function communeToSceneCommune(commune: CommuneData): SceneCommune {
    return {
        id: commune.id,
        name: commune.name,
        boundary: transformCommuneBoundary(commune.bounds),
        center: geoToScene(commune.coordinates),
        userData: commune,
    };
}

/**
 * Batch convert multiple communes to scene data
 */
export function communesToSceneCommunes(
    communes: CommuneData[],
): SceneCommune[] {
    return communes.map(communeToSceneCommune);
}

/**
 * Find the commune at a specific 3D position (reverse geocoding)
 * Useful for click/hover interactions on the map
 */
export async function findCommuneAtPosition(
    position: Vector3,
): Promise<CommuneData | null> {
    try {
        const geoCoord = sceneToGeo(position);
        const communes = await fetchDepartmentCommunes("06");

        // Simple point-in-bounds check (for production, use proper point-in-polygon)
        const found = communes.find((commune) => {
            if (!commune.bounds || commune.bounds.length === 0) return false;

            const lons = commune.bounds.map(([lon]) => lon);
            const lats = commune.bounds.map(([, lat]) => lat);
            const minLon = Math.min(...lons);
            const maxLon = Math.max(...lons);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);

            return (
                geoCoord.lon >= minLon &&
                geoCoord.lon <= maxLon &&
                geoCoord.lat >= minLat &&
                geoCoord.lat <= maxLat
            );
        });

        return found || null;
    } catch (error) {
        console.error("Error finding commune at position:", error);
        return null;
    }
}

/**
 * Get bounding box for a commune in 3D scene coordinates
 * Useful for camera focusing and API queries
 */
export async function getCommuneSceneBounds(
    communeCode: string,
): Promise<{ min: Vector3; max: Vector3 } | null> {
    try {
        const bbox = await getCommuneBoundingBox(communeCode);
        if (!bbox) return null;

        const [west, south, east, north] = bbox;

        const min = geoToScene({ lat: south, lon: west });
        const max = geoToScene({ lat: north, lon: east });

        return { min, max };
    } catch (error) {
        console.error("Error getting commune scene bounds:", error);
        return null;
    }
}

/**
 * Calculate optimal camera position to view a commune
 */
export async function getCommuneCameraPosition(
    communeCode: string,
): Promise<{ position: Vector3; target: Vector3 } | null> {
    try {
        const commune = await fetchCommuneByCode(communeCode);
        if (!commune) return null;

        const center = geoToScene(commune.coordinates);

        // Position camera above and to the south-east of the commune
        const offset = commune.area ? Math.sqrt(commune.area) * 500 : 5000;
        const position = new Vector3(
            center.x + offset * 0.7,
            offset * 1.5, // Height
            center.z + offset * 0.7,
        );

        return {
            position,
            target: center,
        };
    } catch (error) {
        console.error("Error calculating camera position:", error);
        return null;
    }
}

/**
 * Search communes by query text and return top results
 * Integrates with AI query system
 */
export async function searchCommunes(
    query: string,
    limit: number = 5,
): Promise<CommuneData[]> {
    try {
        const results = await searchCommunesByName(query, "population", limit);
        return results;
    } catch (error) {
        console.error("Error searching communes:", error);
        return [];
    }
}

/**
 * Pre-load and cache commune data for better performance
 * Call this on app initialization
 */
export async function preloadMapData(): Promise<{
    majorCities: CommuneData[];
    allCommunes: CommuneData[];
}> {
    try {
        console.log("Preloading map data...");

        // Load major cities first (fast)
        const majorCities = await loadPredefinedCities();
        console.log(`Loaded ${majorCities.length} major cities`);

        // Load all communes in background (slower)
        const allCommunes = await loadDepartmentCommunes({
            includeGeometry: false,
        });
        console.log(`Loaded ${allCommunes.length} total communes`);

        return {
            majorCities,
            allCommunes,
        };
    } catch (error) {
        console.error("Error preloading map data:", error);
        return {
            majorCities: [],
            allCommunes: [],
        };
    }
}

/**
 * Get commune statistics for visualization
 */
export async function getCommuneStatistics(communeCode: string): Promise<{
    commune: CommuneData;
    stats: {
        population: number;
        area: number;
        density: number;
        enterpriseCount?: number;
    };
} | null> {
    try {
        const commune = await fetchCommuneByCode(communeCode);
        if (!commune) return null;

        const density =
            commune.population && commune.area
                ? commune.population / commune.area
                : 0;

        return {
            commune,
            stats: {
                population: commune.population || 0,
                area: commune.area || 0,
                density,
                enterpriseCount: commune.enterpriseCount,
            },
        };
    } catch (error) {
        console.error("Error getting commune statistics:", error);
        return null;
    }
}

/**
 * Utility: Get commune name from code
 */
export function getCommuneNameByCode(code: string): string {
    return COMMUNE_CODES_06[code as keyof typeof COMMUNE_CODES_06] || code;
}

/**
 * Utility: Get commune code from name
 */
export function getCommuneCodeByName(name: string): string | null {
    const entry = Object.entries(COMMUNE_CODES_06).find(
        ([, cityName]) => cityName.toLowerCase() === name.toLowerCase(),
    );
    return entry ? entry[0] : null;
}
