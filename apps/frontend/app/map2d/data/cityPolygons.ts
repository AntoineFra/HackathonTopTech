// Ce fichier extrait les données des villes depuis db_cities.json
import citiesData from './db_cities.json';

interface GeoJSONGeometry {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: any; // Can be number[][][] for Polygon or number[][][][] for MultiPolygon
}

export interface CityDataType {
  code?: string;
  population: number;
  surface?: number;
  zone: string;
  tourisme: number;
  emploi: number;
  revenu: number;
  secteur: string;
  entreprises: number;
  centreLat?: number;
  centreLon?: number;
}

interface LatLngLiteral {
  lat: number;
  lng: number;
}

// Pour Google Maps, on peut avoir plusieurs polygones par ville (MultiPolygon)
interface CityPolygonsType {
  [key: string]: LatLngLiteral[][]; // Array de polygones (chaque polygone est un array de points)
}

interface CityDataMap {
  [key: string]: CityDataType;
}

/**
 * Fonction pour convertir les coordonnées GeoJSON en format Google Maps
 * Gère correctement Polygon ET MultiPolygon en retournant TOUS les polygones
 * 
 * @param contourString - String JSON du contour GeoJSON
 * @returns Array de polygones, chaque polygone étant un array de LatLngLiteral
 */
function parseGeoJSONToGoogleMaps(contourString: string): LatLngLiteral[][] {
  try {
    const geoJSON = JSON.parse(contourString) as GeoJSONGeometry;
    
    if (!geoJSON || !geoJSON.coordinates || !geoJSON.type) {
      console.warn('GeoJSON invalide ou vide');
      return [];
    }

    const allPolygons: LatLngLiteral[][] = [];

    if (geoJSON.type === 'Polygon') {
      // Polygon: coordinates = [exterior_ring, ...holes]
      // On ne prend que le contour extérieur (premier élément)
      const exteriorRing = geoJSON.coordinates[0];
      
      if (Array.isArray(exteriorRing) && exteriorRing.length >= 3) {
        const polygon = exteriorRing.map((coord: number[]) => ({
          lat: coord[1],  // GeoJSON est [lng, lat]
          lng: coord[0]
        }));
        allPolygons.push(polygon);
      }
      
    } else if (geoJSON.type === 'MultiPolygon') {
      // MultiPolygon: coordinates = [[exterior_ring, ...holes], ...]
      // On parcourt TOUS les polygones
      geoJSON.coordinates.forEach((polygonCoords: any) => {
        if (!Array.isArray(polygonCoords) || polygonCoords.length === 0) return;
        
        // Prendre le contour extérieur de ce polygone
        const exteriorRing = polygonCoords[0];
        
        if (Array.isArray(exteriorRing) && exteriorRing.length >= 3) {
          const polygon = exteriorRing.map((coord: number[]) => ({
            lat: coord[1],  // GeoJSON est [lng, lat]
            lng: coord[0]
          }));
          allPolygons.push(polygon);
        }
      });
    }

    return allPolygons;
    
  } catch (error) {
    console.error('Erreur parsing GeoJSON:', error);
    return [];
  }
}

// Fonction pour vérifier si une ville est dans les Alpes-Maritimes
function isInAlpesMaritimes(city: any): boolean {
  // Liste noire : villes avec code 06 mais coordonnées aberrantes ou homonymes
  const BLACKLIST = [
    'Aiglun',          // lng=6.1413 - trop ouest, probablement erreur de données
    'Saint-Jeannet',   // lng=6.1119 - trop ouest, probablement erreur de données
    'Aspremont',       // lng=5.7154 - Hautes-Alpes (homonyme)
    'Castillon',       // lng=0.6049 - Gironde (homonyme)
    'Marie',           // lat=50.1020 - Nord (homonyme)
    'Le Mas',          // lng=2.5386 - Tarn (homonyme)
    'La Tour',         // lat=49.1420 - Marne (homonyme)
    'La Trinité'       // lat=48.7959 - Orne (homonyme)
  ];
  
  // Exclure les villes de la liste noire
  if (BLACKLIST.includes(city.name)) {
    console.log(`❌ ${city.name} - dans la liste noire (coordonnées aberrantes ou homonyme)`);
    return false;
  }
  
  // DOIT avoir le code département 06
  if (city.codeDepartement !== "06") {
    return false;
  }
  
  // DOIT avoir des coordonnées géographiques valides
  if (!city.geoData || !city.geoData.centreLat || !city.geoData.centreLon) {
    console.log(`⚠️ Ville ${city.name} (06) sans coordonnées - ignorée`);
    return false;
  }
  
  const lat = city.geoData.centreLat;
  const lng = city.geoData.centreLon;
  
  // Limites larges pour capturer toutes les vraies villes du 06
  // (les homonymes sont déjà filtrés par la liste noire)
  const isInBounds = 
    lat >= 43.4 && lat <= 44.5 &&  // Latitude raisonnable
    lng >= 6.5 && lng <= 7.8;       // Longitude raisonnable
  
  if (!isInBounds) {
    console.log(`❌ ${city.name} (code 06) hors limites: lat=${lat.toFixed(4)}, lng=${lng.toFixed(4)}`);
  }
  
  return isInBounds;
}

// Créer l'objet cityPolygons à partir de db_cities.json
export const cityPolygons: CityPolygonsType = {};
export const cityData: CityDataMap = {};

let filteredCount = 0;
citiesData.forEach(city => {
  // Filtrer uniquement les villes des Alpes-Maritimes
  if (!isInAlpesMaritimes(city)) {
    filteredCount++;
    return;
  }
  
  if (city.geoData && city.geoData.contour) {
    const polygonCoords = parseGeoJSONToGoogleMaps(city.geoData.contour);
    
    if (polygonCoords.length > 0) {
      cityPolygons[city.name] = polygonCoords;
      
      // Stocker les données de la ville
      cityData[city.name] = {
        code: city.codeINSEE,
        population: city.population || 0,
        surface: city.surface || 0,
        zone: city.zone || 'N/A',
        tourisme: Math.floor(Math.random() * 100), // Données simulées
        emploi: Math.floor(Math.random() * 100),
        revenu: Math.floor(Math.random() * 3000) + 1500,
        secteur: ['Technologie', 'Tourisme', 'Agriculture', 'Commerce'][Math.floor(Math.random() * 4)],
        entreprises: Math.floor(Math.random() * 5000) + 100,
        centreLat: city.geoData.centreLat,
        centreLon: city.geoData.centreLon
      };
    }
  }
});

console.log(`✅ ${Object.keys(cityPolygons).length} villes chargées avec leurs polygones`);
console.log(`🚫 ${filteredCount} villes filtrées (hors Alpes-Maritimes)`);
