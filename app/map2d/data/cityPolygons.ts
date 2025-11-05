// Ce fichier extrait les données des villes depuis db_cities.json
import citiesData from './db_cities.json';

interface GeoJSONGeometry {
  type: string;
  coordinates: number[][][];
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

interface CityPolygonsType {
  [key: string]: LatLngLiteral[];
}

interface CityDataMap {
  [key: string]: CityDataType;
}

// Fonction pour convertir les coordonnées GeoJSON en format Google Maps
function parseGeoJSONToGoogleMaps(contourString: string): LatLngLiteral[] {
  try {
    const geoJSON = JSON.parse(contourString) as GeoJSONGeometry;
    
    if (!geoJSON || !geoJSON.coordinates) {
      return [];
    }

    // Gérer MultiPolygon et Polygon
    let coordinates: any = geoJSON.coordinates;
    
    if (geoJSON.type === 'MultiPolygon') {
      // Prendre le premier polygone du MultiPolygon
      coordinates = coordinates[0];
    }
    
    if (geoJSON.type === 'Polygon') {
      // Prendre le contour externe (premier élément)
      coordinates = coordinates[0];
    }

    // Convertir [lng, lat] en {lat, lng}
    return coordinates.map((coord: number[]) => ({
      lat: coord[1],
      lng: coord[0]
    }));
  } catch (error) {
    console.error('Erreur parsing GeoJSON:', error);
    return [];
  }
}

// Fonction pour vérifier si une ville est dans les Alpes-Maritimes
function isInAlpesMaritimes(city: any): boolean {
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
  
  // Limites des Alpes-Maritimes (06) avec tolérance pour données imprécises
  // Latitude: 43.4 à 44.4 (du littoral aux montagnes)
  // Longitude: 6.0 à 7.8 (de Grasse/ouest à Menton/est) - élargi pour capturer toutes les villes du 06
  // 
  // Filtre agressif pour exclure les homonymes aberrants (autres départements)
  // Ex: Castillon en Gironde (lng=0.6), Marie dans le Nord (lat=50.1), etc.
  const isInBounds = 
    lat >= 43.4 && lat <= 44.4 &&  // Latitude raisonnable pour le 06
    lng >= 6.0 && lng <= 7.8 &&     // Longitude raisonnable pour le 06
    !(lat > 45 || lat < 43) &&      // Exclure aberrations nord/sud
    !(lng < 5 || lng > 8);          // Exclure aberrations est/ouest
  
  // Log les villes filtrées pour debug
  if (!isInBounds) {
    console.log(`❌ ${city.name} (code 06) MAIS coordonnées aberrantes: lat=${lat.toFixed(4)}, lng=${lng.toFixed(4)} → probablement homonyme autre département`);
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
