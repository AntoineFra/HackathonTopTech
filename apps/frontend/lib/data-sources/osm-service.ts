/**
 * OpenStreetMap Overpass API Service
 * Documentation: https://wiki.openstreetmap.org/wiki/Overpass_API
 *
 * Provides building geometries and POI data
 */

import type { BuildingData } from "@/types/map";
import { fetchWithCache } from "./cache-service";

const OVERPASS_API = "https://overpass-api.de/api/interpreter";

interface OSMElement {
    type: "node" | "way" | "relation";
    id: number;
    lat?: number;
    lon?: number;
    tags?: {
        building?: string;
        "building:levels"?: string;
        height?: string;
        name?: string;
        amenity?: string;
        shop?: string;
        tourism?: string;
        office?: string;
        [key: string]: string | undefined;
    };
    nodes?: number[];
    members?: Array<{
        type: string;
        ref: number;
        role: string;
    }>;
    geometry?: Array<{
        lat: number;
        lon: number;
    }>;
}

interface OSMResponse {
    version: number;
    generator: string;
    elements: OSMElement[];
}

/**
 * Fetch buildings from OpenStreetMap
 * @param bbox Bounding box [minLat, minLon, maxLat, maxLon] (note: OSM uses lat,lon order)
 * @param includeHeight Include only buildings with height/levels data
 */
export async function fetchOSMBuildings(
    bbox: [number, number, number, number],
    includeHeight: boolean = false,
): Promise<BuildingData[]> {
    const [minLat, minLon, maxLat, maxLon] = bbox;
    const cacheKey = `osm-buildings-${bbox.join("-")}-${includeHeight}`;

    return fetchWithCache(
        cacheKey,
        async () => {
            // Build Overpass QL query
            const heightFilter = includeHeight
                ? '["building"]["height"]'
                : '["building"]';

            const query = `
        [out:json][timeout:30];
        (
          way${heightFilter}(${minLat},${minLon},${maxLat},${maxLon});
          relation${heightFilter}(${minLat},${minLon},${maxLat},${maxLon});
        );
        out geom;
      `;

            const response = await fetch(OVERPASS_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `data=${encodeURIComponent(query)}`,
            });

            if (!response.ok) {
                throw new Error(`Overpass API error: ${response.status}`);
            }

            const data: OSMResponse = await response.json();

            return processOSMData(data);
        },
        7 * 24 * 60 * 60 * 1000, // Cache for 7 days
    );
}

/**
 * Process OSM data into BuildingData format
 */
function processOSMData(data: OSMResponse): BuildingData[] {
    const buildings: BuildingData[] = [];

    for (const element of data.elements) {
        if (!element.tags?.building || element.type === "node") continue;

        // Extract geometry
        let footprint: [number, number][] = [];

        if (element.geometry) {
            footprint = element.geometry.map((point) => [point.lon, point.lat]);
        }

        if (footprint.length < 3) continue; // Need at least 3 points for a polygon

        // Calculate center
        const center = calculateCenter(footprint);

        // Extract height
        const height = extractHeight(element.tags);

        // Map building type to sector
        const sector = mapOSMBuildingToSector(element.tags);

        buildings.push({
            id: `osm-${element.id}`,
            name: element.tags.name || `Building ${element.id}`,
            commune: "", // Will be determined by spatial query
            coordinates: { lat: center[1], lon: center[0] },
            footprint,
            height,
            sector,
            floors: element.tags["building:levels"]
                ? parseInt(element.tags["building:levels"], 10)
                : Math.floor(height / 3),
            enterpriseCount: 0, // OSM doesn't have enterprise count
            metadata: {
                osmId: element.id,
                osmType: element.type,
                buildingType: element.tags.building,
                area: calculatePolygonArea(footprint),
            },
        });
    }

    return buildings;
}

/**
 * Extract building height from OSM tags
 * Priority: height tag > levels * 3m > default 9m
 */
function extractHeight(tags: OSMElement["tags"]): number {
    if (!tags) return 9;

    // Direct height tag (in meters)
    if (tags.height) {
        const height = parseFloat(tags.height);
        if (!isNaN(height)) return height;
    }

    // Building levels
    if (tags["building:levels"]) {
        const levels = parseInt(tags["building:levels"], 10);
        if (!isNaN(levels)) return levels * 3; // 3m per floor
    }

    // Default by building type
    const buildingType = tags.building;
    const defaultHeights: Record<string, number> = {
        house: 6,
        detached: 6,
        terrace: 6,
        apartments: 12,
        residential: 12,
        commercial: 9,
        retail: 9,
        office: 15,
        industrial: 12,
        warehouse: 9,
        hotel: 15,
        school: 9,
        university: 12,
        hospital: 18,
        church: 18,
        cathedral: 30,
    };

    return defaultHeights[buildingType || ""] || 9;
}

/**
 * Map OSM building/amenity tags to sector
 */
function mapOSMBuildingToSector(tags: OSMElement["tags"]): string {
    if (!tags) return "other";

    // Check amenity tag first (more specific)
    if (tags.amenity) {
        const amenityMap: Record<string, string> = {
            restaurant: "tourism",
            cafe: "tourism",
            bar: "tourism",
            fast_food: "tourism",
            pub: "tourism",
            hotel: "tourism",
            bank: "finance",
            clinic: "health",
            hospital: "health",
            pharmacy: "health",
            doctors: "health",
            dentist: "health",
            school: "education",
            university: "education",
            college: "education",
            library: "culture",
            theatre: "culture",
            cinema: "culture",
            museum: "culture",
            townhall: "public",
            post_office: "public",
            police: "public",
            fire_station: "public",
        };

        if (amenityMap[tags.amenity]) return amenityMap[tags.amenity];
    }

    // Check shop tag
    if (tags.shop) return "commerce";

    // Check tourism tag
    if (tags.tourism) return "tourism";

    // Check office tag
    if (tags.office) {
        if (tags.office === "government") return "public";
        return "services";
    }

    // Check building tag
    const buildingType = tags.building;
    const buildingMap: Record<string, string> = {
        house: "residential",
        detached: "residential",
        terrace: "residential",
        apartments: "residential",
        residential: "residential",
        commercial: "commerce",
        retail: "commerce",
        office: "services",
        industrial: "industry",
        warehouse: "industry",
        manufacture: "industry",
        hotel: "tourism",
        school: "education",
        university: "education",
        hospital: "health",
        church: "culture",
        cathedral: "culture",
        chapel: "culture",
        mosque: "culture",
        synagogue: "culture",
        temple: "culture",
    };

    return buildingMap[buildingType || ""] || "other";
}

/**
 * Calculate polygon center (centroid)
 */
function calculateCenter(coords: [number, number][]): [number, number] {
    if (coords.length === 0) return [0, 0];

    const sum = coords.reduce(
        (acc, [lon, lat]) => [acc[0] + lon, acc[1] + lat],
        [0, 0],
    );

    return [sum[0] / coords.length, sum[1] / coords.length];
}

/**
 * Calculate polygon area using Shoelace formula
 * Returns area in square meters (approximate)
 */
function calculatePolygonArea(coords: [number, number][]): number {
    if (coords.length < 3) return 0;

    let area = 0;
    const n = coords.length;

    for (let i = 0; i < n; i++) {
        const [x1, y1] = coords[i];
        const [x2, y2] = coords[(i + 1) % n];
        area += x1 * y2 - x2 * y1;
    }

    // Convert from degrees² to m² (very rough approximation)
    // At latitude 45°, 1° ≈ 111km
    const metersPerDegree = 111000;
    return (Math.abs(area) / 2) * metersPerDegree * metersPerDegree;
}

/**
 * Fetch POIs (Points of Interest) from OpenStreetMap
 * @param bbox Bounding box [minLat, minLon, maxLat, maxLon]
 * @param categories POI categories to fetch (amenity, shop, tourism, etc.)
 */
export async function fetchOSMPOIs(
    bbox: [number, number, number, number],
    categories: string[] = ["amenity", "shop", "tourism"],
): Promise<
    Array<{
        id: string;
        name: string;
        category: string;
        type: string;
        lat: number;
        lon: number;
    }>
> {
    const [minLat, minLon, maxLat, maxLon] = bbox;
    const cacheKey = `osm-pois-${bbox.join("-")}-${categories.join("-")}`;

    return fetchWithCache(
        cacheKey,
        async () => {
            // Build query for multiple categories
            const categoryQueries = categories
                .map(
                    (cat) =>
                        `node["${cat}"](${minLat},${minLon},${maxLat},${maxLon});`,
                )
                .join("\n  ");

            const query = `
        [out:json][timeout:30];
        (
          ${categoryQueries}
        );
        out;
      `;

            const response = await fetch(OVERPASS_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `data=${encodeURIComponent(query)}`,
            });

            if (!response.ok) {
                throw new Error(`Overpass API error: ${response.status}`);
            }

            const data: OSMResponse = await response.json();

            return data.elements
                .filter((el) => el.type === "node" && el.lat && el.lon)
                .map((el) => {
                    const category =
                        categories.find((cat) => el.tags?.[cat]) || "unknown";
                    const type = el.tags?.[category] || "unknown";

                    return {
                        id: `osm-poi-${el.id}`,
                        name: el.tags?.name || `${type} ${el.id}`,
                        category,
                        type,
                        lat: el.lat!,
                        lon: el.lon!,
                    };
                });
        },
        24 * 60 * 60 * 1000, // Cache for 24 hours
    );
}
