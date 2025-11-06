/**
 * OSM Buildings Loader for Three.js
 * Convertit les polygones GeoJSON d'OpenStreetMap en meshes 3D extrudés
 */

import * as THREE from "three";
import { OSMBuilding, IGNBuildingsResponse } from "@/services/ign-buildings.services";

/**
 * Configuration pour le rendu des bâtiments
 */
export interface BuildingRenderOptions {
    defaultHeight?: number; // Hauteur par défaut si non fournie (mètres)
    heightScale?: number; // Facteur de multiplication de la hauteur pour l'effet visuel
    material?: THREE.Material;
    color?: number;
    opacity?: number;
    centerLat?: number; // Centre de projection pour convertir lat/lng en coordonnées locales
    centerLng?: number;
}

/**
 * Convertit des coordonnées lat/lng en coordonnées cartésiennes locales
 * @param lat Latitude
 * @param lng Longitude
 * @param centerLat Latitude du centre de projection
 * @param centerLng Longitude du centre de projection
 * @returns [x, z] en mètres relatifs au centre
 */
function latLngToLocalXZ(
    lat: number,
    lng: number,
    centerLat: number,
    centerLng: number
): [number, number] {
    // Approximation simple : 1 degré de latitude ≈ 111km
    // 1 degré de longitude ≈ 111km * cos(latitude)
    const latScale = 111000; // mètres par degré de latitude
    const lngScale = 111000 * Math.cos((centerLat * Math.PI) / 180);

    const x = (lng - centerLng) * lngScale;
    const z = -(lat - centerLat) * latScale; // -z car Three.js a z inversé par rapport aux cartes

    return [x, z];
}

/**
 * Crée une Shape Three.js à partir d'un polygone GeoJSON
 * @param coordinates Coordonnées du polygone [[lng, lat], ...]
 * @param centerLat Centre de projection
 * @param centerLng Centre de projection
 */
function createShapeFromPolygon(
    coordinates: number[][],
    centerLat: number,
    centerLng: number
): THREE.Shape | null {
    if (!coordinates || coordinates.length < 3) {
        return null;
    }

    const shape = new THREE.Shape();

    // Premier point
    const [firstLng, firstLat] = coordinates[0];
    const [firstX, firstZ] = latLngToLocalXZ(firstLat, firstLng, centerLat, centerLng);
    shape.moveTo(firstX, firstZ);

    // Points suivants
    for (let i = 1; i < coordinates.length; i++) {
        const [lng, lat] = coordinates[i];
        const [x, z] = latLngToLocalXZ(lat, lng, centerLat, centerLng);
        shape.lineTo(x, z);
    }

    return shape;
}

/**
 * Crée un mesh 3D extrudé à partir d'un bâtiment OSM
 * @param building Bâtiment OSM
 * @param options Options de rendu
 */
export function createBuildingMesh(
    building: OSMBuilding,
    options: BuildingRenderOptions = {}
): THREE.Mesh | THREE.Group | null {
    const {
        defaultHeight = 10,
        heightScale = 1,
        color = 0xcccccc,
        opacity = 1,
        centerLat = 43.7, // Centre approximatif du 06
        centerLng = 7.25,
    } = options;

    const height = (building.properties.height || defaultHeight) * heightScale;

    try {
        if (building.geometry.type === "Polygon") {
            // Polygone simple
            const coordinates = building.geometry.coordinates[0]; // Premier anneau (extérieur)
            const shape = createShapeFromPolygon(coordinates as number[][], centerLat, centerLng);

            if (!shape) return null;

            // Créer la géométrie extrudée
            const extrudeSettings: THREE.ExtrudeGeometryOptions = {
                depth: height,
                bevelEnabled: false,
            };

            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

            // Rotation pour que l'extrusion soit verticale (axe Y)
            geometry.rotateX(-Math.PI / 2);

            const material =
                options.material ||
                new THREE.MeshStandardMaterial({
                    color: color,
                    opacity: opacity,
                    transparent: opacity < 1,
                    roughness: 0.8,
                    metalness: 0.2,
                });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Stocker les métadonnées
            mesh.userData = {
                osmId: building.id,
                buildingType: building.properties.building,
                height: building.properties.height,
                name: building.properties.name,
                amenity: building.properties.amenity,
                shop: building.properties.shop,
            };

            return mesh;
        } else if (building.geometry.type === "MultiPolygon") {
            // MultiPolygone - créer un groupe de meshes
            const group = new THREE.Group();

            for (const polygon of building.geometry.coordinates) {
                const coordinates = polygon[0]; // Premier anneau de chaque polygone
                const shape = createShapeFromPolygon(coordinates as number[][], centerLat, centerLng);

                if (!shape) continue;

                const extrudeSettings: THREE.ExtrudeGeometryOptions = {
                    depth: height,
                    bevelEnabled: false,
                };

                const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                geometry.rotateX(-Math.PI / 2);

                const material =
                    options.material ||
                    new THREE.MeshStandardMaterial({
                        color: color,
                        opacity: opacity,
                        transparent: opacity < 1,
                        roughness: 0.8,
                        metalness: 0.2,
                    });

                const mesh = new THREE.Mesh(geometry, material);
                mesh.castShadow = true;
                mesh.receiveShadow = true;

                group.add(mesh);
            }

            // Stocker les métadonnées sur le groupe
            group.userData = {
                osmId: building.id,
                buildingType: building.properties.building,
                height: building.properties.height,
                name: building.properties.name,
                amenity: building.properties.amenity,
                shop: building.properties.shop,
            };

            return group.children.length > 0 ? group : null;
        }
    } catch (error) {
        console.error(`Error creating mesh for building ${building.id}:`, error);
        return null;
    }

    return null;
}

/**
 * Crée tous les meshes pour une collection de bâtiments IGN
 * @param buildingsData Réponse de l'API IGN
 * @param options Options de rendu
 */
export function createBuildingsMeshes(
    buildingsData: IGNBuildingsResponse,
    options: BuildingRenderOptions = {}
): THREE.Group {
    const group = new THREE.Group();
    group.name = "IGN_Buildings";

    let successCount = 0;
    let failCount = 0;

    console.log(`🏗️ Creating meshes for ${buildingsData.features.length} buildings...`);

    for (const building of buildingsData.features) {
        const mesh = createBuildingMesh(building, options);
        if (mesh) {
            group.add(mesh);
            successCount++;
        } else {
            failCount++;
        }
    }

    console.log(`✅ Created ${successCount} building meshes (${failCount} failed)`);

    group.userData = {
        totalBuildings: buildingsData.features.length,
        successCount,
        failCount,
        source: "IGN_BDTOPO_V3",
    };

    return group;
}

/**
 * Calcule la couleur d'un bâtiment selon sa hauteur (dégradé)
 * @param height Hauteur du bâtiment en mètres
 * @param minHeight Hauteur minimale pour le dégradé
 * @param maxHeight Hauteur maximale pour le dégradé
 */
export function getColorByHeight(height: number, minHeight = 0, maxHeight = 50): number {
    const normalized = Math.min(Math.max((height - minHeight) / (maxHeight - minHeight), 0), 1);

    // Dégradé : bleu clair -> bleu foncé -> violet -> rouge
    if (normalized < 0.33) {
        // Bleu clair -> bleu foncé
        const t = normalized / 0.33;
        return new THREE.Color().lerpColors(
            new THREE.Color(0x87ceeb), // Bleu clair
            new THREE.Color(0x4169e1), // Bleu royal
            t
        ).getHex();
    } else if (normalized < 0.66) {
        // Bleu foncé -> violet
        const t = (normalized - 0.33) / 0.33;
        return new THREE.Color().lerpColors(
            new THREE.Color(0x4169e1), // Bleu royal
            new THREE.Color(0x9370db), // Violet
            t
        ).getHex();
    } else {
        // Violet -> rouge
        const t = (normalized - 0.66) / 0.34;
        return new THREE.Color().lerpColors(
            new THREE.Color(0x9370db), // Violet
            new THREE.Color(0xff4500), // Rouge-orange
            t
        ).getHex();
    }
}

/**
 * Colore les bâtiments selon leur hauteur
 */
export function applyHeightColorGradient(group: THREE.Group) {
    const heights: number[] = [];

    group.traverse((child) => {
        if (child.userData.hauteur) {
            heights.push(child.userData.hauteur);
        }
    });

    const minHeight = Math.min(...heights);
    const maxHeight = Math.max(...heights);

    group.traverse((child) => {
        if (child instanceof THREE.Mesh && child.userData.hauteur) {
            const color = getColorByHeight(child.userData.hauteur, minHeight, maxHeight);
            (child.material as THREE.MeshStandardMaterial).color.setHex(color);
        }
    });

    console.log(`🎨 Applied height gradient (${minHeight.toFixed(1)}m - ${maxHeight.toFixed(1)}m)`);
}
