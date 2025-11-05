import { Vector3 } from "three";

// Geographic data types
export interface GeoCoordinate {
    lat: number;
    lon: number;
}

export interface GeoFeature {
    type: "Feature";
    properties: Record<string, unknown>;
    geometry: {
        type: "Polygon" | "MultiPolygon" | "Point";
        coordinates: number[][] | number[][][] | number[];
    };
}

export interface GeoJSON {
    type: "FeatureCollection";
    features: GeoFeature[];
}

// Building data types
export interface BuildingData {
    id: string;
    name?: string;
    commune: string; // City name
    coordinates: GeoCoordinate;
    footprint: number[][]; // Polygon coordinates
    height?: number;
    floors?: number;
    type?: string; // residential, commercial, industrial, etc.
    sector?: string; // Economic sector
    enterpriseCount?: number;
    metadata?: Record<string, unknown>;
}

// Commune (city) data
export interface CommuneData {
    id: string;
    name: string;
    population?: number;
    area?: number; // km²
    enterpriseCount?: number;
    tourismScore?: number;
    employmentRate?: number;
    averageIncome?: number;
    coordinates: GeoCoordinate;
    bounds: number[][];
}

// Color schemes for visualization
export type ColorScheme =
    | "default"
    | "enterprises"
    | "population"
    | "tourism"
    | "employment"
    | "income"
    | "sectors"
    | "custom";

export interface ColorMapping {
    scheme: ColorScheme;
    label: string;
    description: string;
    colorScale: {
        min: string; // Hex color
        max: string; // Hex color
        mid?: string; // Optional middle color
    };
    dataField: keyof BuildingData | keyof CommuneData | string;
}

// Map state and actions
export interface MapState {
    colorScheme: ColorScheme;
    selectedCommune?: string;
    selectedBuilding?: string;
    highlightedFeatures: string[];
    filter?: MapFilter;
    visualizationMode: VisualizationMode;
    cameraPosition?: Vector3;
    isLoading: boolean;
}

export interface MapFilter {
    communeIds?: string[];
    buildingTypes?: string[];
    sectors?: string[];
    minValue?: number;
    maxValue?: number;
    dataField?: string;
}

export type VisualizationMode =
    | "3d-buildings"
    | "heatmap"
    | "choropleth"
    | "bars"
    | "categorical";

// Map actions from AI queries
export interface MapAction {
    type: "color" | "filter" | "focus" | "highlight" | "mode";
    colorScheme?: ColorScheme;
    filter?: MapFilter;
    focusOn?: {
        commune?: string;
        building?: string;
        coordinates?: GeoCoordinate;
    };
    highlightFeatures?: string[];
    visualizationMode?: VisualizationMode;
    animate?: boolean;
    duration?: number; // Animation duration in ms
}

// AI response with map instructions
export interface MapQueryResponse {
    mapActions: MapAction[];
    visualData?: {
        colorMappings?: Record<string, string>; // featureId -> color
        dataValues?: Record<string, number>; // featureId -> value
    };
    textResponse: string;
    success: boolean;
}

// 3D Scene data
export interface SceneBuilding {
    id: string;
    position: Vector3;
    shape: Vector3[]; // Footprint as 3D vertices
    height: number;
    color: string;
    userData: BuildingData;
}

export interface SceneCommune {
    id: string;
    name: string;
    boundary: Vector3[]; // 3D boundary points
    center: Vector3;
    userData: CommuneData;
}

// Map configuration
export interface MapConfig {
    center: GeoCoordinate; // Department center
    bounds: {
        north: number;
        south: number;
        east: number;
        west: number;
    };
    initialZoom: number;
    maxZoom: number;
    minZoom: number;
    projection: "lambert93" | "mercator";
}

// Interaction events
export interface MapInteractionEvent {
    type: "hover" | "click" | "select";
    featureType: "building" | "commune" | "terrain";
    featureId: string;
    position: Vector3;
    data: BuildingData | CommuneData;
}
