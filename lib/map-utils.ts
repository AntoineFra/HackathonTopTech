import { Vector3 } from "three";
import { GeoCoordinate } from "@/types/map";

/**
 * Convert geographic coordinates (lat/lon) to 3D space coordinates
 * Using simple Mercator projection for visualization
 */
export function geoToWorld(
    coord: GeoCoordinate,
    scale: number = 10000,
): Vector3 {
    // Simple Mercator projection
    const x = coord.lon * scale;
    const z = -coord.lat * scale; // Negative because Three.js Z axis
    const y = 0; // Ground level

    return new Vector3(x, y, z);
}

/**
 * Convert polygon coordinates to 3D vertices
 */
export function polygonToVertices(
    polygon: number[][],
    scale: number = 10000,
): Vector3[] {
    return polygon.map(([lon, lat]) => geoToWorld({ lat, lon }, scale));
}

/**
 * Calculate center point of a polygon
 */
export function getPolygonCenter(polygon: number[][]): GeoCoordinate {
    const sum = polygon.reduce(
        (acc, [lon, lat]) => ({
            lon: acc.lon + lon,
            lat: acc.lat + lat,
        }),
        { lon: 0, lat: 0 },
    );

    return {
        lon: sum.lon / polygon.length,
        lat: sum.lat / polygon.length,
    };
}

/**
 * Normalize a value between 0 and 1 based on min/max range
 */
export function normalizeValue(
    value: number,
    min: number,
    max: number,
): number {
    if (max === min) return 0.5;
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Interpolate between two colors
 */
export function interpolateColor(
    color1: string,
    color2: string,
    factor: number,
): string {
    // Parse hex colors
    const c1 = parseInt(color1.replace("#", ""), 16);
    const c2 = parseInt(color2.replace("#", ""), 16);

    const r1 = (c1 >> 16) & 0xff;
    const g1 = (c1 >> 8) & 0xff;
    const b1 = c1 & 0xff;

    const r2 = (c2 >> 16) & 0xff;
    const g2 = (c2 >> 8) & 0xff;
    const b2 = c2 & 0xff;

    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Get color for a value based on color scale
 */
export function getColorForValue(
    value: number,
    min: number,
    max: number,
    colorScale: { min: string; max: string; mid?: string },
): string {
    const normalized = normalizeValue(value, min, max);

    if (colorScale.mid) {
        // Three-color gradient
        if (normalized < 0.5) {
            return interpolateColor(
                colorScale.min,
                colorScale.mid,
                normalized * 2,
            );
        } else {
            return interpolateColor(
                colorScale.mid,
                colorScale.max,
                (normalized - 0.5) * 2,
            );
        }
    } else {
        // Two-color gradient
        return interpolateColor(colorScale.min, colorScale.max, normalized);
    }
}

/**
 * Calculate bounds for a set of coordinates
 */
export function calculateBounds(coordinates: GeoCoordinate[]): {
    north: number;
    south: number;
    east: number;
    west: number;
} {
    if (coordinates.length === 0) {
        return { north: 0, south: 0, east: 0, west: 0 };
    }

    let north = coordinates[0].lat;
    let south = coordinates[0].lat;
    let east = coordinates[0].lon;
    let west = coordinates[0].lon;

    for (const coord of coordinates) {
        north = Math.max(north, coord.lat);
        south = Math.min(south, coord.lat);
        east = Math.max(east, coord.lon);
        west = Math.min(west, coord.lon);
    }

    return { north, south, east, west };
}

/**
 * Check if a point is inside a polygon (ray casting algorithm)
 */
export function isPointInPolygon(
    point: GeoCoordinate,
    polygon: number[][],
): boolean {
    let inside = false;
    const { lat, lon } = point;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];

        const intersect =
            yi > lat !== yj > lat &&
            lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;

        if (intersect) inside = !inside;
    }

    return inside;
}
