"use client";

import React, { useMemo } from "react";
import { MapProvider } from "./map-context";
import { Map3DScene } from "./map-3d-scene";
import { MapLegend } from "./map-legend";
import { MapControls } from "./map-controls";
import { BuildingInfoPanel } from "./building-info-panel";
import {
    generateAllBuildings,
    COMMUNES_06,
} from "@/lib/geo-data/department-06";

export function Map3DViewer() {
    // Generate buildings once on mount
    const buildings = useMemo(() => generateAllBuildings(), []);

    return (
        <MapProvider>
            <div className="relative h-[800px] w-full overflow-hidden rounded-lg bg-slate-900 shadow-2xl">
                {/* 3D Scene */}
                <Map3DScene buildings={buildings} />

                {/* UI Overlays */}
                <div className="absolute top-4 left-4 z-10">
                    <MapLegend />
                </div>

                <div className="absolute top-4 right-4 z-10">
                    <MapControls communes={COMMUNES_06} />
                </div>

                <div className="absolute right-4 bottom-4 z-10">
                    <BuildingInfoPanel buildings={buildings} />
                </div>

                {/* Loading indicator */}
                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                    <div className="text-center text-white">
                        <p className="text-sm opacity-50">
                            Utilisez la souris pour naviguer
                        </p>
                        <p className="mt-1 text-xs opacity-30">
                            Cliquez sur un bâtiment pour plus d&apos;infos
                        </p>
                    </div>
                </div>
            </div>
        </MapProvider>
    );
}
