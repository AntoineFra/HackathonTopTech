/**
 * MINIMAL EXAMPLE - Map with Real Commune Data
 *
 * This is the simplest possible example showing how to integrate
 * geo.api.gouv.fr commune data with your 3D map.
 *
 * Copy this code and modify as needed!
 */

"use client";

import React from "react";
import {
    usePredefinedCities,
    useSceneCommunes,
    useSearchCommunes,
    useCommune,
    useMajorCities,
    useDepartmentCommunes,
} from "@/lib/hooks/use-commune-data";

export function MinimalMapExample() {
    // 1. Load the 14 major cities (Nice, Cannes, etc.)
    const { cities, loading, error } = usePredefinedCities();

    // 2. Convert to 3D scene format
    const sceneCommunes = useSceneCommunes(cities);

    // 3. Handle loading and error states
    if (loading) {
        return (
            <div className="flex h-[600px] items-center justify-center rounded-lg bg-slate-900">
                <div className="text-white">Chargement des communes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[600px] items-center justify-center rounded-lg bg-slate-900">
                <div className="text-red-400">Erreur: {error.message}</div>
            </div>
        );
    }

    // 4. Display the data
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">
                Communes chargées: {cities.length}
            </h2>

            {/* List of cities */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {cities.map((city) => (
                    <div key={city.id} className="rounded-lg bg-slate-800 p-4">
                        <h3 className="font-semibold text-white">
                            {city.name}
                        </h3>
                        <p className="text-sm text-slate-400">
                            Population:{" "}
                            {city.population?.toLocaleString() || "N/A"}
                        </p>
                        <p className="text-sm text-slate-400">
                            Surface: {city.area?.toFixed(2) || "N/A"} km²
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                            Code: {city.id}
                        </p>
                    </div>
                ))}
            </div>

            {/* Scene commune data (ready for 3D rendering) */}
            <div className="rounded-lg bg-slate-800 p-4">
                <h3 className="mb-2 font-semibold text-white">
                    Données 3D prêtes
                </h3>
                <p className="text-sm text-slate-400">
                    {sceneCommunes.length} communes converties en format 3D
                </p>
                <p className="mt-1 text-xs text-slate-500">
                    Chaque commune a: boundary (Vector3[]), center (Vector3),
                    userData
                </p>
            </div>

            {/* Next step: Pass to Map3DScene */}
            <div className="rounded-lg border border-blue-500 bg-blue-900/20 p-4">
                <h3 className="mb-2 font-semibold text-blue-300">
                    💡 Prochaine étape
                </h3>
                <p className="text-sm text-slate-300">
                    Passez{" "}
                    <code className="rounded bg-slate-700 px-2 py-1">
                        sceneCommunes
                    </code>{" "}
                    à votre composant{" "}
                    <code className="rounded bg-slate-700 px-2 py-1">
                        Map3DScene
                    </code>
                    :
                </p>
                <pre className="mt-2 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-green-400">
                    {`<Map3DScene 
  buildings={buildings}
  communes={sceneCommunes}
/>`}
                </pre>
            </div>
        </div>
    );
}

// ============================================================
// VARIANT: With Search
// ============================================================

export function MapWithSearch() {
    const { results, loading, search, clearResults } = useSearchCommunes();
    const [selectedCode, setSelectedCode] = React.useState<string | null>(null);
    const { commune } = useCommune(selectedCode);

    return (
        <div className="space-y-4">
            {/* Search input */}
            <div>
                <input
                    type="text"
                    placeholder="Rechercher une commune..."
                    onChange={(e) => {
                        if (e.target.value) {
                            search(e.target.value, 5);
                        } else {
                            clearResults();
                        }
                    }}
                    className="w-full rounded-lg bg-slate-800 px-4 py-2 text-white"
                />
            </div>

            {/* Search results */}
            {loading && <div className="text-slate-400">Recherche...</div>}

            {results.length > 0 && (
                <div className="space-y-2">
                    <h3 className="font-semibold text-white">Résultats:</h3>
                    {results.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedCode(c.id)}
                            className="w-full rounded-lg bg-slate-800 p-3 text-left transition-colors hover:bg-slate-700"
                        >
                            <div className="font-medium text-white">
                                {c.name}
                            </div>
                            <div className="text-sm text-slate-400">
                                {c.population?.toLocaleString()} habitants
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Selected commune details */}
            {commune && (
                <div className="rounded-lg border border-blue-500 bg-blue-900/20 p-4">
                    <h3 className="text-xl font-bold text-white">
                        {commune.name}
                    </h3>
                    <div className="mt-2 space-y-1 text-sm text-slate-300">
                        <p>
                            Population: {commune.population?.toLocaleString()}
                        </p>
                        <p>Surface: {commune.area?.toFixed(2)} km²</p>
                        <p>Code INSEE: {commune.id}</p>
                        {commune.population && commune.area && (
                            <p>
                                Densité:{" "}
                                {(commune.population / commune.area).toFixed(0)}{" "}
                                hab/km²
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================================
// VARIANT: Progressive Loading
// ============================================================

export function MapWithProgressiveLoading() {
    const [level, setLevel] = React.useState<"fast" | "medium" | "all">("fast");

    // Load different datasets based on level
    const { cities: predefined, loading: l1 } = usePredefinedCities(
        level === "fast",
    );
    const { cities: major, loading: l2 } = useMajorCities(
        5000,
        level === "medium",
    );
    const { communes: all, loading: l3 } = useDepartmentCommunes({
        autoLoad: level === "all",
    });

    const currentCommunes =
        level === "fast" ? predefined : level === "medium" ? major : all;

    const loading = l1 || l2 || l3;

    return (
        <div className="space-y-4">
            {/* Level selector */}
            <div className="flex gap-2">
                <button
                    onClick={() => setLevel("fast")}
                    className={`rounded-lg px-4 py-2 ${
                        level === "fast"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-800 text-slate-400"
                    }`}
                >
                    Rapide ({predefined.length} villes)
                </button>
                <button
                    onClick={() => setLevel("medium")}
                    className={`rounded-lg px-4 py-2 ${
                        level === "medium"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-800 text-slate-400"
                    }`}
                >
                    Moyen (&gt;5k hab)
                </button>
                <button
                    onClick={() => setLevel("all")}
                    className={`rounded-lg px-4 py-2 ${
                        level === "all"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-800 text-slate-400"
                    }`}
                >
                    Toutes (163 communes)
                </button>
            </div>

            {/* Status */}
            <div className="rounded-lg bg-slate-800 p-4">
                {loading ? (
                    <div className="text-slate-400">Chargement...</div>
                ) : (
                    <div className="text-white">
                        ✓ {currentCommunes.length} communes chargées
                    </div>
                )}
            </div>

            {/* Communes list (first 20) */}
            <div className="grid grid-cols-2 gap-2">
                {currentCommunes.slice(0, 20).map((c: any) => (
                    <div
                        key={c.id}
                        className="rounded bg-slate-800 p-2 text-sm"
                    >
                        <div className="font-medium text-white">{c.name}</div>
                        <div className="text-xs text-slate-400">
                            {c.population?.toLocaleString() || "N/A"}
                        </div>
                    </div>
                ))}
            </div>

            {currentCommunes.length > 20 && (
                <p className="text-sm text-slate-400">
                    ... et {currentCommunes.length - 20} autres
                </p>
            )}
        </div>
    );
}
