"use client";

import React, { useMemo } from "react";
import { Shape, ExtrudeGeometry } from "three";
import { DEPARTMENT_06_BOUNDARY } from "@/lib/geo-data/department-06";
import { geoToWorld } from "@/lib/map-utils";

export function DepartmentBoundary() {
    const geometry = useMemo(() => {
        const shape = new Shape();
        const scale = 10000;

        DEPARTMENT_06_BOUNDARY.forEach(([lon, lat], index) => {
            const point = geoToWorld({ lat, lon }, scale);

            if (index === 0) {
                shape.moveTo(point.x, point.z);
            } else {
                shape.lineTo(point.x, point.z);
            }
        });

        const extrudeSettings = {
            depth: 0.5,
            bevelEnabled: false,
        };

        return new ExtrudeGeometry(shape, extrudeSettings);
    }, []);

    return (
        <mesh
            geometry={geometry}
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, 0, 0]}
        >
            <meshStandardMaterial
                color="#c8e6c9"
                transparent
                opacity={0.3}
                metalness={0}
                roughness={1}
            />
        </mesh>
    );
}
