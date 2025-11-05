/**
 * Map3D Department Component - Configuration de base Three.js
 * Affiche uniquement les contours des communes du département 06
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import {
  loadAllCities,
  calculateDepartmentBounds,
  createDepartmentContours,
  createCityLabel,
  updateCityLabelOrientation,
  setCityColor,
  setHoveredCityColor,
} from '@/lib/threejs-loaders/departmentLoader';

function DepartmentScene({ onLoadingChange, onCityCountChange, onCenterCalculated, onSelectedCity, selectedCityName, citiesListRef, controlsRef }: {
  onLoadingChange: (loading: boolean) => void;
  onCityCountChange: (count: number) => void;
  onCenterCalculated: (center: { x: number; y: number; z: number }) => void;
  onSelectedCity: (cityName: string | null) => void;
  selectedCityName: string | null;
  citiesListRef: React.MutableRefObject<string[]>;
  controlsRef: React.MutableRefObject<any>;
}) {
  const { scene, camera, gl } = useThree();
  const loadedRef = useRef(false);
  const selectedLine = useRef<THREE.Line | null>(null);
  const centerLatLonRef = useRef<{ centerLat: number; centerLon: number } | null>(null);
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
    scene.background = new THREE.Color(0x87CEEB); // Bleu ciel

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
          console.log('📍 Bounds:', bounds);
          console.log('📏 Dimensions:', {
            width: bounds.maxX - bounds.minX,
            depth: bounds.maxZ - bounds.minZ
          });

          // Créer les contours
          const contours = createDepartmentContours(
            cities,
            bounds.centerLat,
            bounds.centerLon,
            { showLabels: false }
          );
          scene.add(contours);
          console.log(`🗺️ ${contours.children.length} contours ajoutés à la scène`);

          // Récupérer la liste des villes pour la navigation
          const cityNames: string[] = [];
          contours.children.forEach(child => {
            if (child.userData.city) {
              cityNames.push(child.userData.city);
            }
          });
          citiesListRef.current = cityNames.sort();
          console.log(`📋 ${cityNames.length} villes disponibles pour navigation`);

          // Sauvegarder le centre pour les conversions lat/lon
          centerLatLonRef.current = { centerLat: bounds.centerLat, centerLon: bounds.centerLon };

          // Positionner la caméra pour voir TOUS les contours
          const width = bounds.maxX - bounds.minX;
          const depth = bounds.maxZ - bounds.minZ;
          const centerX = (bounds.minX + bounds.maxX) / 2;
          const centerZ = (bounds.minZ + bounds.maxZ) / 2;
          const maxDimension = Math.max(width, depth);
          const distance = maxDimension * 1.2; // Vue d'ensemble

          // Placer la caméra au-dessus et légèrement en arrière
          camera.position.set(centerX, distance, centerZ + distance * 0.5);
          camera.lookAt(centerX, 0, centerZ);

          // Notifier le parent du centre calculé
          onCenterCalculated({ x: centerX, y: distance, z: centerZ });

          console.log('📷 Caméra positionnée:', {
            position: { x: centerX, y: distance, z: centerZ + distance * 0.5 },
            target: { x: centerX, y: 0, z: centerZ },
            distance: maxDimension
          });
        }

        onLoadingChange(false);
      } catch (error) {
        console.error('❌ Erreur:', error);
        onLoadingChange(false);
      }
    };

    loadDepartment();
  }, [scene, camera, gl, onLoadingChange, onCityCountChange, onCenterCalculated, onSelectedCity, citiesListRef]);

  // Gestion du survol et du clic sur les villes
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Calculer la position de la souris en coordonnées normalisées (-1 à +1)
      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycasting
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);

      let foundCity: string | null = null;
      for (const intersect of intersects) {
        // Chercher le groupe parent de type 'city'
        let object = intersect.object;
        while (object.parent) {
          if (object.userData.type === 'city') {
            foundCity = object.userData.city;
            break;
          }
          object = object.parent;
        }
        if (foundCity) break;
      }

      setHoveredCity(foundCity);
      // Changer le curseur
      canvas.style.cursor = foundCity ? 'pointer' : 'default';
    };

    const handleMouseDown = () => {
      mouseDownTime.current = Date.now();
    };

    const handleClick = (event: MouseEvent) => {
      // Vérifier que le clic n'a pas duré trop longtemps
      const clickDuration = Date.now() - mouseDownTime.current;
      if (clickDuration > clickThreshold) {
        console.log('⏱️ Clic annulé (trop long)');
        return;
      }

      if (hoveredCity) {
        onSelectedCity(hoveredCity);
        // Trouver l'index de la ville dans la liste
        const index = citiesListRef.current.indexOf(hoveredCity);
        if (index !== -1) {
          // Mettre à jour l'index courant dans le parent
          console.log(`🖱️ Ville cliquée: ${hoveredCity} (index: ${index})`);
        }
      }
    };

    const canvas = gl.domElement;
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('click', handleClick);
    };
  }, [scene, camera, gl, hoveredCity, onSelectedCity, citiesListRef]);

  // Centrer la caméra sur la ville sélectionnée
  useEffect(() => {
    if (!selectedCityName || !centerLatLonRef.current) return;

    const fetchCityAndCenter = async () => {
      try {
        console.log(`🎯 Chargement des données de ${selectedCityName}...`);
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
        const response = await fetch(`${backendUrl}/trois-d/cities/${selectedCityName}`);
        if (!response.ok) {
          const errorData = await response.text();
          console.error(`❌ Erreur ${response.status}:`, errorData);
          return;
        }

        const cityData = await response.json();
        console.log(`✅ Données de ${selectedCityName} chargées:`, cityData);

        if (!cityData.geoData?.contour) {
          console.warn(`Pas de contour pour ${selectedCityName}`);
          return;
        }

        // Parser le contour
        const contourData = JSON.parse(cityData.geoData.contour);
        const geomType = contourData.type;

        // Récupérer toutes les coordonnées
        let allCoordinates: [number, number][] = [];
        if (geomType === 'Polygon') {
          allCoordinates = contourData.coordinates[0] || [];
        } else if (geomType === 'MultiPolygon') {
          contourData.coordinates.forEach((poly: any) => {
            if (poly[0]) allCoordinates.push(...poly[0]);
          });
        }

        if (allCoordinates.length === 0) return;

        // Calculer le centre du contour
        let sumLat = 0, sumLon = 0;
        let minLat = Infinity, maxLat = -Infinity;
        let minLon = Infinity, maxLon = -Infinity;

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
        const { centerLat, centerLon } = centerLatLonRef.current;
        const R = 6371000;
        const lat1 = (centerLat * Math.PI) / 180;
        const lat2 = (avgLat * Math.PI) / 180;
        const deltaLon = ((avgLon - centerLon) * Math.PI) / 180;

        let x = deltaLon * R * Math.cos(lat1) / 100;
        let z = -(lat2 - lat1) * R / 100;

        // Calculer les bounds de la ville en coordonnées cartésiennes
        const lat1Min = (centerLat * Math.PI) / 180;
        const lat2Min = (minLat * Math.PI) / 180;
        const lat2Max = (maxLat * Math.PI) / 180;
        const deltaLonMin = ((minLon - centerLon) * Math.PI) / 180;
        const deltaLonMax = ((maxLon - centerLon) * Math.PI) / 180;

        const xMin = deltaLonMin * R * Math.cos(lat1Min) / 100;
        const xMax = deltaLonMax * R * Math.cos(lat1Min) / 100;
        const zMin = -(lat2Max - lat1Min) * R / 100;
        const zMax = -(lat2Min - lat1Min) * R / 100;

        const cityWidth = Math.abs(xMax - xMin);
        const cityDepth = Math.abs(zMax - zMin);
        const citySize = Math.max(cityWidth, cityDepth);

        // Distance de la caméra : vue en forte plongée (angle ~30 degrés)
        const cameraHeight = citySize * 0.8; // Hauteur modérée pour être "un peu plus grand"
        const cameraDistance = citySize * 2; // Distance horizontale importante pour vue face à nous

        console.log(`📍 Centre de ${selectedCityName}:`, { x, z });
        console.log(`📐 Taille de ${selectedCityName}:`, { width: cityWidth, depth: cityDepth, height: cameraHeight });

        // Positionner la caméra en forte plongée (ville face à nous)
        camera.position.set(x, cameraHeight, z + cameraDistance);
        camera.lookAt(x, 0, z);

        // Déplacer les controls vers cette position
        if (controlsRef.current) {
          controlsRef.current.target.set(x, 0, z);
          controlsRef.current.update();
          console.log(`📷 Caméra repositionnée en plongée sur ${selectedCityName}`);
        }

        // Créer le label 3D au-dessus de la ville
        if (cityLabelRef.current) {
          scene.remove(cityLabelRef.current);
          cityLabelRef.current = null;
        }

        const label = await createCityLabel(selectedCityName, { x, z }, cameraHeight * 0.3);
        cityLabelRef.current = label;
        scene.add(label);
        console.log(`🏷️ Label 3D créé pour ${selectedCityName}`);

      } catch (error) {
        console.error(`Erreur lors du chargement de ${selectedCityName}:`, error);
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

  // Changer la couleur de la ville sélectionnée et survolée
  useEffect(() => {
    setHoveredCityColor(scene, hoveredCity, selectedCityName);
  }, [selectedCityName, hoveredCity, scene]);

  return null;
}

export default function Map3DDepartment() {
  const [cityCount, setCityCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState({ x: 0, y: 5000, z: 0 });
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const citiesListRef = useRef<string[]>([]);
  const controlsRef = useRef<any>(null);

  const handleRecenter = () => {
    if (controlsRef.current) {
      controlsRef.current.target.set(mapCenter.x, 0, mapCenter.z);
      controlsRef.current.update();
    }
  };

  const handleCitySelected = (cityName: string | null) => {
    setSelectedCity(cityName);
    if (cityName) {
      const index = citiesListRef.current.indexOf(cityName);
      if (index !== -1) {
        setCurrentCityIndex(index);
      }
    }
  };

  // Navigation avec les flèches
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (citiesListRef.current.length === 0) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const newIndex = (currentCityIndex + 1) % citiesListRef.current.length;
        setCurrentCityIndex(newIndex);
        setSelectedCity(citiesListRef.current[newIndex]);
        console.log(`➡️ Ville suivante: ${citiesListRef.current[newIndex]}`);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const newIndex = currentCityIndex === 0 ? citiesListRef.current.length - 1 : currentCityIndex - 1;
        setCurrentCityIndex(newIndex);
        setSelectedCity(citiesListRef.current[newIndex]);
        console.log(`⬅️ Ville précédente: ${citiesListRef.current[newIndex]}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCityIndex]);

  return (
    <div className="relative w-full h-screen">
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
        />
      </Canvas>

      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold">Chargement...</h2>
            {cityCount > 0 && <p className="text-sm text-green-600 mt-2">{cityCount} communes</p>}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 min-w-[280px]">
        <h2 className="text-lg font-bold">Département 06</h2>
        <p className="text-sm text-gray-600">{cityCount} communes</p>

        <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
          <p className="font-semibold mb-1">Navigation :</p>
          <p>• ← → : Ville précédente / suivante</p>
          <p>• ↑ ↓ : Parcourir les communes</p>
        </div>

        <button
          onClick={handleRecenter}
          className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
        >
          Recentrer la vue
        </button>
      </div>

      {/* Ville sélectionnée - Card à droite */}
      {selectedCity && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-6 min-w-[320px] border border-gray-200">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Commune sélectionnée</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{selectedCity}</h3>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">Position</span>
              <span className="text-sm font-medium">
                {currentCityIndex + 1} / {citiesListRef.current.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

