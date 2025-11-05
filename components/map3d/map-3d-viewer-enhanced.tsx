/**
 * Enhanced Map3D Viewer with Real Commune Data
 *
 * This component demonstrates how to integrate geo.api.gouv.fr commune data
 * with the 3D map visualization.
 */

"use client";

import React, { useState } from "react";
import { MapProvider } from "../map3d/map-context";
import { Map3DScene } from "../map3d/map-3d-scene";
import { MapLegend } from "../map3d/map-legend";
import { MapControls } from "../map3d/map-controls";
import { BuildingInfoPanel } from "../map3d/building-info-panel";
import {
    usePredefinedCities,
    useMajorCities,
    useSceneCommunes,
    useCommuneSelection,
} from "@/lib/hooks/use-commune-data";
import { generateAllBuildings } from "@/lib/geo-data/department-06";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

type ViewMode = "predefined" | "major" | "all";

export function Map3DViewerEnhanced() {
    const [viewMode, setViewMode] = useState<ViewMode>("predefined");

    // Load different sets of communes based on view mode
    const { cities: predefinedCities, loading: loadingPredefined } =
        usePredefinedCities(viewMode === "predefined");
    const { cities: majorCities, loading: loadingMajor } = useMajorCities(
        5000,
        viewMode === "major",
    );

    // Commune selection hook
    const {
        selectedCommune,
        commune,
        cameraData,
        loading: loadingCommune,
        selectCommune,
        clearSelection,
    } = useCommuneSelection();

    // Get the appropriate commune list based on view mode
    const communes =
        viewMode === "predefined"
            ? predefinedCities
            : viewMode === "major"
              ? majorCities
              : [];

    // Convert to scene format
    const sceneCommunes = useSceneCommunes(communes);

    // Generate buildings (mock data for now)
    const buildings = React.useMemo(() => generateAllBuildings(), []);

    const isLoading = loadingPredefined || loadingMajor || loadingCommune;

    return (
        <MapProvider>
            <div className="relative h-[800px] w-full overflow-hidden rounded-lg bg-slate-900 shadow-2xl">
                {/* 3D Scene */}
                <Map3DScene
                    buildings={buildings}
                    communes={sceneCommunes}
                    focusCamera={cameraData}
                />

                {/* View Mode Selector */}
                <div className="absolute top-4 left-4 z-10 space-y-2">
                    <Card className="border-slate-700 bg-slate-800/90 p-3 backdrop-blur">
                        <div className="mb-2 text-xs font-medium text-slate-200">
                            Vue des communes
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button
                                size="sm"
                                variant={
                                    viewMode === "predefined"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() => setViewMode("predefined")}
                                className="w-full justify-start text-xs"
                            >
                                Villes principales ({predefinedCities.length})
                            </Button>
                            <Button
                                size="sm"
                                variant={
                                    viewMode === "major" ? "default" : "outline"
                                }
                                onClick={() => setViewMode("major")}
                                className="w-full justify-start text-xs"
                            >
                                Communes &gt; 5000 hab ({majorCities.length})
                            </Button>
                        </div>
                    </Card>

                    {/* Commune List */}
                    {communes.length > 0 && (
                        <Card className="max-h-[400px] overflow-y-auto border-slate-700 bg-slate-800/90 p-3 backdrop-blur">
                            <div className="mb-2 text-xs font-medium text-slate-200">
                                Communes disponibles
                            </div>
                            <div className="space-y-1">
                                {communes.slice(0, 15).map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => selectCommune(c.id)}
                                        className={`w-full rounded px-2 py-1 text-left text-xs transition-colors hover:bg-slate-700 ${
                                            selectedCommune === c.id
                                                ? "bg-blue-600 text-white"
                                                : "text-slate-300"
                                        }`}
                                    >
                                        <div className="font-medium">
                                            {c.name}
                                        </div>
                                        <div className="text-xs opacity-70">
                                            {c.population?.toLocaleString() ||
                                                "N/A"}{" "}
                                            hab
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Map Legend */}
                <div className="absolute top-4 right-4 z-10">
                    <MapLegend />
                </div>

                {/* Map Controls */}
                <div className="absolute right-4 bottom-4 z-10">
                    <MapControls communes={communes} />
                </div>

                {/* Selected Commune Info */}
                {commune && (
                    <Card className="absolute bottom-4 left-4 z-10 max-w-sm border-slate-700 bg-slate-800/90 p-4 backdrop-blur">
                        <div className="space-y-2">
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    {commune.name}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Code INSEE: {commune.id}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <div className="text-xs text-slate-400">
                                        Population
                                    </div>
                                    <div className="font-semibold text-white">
                                        {commune.population?.toLocaleString() ||
                                            "N/A"}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">
                                        Surface
                                    </div>
                                    <div className="font-semibold text-white">
                                        {commune.area?.toFixed(2) || "N/A"} km²
                                    </div>
                                </div>
                                {commune.population && commune.area && (
                                    <div>
                                        <div className="text-xs text-slate-400">
                                            Densité
                                        </div>
                                        <div className="font-semibold text-white">
                                            {(
                                                commune.population /
                                                commune.area
                                            ).toFixed(0)}{" "}
                                            hab/km²
                                        </div>
                                    </div>
                                )}
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={clearSelection}
                                className="mt-2 w-full"
                            >
                                Fermer
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Building Info Panel */}
                <div className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
                    <BuildingInfoPanel buildings={buildings} />
                </div>

                {/* Loading indicator */}
                {isLoading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <Card className="border-slate-700 bg-slate-800 p-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                                <div className="text-white">
                                    Chargement des données...
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Instructions */}
                {!isLoading && (
                    <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                        <div className="text-center text-white">
                            <p className="text-sm opacity-50">
                                Utilisez la souris pour naviguer
                            </p>
                            <p className="mt-1 text-xs opacity-30">
                                Cliquez sur une commune ou un bâtiment pour plus
                                d&apos;infos
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </MapProvider>
    );
}
