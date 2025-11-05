/**
 * React Hooks for Commune Data Integration
 *
 * These hooks provide an easy way to load and use commune data
 * from geo.api.gouv.fr in your React components.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { CommuneData } from "@/types/map";
import {
    loadDepartmentCommunes,
    loadMajorCommunes,
    loadCommuneByCode,
    loadPredefinedCities,
    communesToSceneCommunes,
    getCommuneCameraPosition,
    searchCommunes as searchCommunesService,
} from "@/lib/map-integration/geo-data-loader";
import { Vector3 } from "three";

/**
 * Hook to load all communes in département 06
 */
export function useDepartmentCommunes(options?: {
    includeGeometry?: boolean;
    minPopulation?: number;
    autoLoad?: boolean;
}) {
    const [communes, setCommunes] = useState<CommuneData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const loadCommunes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await loadDepartmentCommunes(options);
            setCommunes(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err
                    : new Error("Failed to load communes"),
            );
        } finally {
            setLoading(false);
        }
    }, [options]);

    useEffect(() => {
        if (options?.autoLoad !== false) {
            loadCommunes();
        }
    }, [options?.autoLoad, loadCommunes]);

    return {
        communes,
        loading,
        error,
        reload: loadCommunes,
    };
}

/**
 * Hook to load major cities (population > threshold)
 */
export function useMajorCities(minPopulation: number = 10000, autoLoad = true) {
    const [cities, setCities] = useState<CommuneData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const loadCities = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await loadMajorCommunes(minPopulation);
            setCities(data);
        } catch (err) {
            setError(
                err instanceof Error ? err : new Error("Failed to load cities"),
            );
        } finally {
            setLoading(false);
        }
    }, [minPopulation]);

    useEffect(() => {
        if (autoLoad) {
            loadCities();
        }
    }, [autoLoad, loadCities]);

    return {
        cities,
        loading,
        error,
        reload: loadCities,
    };
}

/**
 * Hook to load pre-defined major cities (Nice, Cannes, etc.)
 */
export function usePredefinedCities(autoLoad = true) {
    const [cities, setCities] = useState<CommuneData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const loadCities = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await loadPredefinedCities();
            setCities(data);
        } catch (err) {
            setError(
                err instanceof Error ? err : new Error("Failed to load cities"),
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (autoLoad) {
            loadCities();
        }
    }, [autoLoad, loadCities]);

    return {
        cities,
        loading,
        error,
        reload: loadCities,
    };
}

/**
 * Hook to load a specific commune by code
 */
export function useCommune(communeCode: string | null, includeGeometry = true) {
    const [commune, setCommune] = useState<CommuneData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!communeCode) {
            setCommune(null);
            return;
        }

        let cancelled = false;

        const loadCommune = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await loadCommuneByCode(
                    communeCode,
                    includeGeometry,
                );
                if (!cancelled) {
                    setCommune(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err
                            : new Error("Failed to load commune"),
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadCommune();

        return () => {
            cancelled = true;
        };
    }, [communeCode, includeGeometry]);

    return {
        commune,
        loading,
        error,
    };
}

/**
 * Hook to convert commune data to 3D scene format
 */
export function useSceneCommunes(communes: CommuneData[]) {
    const sceneCommunes = useMemo(() => {
        if (communes.length > 0) {
            return communesToSceneCommunes(communes);
        }
        return [];
    }, [communes]);

    return sceneCommunes;
}

/**
 * Hook to get camera position for focusing on a commune
 */
export function useCommuneCamera(communeCode: string | null) {
    const [cameraData, setCameraData] = useState<{
        position: Vector3;
        target: Vector3;
    } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!communeCode) {
            setCameraData(null);
            return;
        }

        let cancelled = false;

        const loadCamera = async () => {
            setLoading(true);
            try {
                const data = await getCommuneCameraPosition(communeCode);
                if (!cancelled && data) {
                    setCameraData(data);
                }
            } catch (err) {
                console.error("Failed to calculate camera position:", err);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadCamera();

        return () => {
            cancelled = true;
        };
    }, [communeCode]);

    return {
        cameraData,
        loading,
    };
}

/**
 * Hook to search communes by name
 */
export function useSearchCommunes() {
    const [results, setResults] = useState<CommuneData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const search = useCallback(async (query: string, limit = 5) => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await searchCommunesService(query, limit);
            setResults(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Search failed"));
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const clearResults = useCallback(() => {
        setResults([]);
        setError(null);
    }, []);

    return {
        results,
        loading,
        error,
        search,
        clearResults,
    };
}

/**
 * Utility hook for commune selection and focus
 */
export function useCommuneSelection() {
    const [selectedCommune, setSelectedCommune] = useState<string | null>(null);
    const { commune, loading } = useCommune(selectedCommune, true);
    const { cameraData } = useCommuneCamera(selectedCommune);

    const selectCommune = useCallback((code: string | null) => {
        setSelectedCommune(code);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedCommune(null);
    }, []);

    return {
        selectedCommune,
        commune,
        cameraData,
        loading,
        selectCommune,
        clearSelection,
    };
}
