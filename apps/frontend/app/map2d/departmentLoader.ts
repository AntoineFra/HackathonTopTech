/**
 * Department Loader - Charge et affiche les contours des communes
 */

import * as THREE from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";

export interface CityWithGeoData {
    codeINSEE: string;
    name: string;
    codeDepartement: string;
    population: number;
    surface?: number;
    geoData?: {
        centreLat?: number;
        centreLon?: number;
        mairieLat?: number;
        mairieLon?: number;
        contour?: string;
        bbox?: string;
    };
}

/**
 * Conversion lat/lon vers coordonnées cartésiennes locales
 */
function latLonToCartesian(
    lat: number,
    lon: number,
    centerLat: number,
    centerLon: number,
): { x: number; z: number } {
    if (
        !isFinite(lat) ||
        !isFinite(lon) ||
        !isFinite(centerLat) ||
        !isFinite(centerLon)
    ) {
        return { x: 0, z: 0 };
    }

    const R = 6371000; // Rayon de la Terre en mètres
    const lat1 = (centerLat * Math.PI) / 180;
    const lat2 = (lat * Math.PI) / 180;
    const deltaLon = ((lon - centerLon) * Math.PI) / 180;

    let x = deltaLon * R * Math.cos(lat1);
    let z = -(lat2 - lat1) * R;

    // Scale down par 100
    x = x / 100;
    z = z / 100;

    if (!isFinite(x) || !isFinite(z)) {
        return { x: 0, z: 0 };
    }

    return { x, z };
}

/**
 * Charge toutes les villes depuis l'API
 */
export async function loadAllCities(): Promise<CityWithGeoData[]> {
    try {
        const backendUrl =
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
        const response = await fetch(`${backendUrl}/trois-d/cities`);
        if (!response.ok) {
            throw new Error(`Failed to fetch cities: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error loading cities:", error);
        return [];
    }
}

/**
 * Calcule les bounds du département
 */
export function calculateDepartmentBounds(cities: CityWithGeoData[]): {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    centerLat: number;
    centerLon: number;
} | null {
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLon = Infinity;
    let maxLon = -Infinity;

    cities.forEach((city) => {
        if (!city.geoData || !city.geoData.contour) return;

        try {
            const contourData = JSON.parse(city.geoData.contour);
            const geomType = contourData.type;

            let allCoordinates: any[] = [];

            if (geomType === "Polygon") {
                allCoordinates = contourData.coordinates[0] || [];
            } else if (geomType === "MultiPolygon") {
                contourData.coordinates.forEach((poly: any) => {
                    if (poly[0]) allCoordinates.push(...poly[0]);
                });
            }

            allCoordinates.forEach((coord: [number, number]) => {
                const [lon, lat] = coord;
                if (!isFinite(lon) || !isFinite(lat)) return;

                minLat = Math.min(minLat, lat);
                maxLat = Math.max(maxLat, lat);
                minLon = Math.min(minLon, lon);
                maxLon = Math.max(maxLon, lon);
            });
        } catch (error) {
            // Ignore
        }
    });

    if (minLat === Infinity || !isFinite(minLat)) {
        return null;
    }

    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;

    if (!isFinite(centerLat) || !isFinite(centerLon)) {
        return null;
    }

    // Calculer les bounds réelles en coordonnées converties
    let realMinX = Infinity;
    let realMaxX = -Infinity;
    let realMinZ = Infinity;
    let realMaxZ = -Infinity;

    cities.forEach((city) => {
        if (!city.geoData || !city.geoData.contour) return;
        try {
            const contourData = JSON.parse(city.geoData.contour);
            const geomType = contourData.type;
            let allCoordinates: any[] = [];

            if (geomType === "Polygon") {
                allCoordinates = contourData.coordinates[0] || [];
            } else if (geomType === "MultiPolygon") {
                contourData.coordinates.forEach((poly: any) => {
                    if (poly[0]) allCoordinates.push(...poly[0]);
                });
            }

            allCoordinates.forEach((coord: [number, number]) => {
                const [lon, lat] = coord;
                if (!isFinite(lon) || !isFinite(lat)) return;

                const { x, z } = latLonToCartesian(
                    lat,
                    lon,
                    centerLat,
                    centerLon,
                );
                if (!isFinite(x) || !isFinite(z)) return;

                realMinX = Math.min(realMinX, x);
                realMaxX = Math.max(realMaxX, x);
                realMinZ = Math.min(realMinZ, z);
                realMaxZ = Math.max(realMaxZ, z);
            });
        } catch (error) {
            // Ignore
        }
    });

    if (!isFinite(realMinX)) {
        return null;
    }

    return {
        minX: realMinX,
        maxX: realMaxX,
        minZ: realMinZ,
        maxZ: realMaxZ,
        centerLat,
        centerLon,
    };
} /**
 * Crée les contours des communes avec remplissage
 */
export function createDepartmentContours(
    cities: CityWithGeoData[],
    centerLat: number,
    centerLon: number,
    options: { showLabels?: boolean } = {},
): THREE.Group {
    const group = new THREE.Group();

    cities.forEach((city) => {
        if (!city.geoData || !city.geoData.contour) return;

        try {
            const contourData = JSON.parse(city.geoData.contour);
            const geomType = contourData.type;

            let polygons: any[] = [];

            if (geomType === "Polygon") {
                polygons = [contourData.coordinates[0]];
            } else if (geomType === "MultiPolygon") {
                polygons = contourData.coordinates.map((poly: any) => poly[0]);
            }

            const contourColor = 0xff6b00; // Orange pour le contour
            const fillColor = 0x00ff00; // Vert pour le remplissage

            // Créer un groupe pour cette ville (tous ses polygones)
            const cityGroup = new THREE.Group();
            cityGroup.userData = {
                type: "city",
                city: city.name,
                codeINSEE: city.codeINSEE,
                population: city.population,
            };

            polygons.forEach((coordinates) => {
                if (!coordinates || coordinates.length < 3) return;

                const points: THREE.Vector3[] = [];
                const points2D: THREE.Vector2[] = [];

                coordinates.forEach((coord: [number, number]) => {
                    const [lon, lat] = coord;

                    if (!isFinite(lon) || !isFinite(lat)) return;

                    const { x, z } = latLonToCartesian(
                        lat,
                        lon,
                        centerLat,
                        centerLon,
                    );

                    if (!isFinite(x) || !isFinite(z)) return;

                    points.push(new THREE.Vector3(x, 10, z));
                    points2D.push(new THREE.Vector2(x, z));
                });

                if (points.length < 3) return;

                // Créer le remplissage vert avec ShapeGeometry (méthode lisse)
                try {
                    const shape = new THREE.Shape(points2D);
                    const fillGeometry = new THREE.ShapeGeometry(shape);

                    // Convertir la géométrie 2D en 3D sans rotation
                    const positions = fillGeometry.attributes.position.array;
                    const newPositions = new Float32Array(positions.length);

                    for (let i = 0; i < positions.length; i += 3) {
                        newPositions[i] = positions[i]; // x reste x
                        newPositions[i + 1] = 10; // y devient 10 (hauteur)
                        newPositions[i + 2] = positions[i + 1]; // y devient z
                    }

                    fillGeometry.setAttribute(
                        "position",
                        new THREE.BufferAttribute(newPositions, 3),
                    );
                    fillGeometry.computeVertexNormals();

                    const fillMaterial = new THREE.MeshBasicMaterial({
                        color: fillColor,
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 0.6,
                    });

                    const fillMesh = new THREE.Mesh(fillGeometry, fillMaterial);
                    fillMesh.userData = { type: "fill" };
                    cityGroup.add(fillMesh);
                } catch (error) {
                    console.error(
                        `Error creating fill for ${city.name}:`,
                        error,
                    );
                }

                // Fermer le contour
                points.push(points[0].clone());

                // Créer le contour orange
                const lineGeometry = new THREE.BufferGeometry().setFromPoints(
                    points,
                );
                const lineMaterial = new THREE.LineBasicMaterial({
                    color: contourColor,
                    linewidth: 5,
                });
                const line = new THREE.Line(lineGeometry, lineMaterial);
                line.userData = { type: "contour" };
                cityGroup.add(line);
            });

            if (cityGroup.children.length > 0) {
                group.add(cityGroup);
                console.log(
                    `✅ Ville ajoutée: ${city.name} - ${polygons.length} polygone(s)`,
                );
            }
        } catch (error) {
            console.error(`Error creating contour for ${city.name}:`, error);
        }
    });

    return group;
}

/**
 * Crée un label 3D pour une ville
 */
export async function createCityLabel(
    cityName: string,
    position: { x: number; z: number },
    height: number = 200,
    camera?: THREE.Camera,
): Promise<THREE.Group> {
    const labelGroup = new THREE.Group();

    try {
        // Charger la police
        const fontLoader = new FontLoader();
        const font = await new Promise<any>((resolve, reject) => {
            fontLoader.load(
                "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json",
                resolve,
                undefined,
                reject,
            );
        });

        // Créer la géométrie du texte (taille réduite)
        const textGeometry = new TextGeometry(cityName, {
            font: font,
            size: 30, // Réduit de 80 à 30
            depth: 2, // Réduit de 5 à 2
            curveSegments: 8, // Réduit pour meilleures performances
            bevelEnabled: true,
            bevelThickness: 1,
            bevelSize: 0.5,
            bevelOffset: 0,
            bevelSegments: 3,
        });

        textGeometry.center();

        // Matériau du texte
        const textMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
        });

        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Positionner le texte au-dessus de la ville
        textMesh.position.set(0, 0, 0);

        labelGroup.add(textMesh);

        // Ajouter un fond semi-transparent (plus petit)
        const bgGeometry = new THREE.PlaneGeometry(cityName.length * 20, 40);
        const bgMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
        });
        const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
        bgMesh.position.set(0, 0, -2);
        labelGroup.add(bgMesh);

        // Positionner le groupe au-dessus de la ville
        labelGroup.position.set(position.x, height, position.z);

        // Stocker les infos pour l'animation billboard
        labelGroup.userData = {
            isBillboard: true,
            cityName: cityName,
        };
    } catch (error) {
        console.error("Error creating city label:", error);
    }

    return labelGroup;
}

/**
 * Met à jour l'orientation du label pour qu'il face toujours la caméra
 */
export function updateCityLabelOrientation(
    label: THREE.Group,
    camera: THREE.Camera,
) {
    if (!label.userData.isBillboard) return;

    // Faire face à la caméra
    label.lookAt(camera.position);
}
