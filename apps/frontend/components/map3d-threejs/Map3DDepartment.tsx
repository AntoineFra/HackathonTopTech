/**
 * Map3D Department Component - Configuration de base Three.js
 * Affiche uniquement les contours des communes du département 06
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import {
    loadAllCities,
    calculateDepartmentBounds,
    createDepartmentContours,
    createCityLabel,
    updateCityLabelOrientation,
    setCityColor,
    setHoveredCityColor,
} from "@/lib/threejs-loaders/departmentLoader";
import {
    applyPopulationGradient,
    resetCityColors,
} from "@/lib/threejs-loaders/colorGradient";
import { fetchBuildingsByCommune, fetchBuildingsByCommuneSmart, getBuildingsStats } from "@/services/ign-buildings.services";
import { createBuildingsMeshes, applyHeightColorGradient } from "@/lib/threejs-loaders/ignBuildingsLoader";
import { Map3DChatBox } from "./Map3DChatBox";
import Map3DLegends, { LegendType } from "./Map3DLegends";
import { PopulationChart } from "./PopulationChart";
import { AIGeneratedChart } from "./AIGeneratedChart";

function DepartmentScene({
    onLoadingChange,
    onCityCountChange,
    onCenterCalculated,
    onSelectedCity,
    selectedCityName,
    citiesListRef,
    controlsRef,
    populationData,
    activeLegends,
    loadBuildingsForCity,
    buildingsGroupRef,
}: {
    onLoadingChange: (loading: boolean) => void;
    onCityCountChange: (count: number) => void;
    onCenterCalculated: (center: { x: number; y: number; z: number }) => void;
    onSelectedCity: (cityName: string | null) => void;
    selectedCityName: string | null;
    citiesListRef: React.MutableRefObject<string[]>;
    controlsRef: React.MutableRefObject<any>;
    populationData: any[];
    activeLegends: Set<string>;
    loadBuildingsForCity: (cityName: string) => Promise<void>;
    buildingsGroupRef: React.MutableRefObject<THREE.Group | null>;
}) {
    const { scene, camera, gl } = useThree();
    const loadedRef = useRef(false);
    const selectedLine = useRef<THREE.Line | null>(null);
    const centerLatLonRef = useRef<{
        centerLat: number;
        centerLon: number;
    } | null>(null);
    const cityLabelRef = useRef<THREE.Group | null>(null);
    const [hoveredCity, setHoveredCity] = useState<string | null>(null);
    const raycaster = useRef(new THREE.Raycaster());
    const mouse = useRef(new THREE.Vector2());
    const mouseDownTime = useRef<number>(0);
    const clickThreshold = 300; // Seuil en ms pour considérer un clic valide

    useEffect(() => {
        if (loadedRef.current) return;
        loadedRef.current = true;

        // Fond dégradé de ciel (bleu clair vers bleu ciel)
        scene.background = new THREE.Color(0x87ceeb); // Bleu ciel

        // Lumières basiques
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1000, 1000, 1000);
        scene.add(directionalLight);

        // Charger les villes
        const loadDepartment = async () => {
            try {
                onLoadingChange(true);
                const cities = await loadAllCities();
                console.log(`✅ ${cities.length} communes chargées`);
                onCityCountChange(cities.length);

                if (cities.length === 0) {
                    onLoadingChange(false);
                    return;
                }

                // Calculer les bounds
                const bounds = calculateDepartmentBounds(cities);

                if (bounds) {
                    console.log("📍 Bounds:", bounds);
                    console.log("📏 Dimensions:", {
                        width: bounds.maxX - bounds.minX,
                        depth: bounds.maxZ - bounds.minZ,
                    });

                    // Créer les contours
                    const contours = createDepartmentContours(
                        cities,
                        bounds.centerLat,
                        bounds.centerLon,
                        { showLabels: false },
                    );
                    scene.add(contours);
                    console.log(
                        `🗺️ ${contours.children.length} contours ajoutés à la scène`,
                    );

                    // Récupérer la liste des villes pour la navigation
                    const cityNames: string[] = [];
                    contours.children.forEach((child) => {
                        if (child.userData.city) {
                            cityNames.push(child.userData.city);
                        }
                    });
                    citiesListRef.current = cityNames.sort();
                    console.log(
                        `📋 ${cityNames.length} villes disponibles pour navigation`,
                    );

                    // Sauvegarder le centre pour les conversions lat/lon
                    centerLatLonRef.current = {
                        centerLat: bounds.centerLat,
                        centerLon: bounds.centerLon,
                    };

                    // Partager le centre avec le parent pour les bâtiments
                    if (typeof window !== 'undefined') {
                        (window as any).departmentCenter = {
                            centerLat: bounds.centerLat,
                            centerLon: bounds.centerLon,
                        };
                    }

                    // Positionner la caméra pour voir TOUS les contours
                    const width = bounds.maxX - bounds.minX;
                    const depth = bounds.maxZ - bounds.minZ;
                    const centerX = (bounds.minX + bounds.maxX) / 2;
                    const centerZ = (bounds.minZ + bounds.maxZ) / 2;
                    const maxDimension = Math.max(width, depth);
                    const distance = maxDimension * 1.2; // Vue d'ensemble

                    // Placer la caméra au-dessus et légèrement en arrière
                    camera.position.set(
                        centerX,
                        distance,
                        centerZ + distance * 0.5,
                    );
                    camera.lookAt(centerX, 0, centerZ);

                    // Notifier le parent du centre calculé
                    onCenterCalculated({ x: centerX, y: distance, z: centerZ });

                    console.log("📷 Caméra positionnée:", {
                        position: {
                            x: centerX,
                            y: distance,
                            z: centerZ + distance * 0.5,
                        },
                        target: { x: centerX, y: 0, z: centerZ },
                        distance: maxDimension,
                    });
                }

                onLoadingChange(false);
            } catch (error) {
                console.error("❌ Erreur:", error);
                onLoadingChange(false);
            }
        };

        loadDepartment();
    }, [
        scene,
        camera,
        gl,
        onLoadingChange,
        onCityCountChange,
        onCenterCalculated,
        onSelectedCity,
        citiesListRef,
    ]);

    // Gestion du survol et du clic sur les villes
    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            // Calculer la position de la souris en coordonnées normalisées (-1 à +1)
            const canvas = gl.domElement;
            const rect = canvas.getBoundingClientRect();
            mouse.current.x =
                ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.current.y =
                -((event.clientY - rect.top) / rect.height) * 2 + 1;

            // Raycasting
            raycaster.current.setFromCamera(mouse.current, camera);
            const intersects = raycaster.current.intersectObjects(
                scene.children,
                true,
            );

            let foundCity: string | null = null;
            for (const intersect of intersects) {
                // Chercher le groupe parent de type 'city'
                let object = intersect.object;
                while (object.parent) {
                    if (object.userData.type === "city") {
                        foundCity = object.userData.city;
                        break;
                    }
                    object = object.parent;
                }
                if (foundCity) break;
            }

            setHoveredCity(foundCity);
            // Changer le curseur
            canvas.style.cursor = foundCity ? "pointer" : "default";
        };

        const handleMouseDown = () => {
            mouseDownTime.current = Date.now();
        };

        const handleClick = (event: MouseEvent) => {
            // Vérifier que le clic n'a pas duré trop longtemps
            const clickDuration = Date.now() - mouseDownTime.current;
            if (clickDuration > clickThreshold) {
                console.log("⏱️ Clic annulé (trop long)");
                return;
            }

            if (hoveredCity) {
                onSelectedCity(hoveredCity);
                // Trouver l'index de la ville dans la liste
                const index = citiesListRef.current.indexOf(hoveredCity);
                if (index !== -1) {
                    // Mettre à jour l'index courant dans le parent
                    console.log(
                        `🖱️ Ville cliquée: ${hoveredCity} (index: ${index})`,
                    );
                }
            }
        };

        const canvas = gl.domElement;
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("click", handleClick);

        return () => {
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("click", handleClick);
        };
    }, [scene, camera, gl, hoveredCity, onSelectedCity, citiesListRef]);

    // Centrer la caméra sur la ville sélectionnée
    useEffect(() => {
        if (!selectedCityName || !centerLatLonRef.current) return;

        const fetchCityAndCenter = async () => {
            try {
                console.log(
                    `🎯 Chargement des données de ${selectedCityName}...`,
                );
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
                const response = await fetch(
                    `${backendUrl}/api/trois-d/cities/${selectedCityName}`,
                );
                if (!response.ok) {
                    const errorData = await response.text();
                    console.error(`❌ Erreur ${response.status}:`, errorData);
                    return;
                }

                const cityData = await response.json();
                console.log(
                    `✅ Données de ${selectedCityName} chargées:`,
                    cityData,
                );

                if (!cityData.geoData?.contour) {
                    console.warn(`Pas de contour pour ${selectedCityName}`);
                    return;
                }

                // Parser le contour
                const contourData = JSON.parse(cityData.geoData.contour);
                const geomType = contourData.type;

                // Récupérer toutes les coordonnées
                let allCoordinates: [number, number][] = [];
                if (geomType === "Polygon") {
                    allCoordinates = contourData.coordinates[0] || [];
                } else if (geomType === "MultiPolygon") {
                    contourData.coordinates.forEach((poly: any) => {
                        if (poly[0]) allCoordinates.push(...poly[0]);
                    });
                }

                if (allCoordinates.length === 0) return;

                // Calculer le centre du contour
                let sumLat = 0,
                    sumLon = 0;
                let minLat = Infinity,
                    maxLat = -Infinity;
                let minLon = Infinity,
                    maxLon = -Infinity;

                allCoordinates.forEach(([lon, lat]) => {
                    sumLat += lat;
                    sumLon += lon;
                    minLat = Math.min(minLat, lat);
                    maxLat = Math.max(maxLat, lat);
                    minLon = Math.min(minLon, lon);
                    maxLon = Math.max(maxLon, lon);
                });
                const avgLat = sumLat / allCoordinates.length;
                const avgLon = sumLon / allCoordinates.length;

                // Convertir en coordonnées cartésiennes
                if (!centerLatLonRef.current) return;
                const { centerLat, centerLon } = centerLatLonRef.current;
                const R = 6371000;
                const lat1 = (centerLat * Math.PI) / 180;
                const lat2 = (avgLat * Math.PI) / 180;
                const deltaLon = ((avgLon - centerLon) * Math.PI) / 180;

                let x = (deltaLon * R * Math.cos(lat1)) / 100;
                let z = (-(lat2 - lat1) * R) / 100;

                // Calculer les bounds de la ville en coordonnées cartésiennes
                const lat1Min = (centerLat * Math.PI) / 180;
                const lat2Min = (minLat * Math.PI) / 180;
                const lat2Max = (maxLat * Math.PI) / 180;
                const deltaLonMin = ((minLon - centerLon) * Math.PI) / 180;
                const deltaLonMax = ((maxLon - centerLon) * Math.PI) / 180;

                const xMin = (deltaLonMin * R * Math.cos(lat1Min)) / 100;
                const xMax = (deltaLonMax * R * Math.cos(lat1Min)) / 100;
                const zMin = (-(lat2Max - lat1Min) * R) / 100;
                const zMax = (-(lat2Min - lat1Min) * R) / 100;

                const cityWidth = Math.abs(xMax - xMin);
                const cityDepth = Math.abs(zMax - zMin);
                const citySize = Math.max(cityWidth, cityDepth);

                // Distance de la caméra : vue en forte plongée (angle ~30 degrés)
                const cameraHeight = citySize * 0.8; // Hauteur modérée pour être "un peu plus grand"
                const cameraDistance = citySize * 2; // Distance horizontale importante pour vue face à nous

                console.log(`📍 Centre de ${selectedCityName}:`, { x, z });
                console.log(`📐 Taille de ${selectedCityName}:`, {
                    width: cityWidth,
                    depth: cityDepth,
                    height: cameraHeight,
                });

                // Positionner la caméra en forte plongée (ville face à nous)
                camera.position.set(x, cameraHeight, z + cameraDistance);
                camera.lookAt(x, 0, z);

                // Déplacer les controls vers cette position
                if (controlsRef.current) {
                    controlsRef.current.target.set(x, 0, z);
                    controlsRef.current.update();
                    console.log(
                        `📷 Caméra repositionnée en plongée sur ${selectedCityName}`,
                    );
                }

                // Créer le label 3D au-dessus de la ville
                if (cityLabelRef.current) {
                    scene.remove(cityLabelRef.current);
                    cityLabelRef.current = null;
                }

                const label = await createCityLabel(
                    selectedCityName,
                    { x, z },
                    cameraHeight * 0.3,
                );
                cityLabelRef.current = label;
                scene.add(label);
                console.log(`🏷️ Label 3D créé pour ${selectedCityName}`);
            } catch (error) {
                console.error(
                    `Erreur lors du chargement de ${selectedCityName}:`,
                    error,
                );
            }
        };

        fetchCityAndCenter();
    }, [selectedCityName, controlsRef, scene]);

    // Mettre à jour l'orientation du label à chaque frame avec useFrame
    useFrame(() => {
        if (cityLabelRef.current) {
            updateCityLabelOrientation(cityLabelRef.current, camera);
        }
    });

    // Appliquer le gradient de couleurs quand les données de population changent
    useEffect(() => {
        if (populationData.length > 0 && activeLegends.has("population")) {
            console.log("🎨 Application du gradient de population...");
            applyPopulationGradient(scene, populationData);
            // Réappliquer le hover/sélection après le gradient
            setHoveredCityColor(scene, hoveredCity, selectedCityName);
        } else {
            // Réinitialiser les couleurs si la légende est désactivée
            if (!activeLegends.has("population")) {
                resetCityColors(scene);
                // Réappliquer le hover/sélection après la réinitialisation
                setHoveredCityColor(scene, hoveredCity, selectedCityName);
            }
        }
    }, [populationData, activeLegends, scene, hoveredCity, selectedCityName]);

    // Changer la couleur de la ville sélectionnée et survolée
    useEffect(() => {
        setHoveredCityColor(scene, hoveredCity, selectedCityName);
    }, [selectedCityName, hoveredCity, scene]);

    // Afficher les bâtiments IGN quand ils sont chargés
    useEffect(() => {
        if (buildingsGroupRef.current) {
            // Vérifier si déjà ajouté à la scène
            const alreadyInScene = scene.children.includes(buildingsGroupRef.current);

            if (!alreadyInScene) {
                console.log("🏗️ Ajout des bâtiments à la scène...");
                scene.add(buildingsGroupRef.current);
                console.log(`✅ ${buildingsGroupRef.current.children.length} bâtiments ajoutés à la scène`);

                // Ajouter une box helper pour debug (rouge vif)
                const box = new THREE.Box3().setFromObject(buildingsGroupRef.current);
                const helper = new THREE.Box3Helper(box, new THREE.Color(0xff0000));
                helper.name = "BuildingsDebugBox";
                scene.add(helper);

                const size = new THREE.Vector3();
                box.getSize(size);
                const center = new THREE.Vector3();
                box.getCenter(center);
                console.log(`📦 Box helper ajoutée au centre [${center.x.toFixed(1)}, ${center.y.toFixed(1)}, ${center.z.toFixed(1)}]`);
                console.log(`📏 Taille: ${size.x.toFixed(1)} x ${size.y.toFixed(1)} x ${size.z.toFixed(1)}`);
            }
        }

        // Cleanup : retirer les bâtiments quand le composant est démonté
        return () => {
            if (buildingsGroupRef.current && scene.children.includes(buildingsGroupRef.current)) {
                scene.remove(buildingsGroupRef.current);
                // Retirer aussi la box helper
                const helper = scene.getObjectByName("BuildingsDebugBox");
                if (helper) scene.remove(helper);
            }
        };
    }, [buildingsGroupRef.current, scene]);

    return null;
}

export default function Map3DDepartment() {
    const [cityCount, setCityCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [mapCenter, setMapCenter] = useState({ x: 0, y: 5000, z: 0 });
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [currentCityIndex, setCurrentCityIndex] = useState(0);
    const [aiResponse, setAiResponse] = useState<string>("");
    const [activeLegends, setActiveLegends] = useState<Set<LegendType>>(
        new Set(),
    );
    const [populationData, setPopulationData] = useState<any[]>([]);
    const [selectedCityPopulation, setSelectedCityPopulation] = useState<any>(null);
    const [loadingBuildings, setLoadingBuildings] = useState(false);
    const [buildingsLoaded, setBuildingsLoaded] = useState(false);
    const [buildingsProgress, setBuildingsProgress] = useState<string>("");
    const buildingsGroupRef = useRef<THREE.Group | null>(null);
    const citiesListRef = useRef<string[]>([]);
    const controlsRef = useRef<any>(null);
    const departmentCenterRef = useRef<{ centerLat: number; centerLon: number } | null>(null);

    const handleRecenter = () => {
        if (controlsRef.current) {
            controlsRef.current.target.set(mapCenter.x, 0, mapCenter.z);
            controlsRef.current.update();
        }
    };

    const handleCitySelected = async (cityName: string | null) => {
        setSelectedCity(cityName);
        setAiResponse(""); // Reset AI response when manually selecting a city

        if (cityName) {
            const index = citiesListRef.current.indexOf(cityName);
            if (index !== -1) {
                setCurrentCityIndex(index);
            }

            // Charger les données de population si la légende est active
            if (activeLegends.has("population")) {
                try {
                    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
                    // Trouver le codeINSEE de la ville depuis les données globales
                    const cityData = populationData.find(
                        (city) =>
                            city.libelle?.toLowerCase() ===
                            cityName.toLowerCase(),
                    );

                    if (cityData) {
                        console.log(
                            `📊 Chargement population pour ${cityName} (${cityData.codeGeo})`,
                        );
                        const response = await fetch(
                            `${backendUrl}/api/trois-d/population/${cityData.codeGeo}`,
                        );
                        if (response.ok) {
                            const data = await response.json();
                            setSelectedCityPopulation(data[0]); // Premier résultat
                        }
                    }
                } catch (error) {
                    console.error(
                        "❌ Erreur chargement population ville:",
                        error,
                    );
                }
            }
        } else {
            setSelectedCityPopulation(null);
        }
    };

    const handleAICityDetected = (cityName: string, response: string) => {
        setSelectedCity(cityName);
        setAiResponse(response);
        const index = citiesListRef.current.indexOf(cityName);
        if (index !== -1) {
            setCurrentCityIndex(index);
        }
    };

    const handleLegendActivate = async (legendType: LegendType) => {
        console.log(`🤖 L'IA suggère d'activer la légende: ${legendType}`);

        // Activer la légende si elle n'est pas déjà active
        if (!activeLegends.has(legendType)) {
            await handleLegendChange(legendType, true);
        }
    };

    // Fonction pour charger les bâtiments d'une commune
    const loadBuildingsForCity = async (cityName: string) => {
        if (!cityName) return;

        setLoadingBuildings(true);
        setBuildingsProgress("Récupération des informations de la ville...");
        console.log(`🏗️ Chargement des bâtiments pour ${cityName}...`);

        try {
            // Récupérer le code INSEE et les coordonnées de la ville depuis le backend
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
            const cityInfoResponse = await fetch(
                `${backendUrl}/api/trois-d/cities/${cityName}`
            );
            if (!cityInfoResponse.ok) {
                console.error(`❌ Impossible de récupérer les infos de ${cityName}`);
                setBuildingsProgress("❌ Erreur: ville introuvable");
                return;
            }

            const cityInfo = await cityInfoResponse.json();
            const inseeCode = cityInfo.codeINSEE;
            console.log(`📍 Code INSEE de ${cityName}: ${inseeCode}`);

            setBuildingsProgress("Calcul de la position de la ville...");

            // Calculer où est la ville sur la carte (en coordonnées 3D)
            let cityPositionX = 0;
            let cityPositionZ = 0;
            let cityLat = 43.7;
            let cityLon = 7.25;

            if (cityInfo.geoData?.contour) {
                const contourData = JSON.parse(cityInfo.geoData.contour);
                let allCoordinates: [number, number][] = [];

                if (contourData.type === "Polygon") {
                    allCoordinates = contourData.coordinates[0] || [];
                } else if (contourData.type === "MultiPolygon") {
                    contourData.coordinates.forEach((poly: any) => {
                        if (poly[0]) allCoordinates.push(...poly[0]);
                    });
                }

                if (allCoordinates.length > 0) {
                    let sumLat = 0, sumLon = 0;
                    allCoordinates.forEach(([lon, lat]) => {
                        sumLat += lat;
                        sumLon += lon;
                    });
                    cityLat = sumLat / allCoordinates.length;
                    cityLon = sumLon / allCoordinates.length;
                    console.log(`📍 Centre géographique de ${cityName}: [${cityLat.toFixed(6)}, ${cityLon.toFixed(6)}]`);

                    // Convertir en coordonnées 3D de la carte
                    // Utiliser le même calcul que departmentLoader.ts
                    const deptCenter = (window as any).departmentCenter;
                    if (deptCenter) {
                        const R = 6371000;
                        const lat1 = (deptCenter.centerLat * Math.PI) / 180;
                        const lat2 = (cityLat * Math.PI) / 180;
                        const deltaLon = ((cityLon - deptCenter.centerLon) * Math.PI) / 180;

                        cityPositionX = (deltaLon * R * Math.cos(lat1)) / 100;
                        cityPositionZ = (-(lat2 - lat1) * R) / 100;

                        console.log(`🎯 Position 3D de ${cityName} sur la carte: [${cityPositionX.toFixed(1)}, ${cityPositionZ.toFixed(1)}]`);
                    }
                }
            }

            // Récupérer les données de l'IGN avec retry intelligent
            setBuildingsProgress("Téléchargement des bâtiments depuis OpenStreetMap...");
            const buildingsData = await fetchBuildingsByCommuneSmart(
                inseeCode,
                [cityLat, cityLon]
            );

            // Afficher les stats et vérifier le formatage
            if (buildingsData.features.length > 0) {
                const stats = getBuildingsStats(buildingsData.features);
                console.log("📊 Statistiques des bâtiments:", stats);
                console.log(`📐 Données: ${stats.withHeight}/${stats.total} bâtiments avec hauteur (${((stats.withHeight/stats.total)*100).toFixed(1)}%)`);
                console.log(`📏 Hauteur moyenne: ${stats.avgHeight}m, Types: ${Object.keys(stats.byType).length} différents`);
                setBuildingsProgress(`Génération de ${buildingsData.features.length} bâtiments en 3D...`);
            }

            console.log(`🏗️ Création des bâtiments avec centre local [${cityLat.toFixed(6)}, ${cityLon.toFixed(6)}]`);

            // Créer les meshes 3D en coordonnées LOCALES (centrées sur 0,0)
            const buildingsGroup = createBuildingsMeshes(buildingsData, {
                defaultHeight: 10,
                heightScale: 1, // Pas de scale, déjà divisé par 100 dans createBuildingMesh
                centerLat: cityLat, // Centre de la VILLE (coordonnées locales)
                centerLng: cityLon, // Centre de la VILLE (coordonnées locales)
            });

            // PUIS translater tout le groupe à la position de la ville sur la carte
            buildingsGroup.position.set(cityPositionX, 10, cityPositionZ); // Y = 0.1 pour être au-dessus du sol
            console.log(`📦 Groupe de bâtiments positionné à [${cityPositionX.toFixed(1)}, 0.1, ${cityPositionZ.toFixed(1)}]`);

            setBuildingsProgress("Application des couleurs...");
            // Appliquer le dégradé de couleur selon la hauteur
            applyHeightColorGradient(buildingsGroup);

            // Calculer et afficher les bounds
            const bounds = buildingsGroup.userData.bounds;
            if (bounds) {
                const centerX = (bounds.minX + bounds.maxX) / 2;
                const centerZ = (bounds.minZ + bounds.maxZ) / 2;
                const width = bounds.maxX - bounds.minX;
                const depth = bounds.maxZ - bounds.minZ;
                console.log(`📍 Centre des bâtiments: [${centerX.toFixed(1)}, ${centerZ.toFixed(1)}]`);
                console.log(`📐 Dimensions: ${width.toFixed(1)}m x ${depth.toFixed(1)}m`);
            }

            // Stocker la référence et marquer comme chargé
            buildingsGroupRef.current = buildingsGroup;
            setBuildingsLoaded(true);
            setBuildingsProgress("");

            console.log(`✅ ${buildingsData.features.length} bâtiments prêts pour l'affichage`);
        } catch (error) {
            console.error("❌ Erreur lors du chargement des bâtiments:", error);
            setBuildingsProgress(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
            setTimeout(() => setBuildingsProgress(""), 5000);
        } finally {
            setLoadingBuildings(false);
        }
    };

    const handleLegendChange = async (legendType: LegendType, enabled: boolean) => {
        const newLegends = new Set(activeLegends);
        if (enabled) {
            newLegends.add(legendType);

            // Si c'est la population, charger les données
            if (legendType === "population") {
                try {
                    console.log("📊 Chargement des données de population...");
                    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
                    const response = await fetch(
                        `${backendUrl}/api/trois-d/population`,
                    );
                    if (!response.ok) {
                        console.error(
                            "❌ Erreur lors du chargement des données de population",
                        );
                        return;
                    }
                    const data = await response.json();
                    setPopulationData(data);
                    console.log(
                        `✅ ${data.length} enregistrements de population chargés`,
                    );
                } catch (error) {
                    console.error("❌ Erreur:", error);
                }
            }
        } else {
            newLegends.delete(legendType);
            if (legendType === "population") {
                setPopulationData([]);
            }
        }
        setActiveLegends(newLegends);
    };

    // Navigation avec les flèches
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (citiesListRef.current.length === 0) return;

            if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                const newIndex =
                    (currentCityIndex + 1) % citiesListRef.current.length;
                setCurrentCityIndex(newIndex);
                const newCity = citiesListRef.current[newIndex];
                handleCitySelected(newCity);
                console.log(`➡️ Ville suivante: ${newCity}`);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                const newIndex =
                    currentCityIndex === 0
                        ? citiesListRef.current.length - 1
                        : currentCityIndex - 1;
                setCurrentCityIndex(newIndex);
                const newCity = citiesListRef.current[newIndex];
                handleCitySelected(newCity);
                console.log(`⬅️ Ville précédente: ${newCity}`);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentCityIndex, activeLegends, populationData]);

    return (
        <div className="flex flex-col">
            {/* Carte 3D */}
            <div className="relative h-[70vh] w-full">
                <Canvas>
                    <PerspectiveCamera
                        makeDefault
                        position={[0, 5000, 5000]}
                        fov={60}
                        near={0.1}
                        far={100000}
                    />

                    <OrbitControls
                        ref={controlsRef}
                        enableDamping
                        target={[mapCenter.x, 0, mapCenter.z]}
                    />

                <DepartmentScene
                    onLoadingChange={setIsLoading}
                    onCityCountChange={setCityCount}
                    onCenterCalculated={setMapCenter}
                    onSelectedCity={handleCitySelected}
                    selectedCityName={selectedCity}
                    citiesListRef={citiesListRef}
                    controlsRef={controlsRef}
                    populationData={populationData}
                    activeLegends={activeLegends}
                    loadBuildingsForCity={loadBuildingsForCity}
                    buildingsGroupRef={buildingsGroupRef}
                />
            </Canvas>

                {/* Loading */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 dark:bg-black/60">
                        <div className="bg-card border-border rounded-lg border p-8 text-center shadow-lg">
                            <div className="border-primary mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-4"></div>
                            <h2 className="text-foreground text-xl font-bold">
                                Chargement...
                            </h2>
                            {cityCount > 0 && (
                                <p className="text-primary mt-2 text-sm">
                                    {cityCount} communes
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Info */}
                <div className="bg-card border-border absolute top-4 left-4 min-w-[280px] rounded-lg border p-4 shadow-lg">
                    <h2 className="text-foreground text-lg font-bold">
                        Département 06
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        {cityCount} communes
                    </p>

                <div className="bg-primary/10 dark:bg-primary/20 mt-3 rounded p-2 text-xs">
                    <p className="text-foreground mb-1 font-semibold">
                        Navigation :
                    </p>
                    <p className="text-muted-foreground">
                        • ← → : Ville précédente / suivante
                    </p>
                    <p className="text-muted-foreground">
                        • ↑ ↓ : Parcourir les communes
                    </p>
                </div>

                {/* Bouton charger bâtiments IGN */}
                <div className="mt-4 border-t border-border pt-3">
                    <button
                        onClick={() => loadBuildingsForCity("Nice")} // Nice pour test
                        disabled={loadingBuildings}
                        className="w-full rounded-md bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loadingBuildings ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                Chargement...
                            </span>
                        ) : buildingsLoaded ? (
                            "🏗️ Bâtiments chargés !"
                        ) : (
                            "🏗️ Charger bâtiments (Nice)"
                        )}
                    </button>
                    {buildingsProgress && (
                        <p className="text-muted-foreground mt-2 text-xs text-center animate-pulse">
                            {buildingsProgress}
                        </p>
                    )}
                    {buildingsLoaded && buildingsGroupRef.current && !loadingBuildings && (
                        <p className="text-muted-foreground mt-2 text-xs text-center">
                            ✅ {buildingsGroupRef.current.children.length} bâtiments affichés
                        </p>
                    )}
                </div>
            </div>

                {/* Ville sélectionnée - Card à droite */}
                {selectedCity && (
                    <div className="bg-card border-border absolute top-4 right-4 max-w-[400px] min-w-[320px] rounded-lg border p-6 shadow-lg">
                        <div className="space-y-3">
                            <div>
                                <p className="text-muted-foreground text-sm">
                                    Commune sélectionnée
                                </p>
                                <h3 className="text-foreground mt-1 text-2xl font-bold">
                                    {selectedCity}
                                </h3>
                            </div>

                            {/* Données de population si légende active */}
                            {activeLegends.has("population") &&
                                selectedCityPopulation && (
                                    <div className="border-border border-t pt-3">
                                        <p className="text-muted-foreground mb-3 text-xs font-semibold">
                                            Évolution de la population
                                        </p>
                                        <PopulationChart
                                            populationData={
                                                selectedCityPopulation
                                            }
                                        />{" "}
                                        {/* Stats rapides */}
                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                            <div className="bg-muted/50 rounded p-2">
                                                <p className="text-muted-foreground text-[10px]">
                                                    Population 2022
                                                </p>
                                                <p className="text-foreground text-base font-bold">
                                                    {selectedCityPopulation.pop2022?.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="bg-muted/50 rounded p-2">
                                                <p className="text-muted-foreground text-[10px]">
                                                    Évolution 1999-2022
                                                </p>
                                                <p
                                                    className={`text-base font-bold ${
                                                        (selectedCityPopulation.pop2022 ||
                                                            0) >
                                                        (selectedCityPopulation.pop1999 ||
                                                            0)
                                                            ? "text-green-500"
                                                            : "text-red-500"
                                                    }`}
                                                >
                                                    {selectedCityPopulation.pop2022 &&
                                                    selectedCityPopulation.pop1999
                                                        ? `${(((selectedCityPopulation.pop2022 - selectedCityPopulation.pop1999) / selectedCityPopulation.pop1999) * 100).toFixed(1)}%`
                                                        : "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            <div className="border-border flex items-center justify-between border-t pt-2">
                                <span className="text-muted-foreground text-sm">
                                    Position
                                </span>
                                <span className="text-foreground text-sm font-medium">
                                    {currentCityIndex + 1} /{" "}
                                    {citiesListRef.current.length}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Légendes - en bas à gauche */}
                <div className="absolute bottom-4 left-4">
                    <Map3DLegends
                        onLegendChange={handleLegendChange}
                        activeLegends={activeLegends}
                    />
                </div>
            </div>

            {/* Chat IA - Section en dessous de la carte */}
            <div className="mx-auto w-full max-w-4xl px-4 py-6">
                <Map3DChatBox
                    citiesList={citiesListRef.current}
                    onCityDetected={handleAICityDetected}
                    onLegendActivate={handleLegendActivate}
                />
            </div>
        </div>
    );
}
