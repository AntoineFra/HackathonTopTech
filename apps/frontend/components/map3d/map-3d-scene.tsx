"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";
import { Building } from "./building";
import { DepartmentBoundary } from "./department-boundary";
import { BuildingData } from "@/types/map";
import { useMap } from "./map-context";

interface Map3DSceneProps {
    buildings: BuildingData[];
}

function SceneContent({ buildings }: Map3DSceneProps) {
    const { mapState } = useMap();

    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight
                position={[100, 200, 100]}
                intensity={1}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            <hemisphereLight
                args={["#87ceeb", "#545454", 0.6]}
                position={[0, 50, 0]}
            />

            {/* Camera controls */}
            <OrbitControls
                enableDamping
                dampingFactor={0.05}
                minDistance={50}
                maxDistance={2000}
                maxPolarAngle={Math.PI / 2.2}
                target={[72663, 0, -437034]} // Nice center in world coords
            />

            {/* Sky */}
            <Sky
                distance={450000}
                sunPosition={[100, 20, 100]}
                inclination={0.6}
                azimuth={0.25}
            />

            {/* Ground plane */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.5, 0]}
                receiveShadow
            >
                <planeGeometry args={[100000, 100000]} />
                <meshStandardMaterial color="#f0f0f0" />
            </mesh>

            {/* Department boundary */}
            <DepartmentBoundary />

            {/* Buildings */}
            {buildings.map((building) => {
                // Apply filter if set
                if (mapState.filter) {
                    const { communeIds, buildingTypes, sectors } =
                        mapState.filter;

                    if (communeIds && communeIds.length > 0) {
                        const communeMatches = communeIds.some((id) =>
                            building.commune
                                .toLowerCase()
                                .includes(id.toLowerCase()),
                        );
                        if (!communeMatches) return null;
                    }

                    if (
                        buildingTypes &&
                        buildingTypes.length > 0 &&
                        building.type
                    ) {
                        if (!buildingTypes.includes(building.type)) return null;
                    }

                    if (sectors && sectors.length > 0 && building.sector) {
                        if (!sectors.includes(building.sector)) return null;
                    }
                }

                return (
                    <Building
                        key={building.id}
                        building={building}
                        allBuildings={buildings}
                    />
                );
            })}
        </>
    );
}

export function Map3DScene({ buildings }: Map3DSceneProps) {
    return (
        <div className="h-full w-full">
            <Canvas
                camera={{
                    position: [72663, 300, -436500],
                    fov: 60,
                    near: 1,
                    far: 500000,
                }}
                shadows
            >
                <Suspense fallback={null}>
                    <SceneContent buildings={buildings} />
                </Suspense>
            </Canvas>
        </div>
    );
}
