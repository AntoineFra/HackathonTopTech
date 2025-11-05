import { CommuneData, BuildingData, MapConfig } from "@/types/map";

// Département 06 (Alpes-Maritimes) configuration
export const DEPARTMENT_06_CONFIG: MapConfig = {
    center: { lat: 43.7034, lon: 7.2663 }, // Nice center
    bounds: {
        north: 44.35,
        south: 43.45,
        east: 7.7,
        west: 6.65,
    },
    initialZoom: 10,
    maxZoom: 18,
    minZoom: 8,
    projection: "mercator",
};

// Major communes in Alpes-Maritimes
export const COMMUNES_06: CommuneData[] = [
    {
        id: "comm-06088",
        name: "Nice",
        population: 340000,
        area: 71.92,
        enterpriseCount: 15420,
        tourismScore: 95,
        employmentRate: 88.5,
        averageIncome: 24500,
        coordinates: { lat: 43.7102, lon: 7.262 },
        bounds: [
            [7.15, 43.65],
            [7.35, 43.65],
            [7.35, 43.75],
            [7.15, 43.75],
        ],
    },
    {
        id: "comm-06029",
        name: "Cannes",
        population: 74000,
        area: 19.62,
        enterpriseCount: 8920,
        tourismScore: 98,
        employmentRate: 85.2,
        averageIncome: 28300,
        coordinates: { lat: 43.5528, lon: 7.0174 },
        bounds: [
            [6.95, 43.5],
            [7.08, 43.5],
            [7.08, 43.6],
            [6.95, 43.6],
        ],
    },
    {
        id: "comm-06004",
        name: "Antibes",
        population: 75000,
        area: 26.48,
        enterpriseCount: 7650,
        tourismScore: 92,
        employmentRate: 87.1,
        averageIncome: 25800,
        coordinates: { lat: 43.5808, lon: 7.1239 },
        bounds: [
            [7.05, 43.54],
            [7.18, 43.54],
            [7.18, 43.62],
            [7.05, 43.62],
        ],
    },
    {
        id: "comm-06085",
        name: "Menton",
        population: 29000,
        area: 14.05,
        enterpriseCount: 2340,
        tourismScore: 88,
        employmentRate: 83.4,
        averageIncome: 22100,
        coordinates: { lat: 43.7745, lon: 7.4949 },
        bounds: [
            [7.46, 43.74],
            [7.53, 43.74],
            [7.53, 43.81],
            [7.46, 43.81],
        ],
    },
    {
        id: "comm-06027",
        name: "Cagnes-sur-Mer",
        population: 51000,
        area: 17.95,
        enterpriseCount: 4120,
        tourismScore: 75,
        employmentRate: 86.3,
        averageIncome: 23400,
        coordinates: { lat: 43.6641, lon: 7.148 },
        bounds: [
            [7.1, 43.63],
            [7.2, 43.63],
            [7.2, 43.7],
            [7.1, 43.7],
        ],
    },
    {
        id: "comm-06069",
        name: "Grasse",
        population: 51000,
        area: 44.44,
        enterpriseCount: 3890,
        tourismScore: 72,
        employmentRate: 84.7,
        averageIncome: 21800,
        coordinates: { lat: 43.6584, lon: 6.9222 },
        bounds: [
            [6.87, 43.61],
            [6.98, 43.61],
            [6.98, 43.71],
            [6.87, 43.71],
        ],
    },
    {
        id: "comm-06155",
        name: "Vence",
        population: 19000,
        area: 39.23,
        enterpriseCount: 1560,
        tourismScore: 68,
        employmentRate: 82.1,
        averageIncome: 24200,
        coordinates: { lat: 43.7229, lon: 7.1128 },
        bounds: [
            [7.05, 43.68],
            [7.18, 43.68],
            [7.18, 43.77],
            [7.05, 43.77],
        ],
    },
    {
        id: "comm-06123",
        name: "Saint-Laurent-du-Var",
        population: 30000,
        area: 9.48,
        enterpriseCount: 3240,
        tourismScore: 65,
        employmentRate: 88.9,
        averageIncome: 23100,
        coordinates: { lat: 43.6707, lon: 7.1906 },
        bounds: [
            [7.16, 43.64],
            [7.22, 43.64],
            [7.22, 43.7],
            [7.16, 43.7],
        ],
    },
];

// Mock building data generator
export function generateMockBuildings(
    commune: CommuneData,
    count: number = 50,
): BuildingData[] {
    const buildings: BuildingData[] = [];
    const sectors = [
        "Technology",
        "Tourism",
        "Retail",
        "Healthcare",
        "Finance",
        "Real Estate",
        "Manufacturing",
        "Services",
    ];
    const buildingTypes = [
        "residential",
        "commercial",
        "industrial",
        "office",
        "mixed",
    ];

    const [minLon, minLat] = commune.bounds[0];
    const [maxLon, maxLat] = commune.bounds[2];

    for (let i = 0; i < count; i++) {
        const centerLon = minLon + Math.random() * (maxLon - minLon);
        const centerLat = minLat + Math.random() * (maxLat - minLat);

        // Generate simple rectangular footprint
        const width = 0.0002 + Math.random() * 0.0008; // ~20-80m
        const depth = 0.0002 + Math.random() * 0.0008;

        const footprint = [
            [centerLon - width / 2, centerLat - depth / 2],
            [centerLon + width / 2, centerLat - depth / 2],
            [centerLon + width / 2, centerLat + depth / 2],
            [centerLon - width / 2, centerLat + depth / 2],
            [centerLon - width / 2, centerLat - depth / 2], // Close polygon
        ];

        const type =
            buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
        const floors = 1 + Math.floor(Math.random() * 12);
        const height = floors * 3; // 3m per floor

        buildings.push({
            id: `building-${commune.id}-${i}`,
            name: `Building ${i + 1}`,
            commune: commune.name,
            coordinates: { lat: centerLat, lon: centerLon },
            footprint,
            height,
            floors,
            type,
            sector:
                type === "commercial" ||
                type === "office" ||
                type === "industrial"
                    ? sectors[Math.floor(Math.random() * sectors.length)]
                    : undefined,
            enterpriseCount:
                type === "commercial" || type === "office"
                    ? Math.floor(Math.random() * 20) + 1
                    : 0,
            metadata: {
                constructionYear: 1950 + Math.floor(Math.random() * 70),
            },
        });
    }

    return buildings;
}

// Generate all buildings for all communes
export function generateAllBuildings(): BuildingData[] {
    const allBuildings: BuildingData[] = [];

    for (const commune of COMMUNES_06) {
        // Generate proportional to population (smaller communes get fewer buildings)
        const buildingCount = Math.min(
            100,
            Math.floor((commune.population || 1000) / 1000),
        );
        const buildings = generateMockBuildings(commune, buildingCount);
        allBuildings.push(...buildings);
    }

    return allBuildings;
}

// Département 06 boundary (simplified polygon)
export const DEPARTMENT_06_BOUNDARY = [
    [6.65, 43.45],
    [6.7, 43.5],
    [6.75, 43.75],
    [6.85, 44.0],
    [7.0, 44.2],
    [7.2, 44.35],
    [7.4, 44.3],
    [7.6, 44.15],
    [7.7, 43.95],
    [7.65, 43.75],
    [7.55, 43.6],
    [7.45, 43.5],
    [7.2, 43.45],
    [6.9, 43.48],
    [6.65, 43.45],
];
