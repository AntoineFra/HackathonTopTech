"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { MapState, MapAction, ColorScheme, MapFilter } from "@/types/map";
import { Vector3 } from "three";

interface MapContextValue {
    mapState: MapState;
    updateColorScheme: (scheme: ColorScheme) => void;
    applyMapAction: (action: MapAction) => void;
    selectBuilding: (buildingId?: string) => void;
    selectCommune: (communeId?: string) => void;
    setFilter: (filter?: MapFilter) => void;
    resetView: () => void;
}

const MapContext = createContext<MapContextValue | undefined>(undefined);

const initialMapState: MapState = {
    colorScheme: "default",
    highlightedFeatures: [],
    visualizationMode: "3d-buildings",
    isLoading: false,
};

export function MapProvider({ children }: { children: React.ReactNode }) {
    const [mapState, setMapState] = useState<MapState>(initialMapState);

    const updateColorScheme = useCallback((scheme: ColorScheme) => {
        setMapState((prev) => ({ ...prev, colorScheme: scheme }));
    }, []);

    const selectBuilding = useCallback((buildingId?: string) => {
        setMapState((prev) => ({ ...prev, selectedBuilding: buildingId }));
    }, []);

    const selectCommune = useCallback((communeId?: string) => {
        setMapState((prev) => ({ ...prev, selectedCommune: communeId }));
    }, []);

    const setFilter = useCallback((filter?: MapFilter) => {
        setMapState((prev) => ({ ...prev, filter }));
    }, []);

    const resetView = useCallback(() => {
        setMapState(initialMapState);
    }, []);

    const applyMapAction = useCallback((action: MapAction) => {
        setMapState((prev) => {
            const newState = { ...prev };

            switch (action.type) {
                case "color":
                    if (action.colorScheme) {
                        newState.colorScheme = action.colorScheme;
                    }
                    break;
                case "filter":
                    if (action.filter) {
                        newState.filter = action.filter;
                    }
                    break;
                case "focus":
                    if (action.focusOn?.commune) {
                        newState.selectedCommune = action.focusOn.commune;
                    }
                    if (action.focusOn?.building) {
                        newState.selectedBuilding = action.focusOn.building;
                    }
                    if (action.focusOn?.coordinates) {
                        // Store camera position for focusing
                        const { lat, lon } = action.focusOn.coordinates;
                        newState.cameraPosition = new Vector3(
                            lon * 10000,
                            100,
                            -lat * 10000,
                        );
                    }
                    break;
                case "highlight":
                    if (action.highlightFeatures) {
                        newState.highlightedFeatures = action.highlightFeatures;
                    }
                    break;
                case "mode":
                    if (action.visualizationMode) {
                        newState.visualizationMode = action.visualizationMode;
                    }
                    break;
            }

            return newState;
        });
    }, []);

    const value: MapContextValue = {
        mapState,
        updateColorScheme,
        applyMapAction,
        selectBuilding,
        selectCommune,
        setFilter,
        resetView,
    };

    return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMap() {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error("useMap must be used within MapProvider");
    }
    return context;
}
