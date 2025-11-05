/**
 * React Hooks for Real Data Integration
 * Provides easy-to-use hooks for fetching real building and enterprise data
 */

import { useState, useEffect } from "react";
import type { BuildingData } from "@/types/map";
import { fetchIGNBuildings } from "../data-sources/ign-service";
import { fetchOSMBuildings } from "../data-sources/osm-service";
import {
    fetchEnterprisesInCommune,
    calculateSectorStats,
    calculateTotalEmployment,
    type INSEEEtablissement,
} from "../data-sources/insee-service";

export type DataSource = "mock" | "ign" | "osm";

interface UseRealBuildingDataOptions {
    source: DataSource;
    bbox: [number, number, number, number];
    autoFetch?: boolean;
}

interface UseRealBuildingDataReturn {
    buildings: BuildingData[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Hook to fetch real building data from IGN or OSM
 */
export function useRealBuildingData({
    source,
    bbox,
    autoFetch = true,
}: UseRealBuildingDataOptions): UseRealBuildingDataReturn {
    const [buildings, setBuildings] = useState<BuildingData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        if (source === "mock") {
            // Use mock data - handled by the component
            setBuildings([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let data: BuildingData[] = [];

            if (source === "ign") {
                // IGN uses [minLon, minLat, maxLon, maxLat]
                data = await fetchIGNBuildings(bbox);
            } else if (source === "osm") {
                // OSM uses [minLat, minLon, maxLat, maxLon]
                const osmBbox: [number, number, number, number] = [
                    bbox[1],
                    bbox[0],
                    bbox[3],
                    bbox[2],
                ];
                data = await fetchOSMBuildings(osmBbox);
            }

            setBuildings(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err
                    : new Error("Failed to fetch buildings"),
            );
            console.error(`Error fetching buildings from ${source}:`, err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source, bbox.join(","), autoFetch]);

    return {
        buildings,
        loading,
        error,
        refetch: fetchData,
    };
}

interface UseCommuneEnterprisesOptions {
    communeCode: string;
    autoFetch?: boolean;
}

interface UseCommuneEnterprisesReturn {
    enterprises: INSEEEtablissement[];
    sectorStats: Record<string, number>;
    totalEmployment: number;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Hook to fetch enterprise data for a commune from INSEE
 */
export function useCommuneEnterprises({
    communeCode,
    autoFetch = true,
}: UseCommuneEnterprisesOptions): UseCommuneEnterprisesReturn {
    const [enterprises, setEnterprises] = useState<INSEEEtablissement[]>([]);
    const [sectorStats, setSectorStats] = useState<Record<string, number>>({});
    const [totalEmployment, setTotalEmployment] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        if (!communeCode) return;

        setLoading(true);
        setError(null);

        try {
            const data = await fetchEnterprisesInCommune(communeCode, true);
            setEnterprises(data);

            // Calculate statistics
            const sectors = calculateSectorStats(data);
            setSectorStats(sectors);

            const employment = calculateTotalEmployment(data);
            setTotalEmployment(employment);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err
                    : new Error("Failed to fetch enterprise data"),
            );
            console.error("Error fetching enterprises:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (autoFetch && communeCode) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [communeCode, autoFetch]);

    return {
        enterprises,
        sectorStats,
        totalEmployment,
        loading,
        error,
        refetch: fetchData,
    };
}

/**
 * Hook to combine IGN/OSM building data with INSEE enterprise data
 */
export function useEnrichedBuildingData(
    buildingSource: DataSource,
    bbox: [number, number, number, number],
    communeCode?: string,
) {
    const buildingData = useRealBuildingData({
        source: buildingSource,
        bbox,
    });

    const enterpriseData = useCommuneEnterprises({
        communeCode: communeCode || "",
        autoFetch: !!communeCode,
    });

    // Combine the data
    const enrichedBuildings = buildingData.buildings.map((building) => {
        // Try to match buildings with enterprises by proximity or sector
        // This is a simplified version - a production system would use
        // spatial queries or address matching
        const buildingSector = building.sector || "other";
        const sectorCount = enterpriseData.sectorStats[buildingSector] || 0;

        return {
            ...building,
            enterpriseCount: sectorCount > 0 ? Math.ceil(sectorCount / 10) : 0,
            metadata: {
                ...building.metadata,
                sectorEnterprises: sectorCount,
            },
        };
    });

    return {
        buildings: enrichedBuildings,
        sectorStats: enterpriseData.sectorStats,
        totalEmployment: enterpriseData.totalEmployment,
        loading: buildingData.loading || enterpriseData.loading,
        error: buildingData.error || enterpriseData.error,
        refetch: async () => {
            await Promise.all([
                buildingData.refetch(),
                enterpriseData.refetch(),
            ]);
        },
    };
}
