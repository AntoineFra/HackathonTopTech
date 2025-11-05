/**
 * Department Loader - Charge et affiche les contours des communes
 */

import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

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
  centerLon: number
): { x: number; z: number } {
  if (!isFinite(lat) || !isFinite(lon) || !isFinite(centerLat) || !isFinite(centerLon)) {
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
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const response = await fetch(`${backendUrl}/trois-d/cities`);
    if (!response.ok) {
      throw new Error(`Failed to fetch cities: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading cities:', error);
    return [];
  }
}

/**
 * Calcule les bounds du département
 */
export function calculateDepartmentBounds(
  cities: CityWithGeoData[]
): { minX: number; maxX: number; minZ: number; maxZ: number; centerLat: number; centerLon: number } | null {
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

      if (geomType === 'Polygon') {
        allCoordinates = contourData.coordinates[0] || [];
      } else if (geomType === 'MultiPolygon') {
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

      if (geomType === 'Polygon') {
        allCoordinates = contourData.coordinates[0] || [];
      } else if (geomType === 'MultiPolygon') {
        contourData.coordinates.forEach((poly: any) => {
          if (poly[0]) allCoordinates.push(...poly[0]);
        });
      }

      allCoordinates.forEach((coord: [number, number]) => {
        const [lon, lat] = coord;
        if (!isFinite(lon) || !isFinite(lat)) return;

        const { x, z } = latLonToCartesian(lat, lon, centerLat, centerLon);
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
}/**
 * Crée les contours des communes avec remplissage
 */
export function createDepartmentContours(
  cities: CityWithGeoData[],
  centerLat: number,
  centerLon: number,
  options: { showLabels?: boolean } = {}
): THREE.Group {
  const group = new THREE.Group();

  cities.forEach((city) => {
    if (!city.geoData || !city.geoData.contour) return;

    try {
      const contourData = JSON.parse(city.geoData.contour);
      const geomType = contourData.type;

      let polygons: any[] = [];

      if (geomType === 'Polygon') {
        polygons = [contourData.coordinates[0]];
      } else if (geomType === 'MultiPolygon') {
        polygons = contourData.coordinates.map((poly: any) => poly[0]);
      }

      const contourColor = 0xFFD700; // Or/jaune vif pour le contour (complémentaire du vert)
      const fillColor = 0x4CAF50; // Vert moyen pour le remplissage

      // Créer un groupe pour cette ville (tous ses polygones)
      const cityGroup = new THREE.Group();
      cityGroup.userData = {
        type: 'city',
        city: city.name,
        codeINSEE: city.codeINSEE,
        population: city.population,
        originalFillColor: fillColor
      };

      polygons.forEach((coordinates) => {
        if (!coordinates || coordinates.length < 3) return;

        const points: THREE.Vector3[] = [];
        const points2D: THREE.Vector2[] = [];

        coordinates.forEach((coord: [number, number]) => {
          const [lon, lat] = coord;

          if (!isFinite(lon) || !isFinite(lat)) return;

          const { x, z } = latLonToCartesian(lat, lon, centerLat, centerLon);

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
            newPositions[i] = positions[i];      // x reste x
            newPositions[i + 1] = 10;            // y devient 10 (hauteur)
            newPositions[i + 2] = positions[i + 1]; // y devient z
          }

          fillGeometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
          fillGeometry.computeVertexNormals();

          const fillMaterial = new THREE.MeshBasicMaterial({
            color: fillColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6,
          });

          const fillMesh = new THREE.Mesh(fillGeometry, fillMaterial);
          fillMesh.userData = { type: 'fill' };
          cityGroup.add(fillMesh);
        } catch (error) {
          console.error(`Error creating fill for ${city.name}:`, error);
        }

        // Fermer le contour
        points.push(points[0].clone());

        // Créer le contour orange
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({
          color: contourColor,
          linewidth: 5,
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        line.userData = { type: 'contour' };
        cityGroup.add(line);
      });

      if (cityGroup.children.length > 0) {
        group.add(cityGroup);
        console.log(`✅ Ville ajoutée: ${city.name} - ${polygons.length} polygone(s)`);
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
  camera?: THREE.Camera
): Promise<THREE.Group> {
  const labelGroup = new THREE.Group();

  try {
    // Normaliser le nom de la ville (enlever les accents)
    const normalizedName = cityName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // Charger la police
    const fontLoader = new FontLoader();
    const font = await new Promise<any>((resolve, reject) => {
      fontLoader.load(
        'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json',
        resolve,
        undefined,
        reject
      );
    });

    // Créer la géométrie du texte (taille très réduite)
    const textGeometry = new TextGeometry(normalizedName, {
      font: font,
      size: 3, // Encore plus petit
      depth: 0.2,
      curveSegments: 4,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.05,
      bevelOffset: 0,
      bevelSegments: 1,
    });

    textGeometry.center();

    // Matériau du texte
    const textMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      side: THREE.DoubleSide,
    });

    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // Positionner le texte au-dessus de la ville
    textMesh.position.set(0, 0, 0);

    labelGroup.add(textMesh);

    // Ajouter un fond semi-transparent (très petit)
    const bgGeometry = new THREE.PlaneGeometry(normalizedName.length * 2.5, 5);
    const bgMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    bgMesh.position.set(0, 0, -0.3);
    labelGroup.add(bgMesh);

    labelGroup.position.set(position.x, 15, position.z);

    // Stocker les infos pour l'animation billboard
    labelGroup.userData = {
      isBillboard: true,
      cityName: cityName,
    };

  } catch (error) {
    console.error('Error creating city label:', error);
  }

  return labelGroup;
}

/**
 * Met à jour l'orientation du label pour qu'il face toujours la caméra
 */
export function updateCityLabelOrientation(label: THREE.Group, camera: THREE.Camera) {
  if (!label.userData.isBillboard) return;

  // Faire face à la caméra
  label.lookAt(camera.position);
}

/**
 * Change la couleur d'une ville (vert clair si sélectionnée, vert moyen sinon)
 */
export function setCityColor(scene: THREE.Scene, cityName: string | null, selectedColor: number = 0x81C784) {
  scene.traverse((object) => {
    if (object.userData.type === 'city') {
      const isSelected = object.userData.city === cityName;
      const targetColor = isSelected ? selectedColor : object.userData.originalFillColor;

      // Parcourir les enfants pour trouver les meshes de remplissage
      object.children.forEach((child) => {
        if (child.userData.type === 'fill' && child instanceof THREE.Mesh) {
          (child.material as THREE.MeshBasicMaterial).color.setHex(targetColor);
        }
      });
    }
  });
}

/**
 * Change la couleur d'une ville survolée (jaune pâle pour le hover)
 */
export function setHoveredCityColor(scene: THREE.Scene, hoveredCity: string | null, selectedCity: string | null, hoverColor: number = 0xFFEB3B, selectedColor: number = 0x81C784) {
  scene.traverse((object) => {
    if (object.userData.type === 'city') {
      const cityName = object.userData.city;
      let targetColor = object.userData.originalFillColor;

      // Priorité: sélection > hover > couleur originale
      if (cityName === selectedCity) {
        targetColor = selectedColor;
      } else if (cityName === hoveredCity) {
        targetColor = hoverColor;
      }

      // Parcourir les enfants pour trouver les meshes de remplissage
      object.children.forEach((child) => {
        if (child.userData.type === 'fill' && child instanceof THREE.Mesh) {
          (child.material as THREE.MeshBasicMaterial).color.setHex(targetColor);
        }
      });
    }
  });
}

/**
 * Crée des montagnes autour du département pour délimiter la zone
 */
export function createMountainsBorder(
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number }
): THREE.Group {
  const mountainsGroup = new THREE.Group();

  const width = bounds.maxX - bounds.minX;
  const depth = bounds.maxZ - bounds.minZ;
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerZ = (bounds.minZ + bounds.maxZ) / 2;

  // Marge autour du département
  const margin = Math.max(width, depth) * 0.3;

  // Créer des montagnes autour (Nord, Sud, Est, Ouest)
  const mountainColor = 0x8B7355; // Marron montagne
  const snowColor = 0xE8E8E8; // Blanc neige

  const mountainCount = 30; // Nombre de montagnes

  // Générer des positions autour du périmètre
  for (let i = 0; i < mountainCount; i++) {
    const angle = (i / mountainCount) * Math.PI * 2;
    const distance = Math.max(width, depth) * 0.8 + margin;

    const x = centerX + Math.cos(angle) * distance;
    const z = centerZ + Math.sin(angle) * distance;

    // Hauteur aléatoire pour varier les montagnes
    const baseHeight = 300 + Math.random() * 400;
    const radius = 100 + Math.random() * 150;

    // Créer une montagne (cône)
    const coneGeometry = new THREE.ConeGeometry(radius, baseHeight, 8);
    const coneMaterial = new THREE.MeshLambertMaterial({
      color: mountainColor,
      flatShading: true
    });
    const mountain = new THREE.Mesh(coneGeometry, coneMaterial);
    mountain.position.set(x, baseHeight / 2, z);

    // Rotation aléatoire
    mountain.rotation.y = Math.random() * Math.PI * 2;

    mountainsGroup.add(mountain);

    // Ajouter un sommet enneigé pour les montagnes hautes
    if (baseHeight > 500) {
      const snowHeight = baseHeight * 0.3;
      const snowGeometry = new THREE.ConeGeometry(radius * 0.4, snowHeight, 8);
      const snowMaterial = new THREE.MeshLambertMaterial({
        color: snowColor,
        flatShading: true
      });
      const snow = new THREE.Mesh(snowGeometry, snowMaterial);
      snow.position.set(x, baseHeight - snowHeight / 2, z);
      mountainsGroup.add(snow);
    }
  }

  return mountainsGroup;
}
