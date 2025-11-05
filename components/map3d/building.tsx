"use client";

import React, { useMemo, useRef, useState } from "react";
import { Mesh, ExtrudeGeometry, Shape } from "three";
import { ThreeEvent } from "@react-three/fiber";
import { BuildingData } from "@/types/map";
import { geoToWorld } from "@/lib/map-utils";
import { useMap } from "./map-context";
import { COLOR_SCHEMES } from "@/lib/map-colors";
import { getColorForValue, getSectorColor } from "@/lib/map-colors";

interface BuildingProps {
    building: BuildingData;
    allBuildings: BuildingData[];
}

export function Building({ building, allBuildings }: BuildingProps) {
    const meshRef = useRef<Mesh>(null);
    const [hovered, setHovered] = useState(false);
    const { mapState, selectBuilding } = useMap();

    const isSelected = mapState.selectedBuilding === building.id;
    const isHighlighted = mapState.highlightedFeatures.includes(building.id);

    // Create building geometry from footprint
    const geometry = useMemo(() => {
        const shape = new Shape();
        const scale = 10000;

        building.footprint.forEach(([lon, lat], index) => {
            const point = geoToWorld({ lat, lon }, scale);
            const center = geoToWorld(building.coordinates, scale);

            // Convert to local coordinates relative to building center
            const localX = point.x - center.x;
            const localZ = point.z - center.z;

            if (index === 0) {
                shape.moveTo(localX, localZ);
            } else {
                shape.lineTo(localX, localZ);
            }
        });

        const extrudeSettings = {
            depth: building.height || 10,
            bevelEnabled: false,
        };

        return new ExtrudeGeometry(shape, extrudeSettings);
    }, [building]);

    // Calculate position
    const position = useMemo(() => {
        const worldPos = geoToWorld(building.coordinates, 10000);
        return [worldPos.x, 0, worldPos.z] as [number, number, number];
    }, [building.coordinates]);

    // Determine color based on current scheme
    const color = useMemo(() => {
        const scheme = COLOR_SCHEMES[mapState.colorScheme];

        if (mapState.colorScheme === "default") {
            return "#e0e0e0";
        }

        if (mapState.colorScheme === "sectors") {
            return getSectorColor(building.sector);
        }

        if (mapState.colorScheme === "enterprises") {
            const values = allBuildings
                .map((b) => b.enterpriseCount || 0)
                .filter((v) => v > 0);
            const min = Math.min(...values, 0);
            const max = Math.max(...values, 1);
            const value = building.enterpriseCount || 0;

            return getColorForValue(value, min, max, scheme.colorScale);
        }

        // Default grey for buildings without data
        return "#bdbdbd";
    }, [mapState.colorScheme, building, allBuildings]);

    // Handle interactions
    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        selectBuilding(building.id);
    };

    const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
    };

    const handlePointerOut = () => {
        setHovered(false);
        document.body.style.cursor = "default";
    };

    // Determine final color with hover/selection states
    const finalColor = isSelected
        ? "#ffeb3b"
        : isHighlighted
          ? "#ff9800"
          : hovered
            ? "#90caf9"
            : color;

    const emissive =
        isSelected || isHighlighted || hovered ? finalColor : "#000000";
    const emissiveIntensity = isSelected
        ? 0.4
        : isHighlighted
          ? 0.3
          : hovered
            ? 0.2
            : 0;

    return (
        <mesh
            ref={meshRef}
            position={position}
            geometry={geometry}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            rotation={[Math.PI / 2, 0, 0]}
        >
            <meshStandardMaterial
                color={finalColor}
                emissive={emissive}
                emissiveIntensity={emissiveIntensity}
                metalness={0.1}
                roughness={0.8}
            />
        </mesh>
    );
}
