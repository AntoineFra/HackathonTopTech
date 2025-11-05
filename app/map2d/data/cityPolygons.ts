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

// Créer l'objet cityPolygons à partir de db_cities.json
export const cityPolygons: CityPolygonsType = {};
export const cityData: CityDataMap = {};

citiesData.forEach(city => {
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

console.log(`${Object.keys(cityPolygons).length} villes chargées avec leurs polygones`);
