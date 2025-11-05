import { ColorMapping, ColorScheme } from "@/types/map";

export const COLOR_SCHEMES: Record<ColorScheme, ColorMapping> = {
    default: {
        scheme: "default",
        label: "Par défaut",
        description: "Couleur neutre pour tous les bâtiments",
        colorScale: {
            min: "#e0e0e0",
            max: "#9e9e9e",
        },
        dataField: "height",
    },
    enterprises: {
        scheme: "enterprises",
        label: "Densité d'entreprises",
        description: "Rouge = forte concentration d'entreprises",
        colorScale: {
            min: "#ffebee",
            mid: "#ef5350",
            max: "#b71c1c",
        },
        dataField: "enterpriseCount",
    },
    population: {
        scheme: "population",
        label: "Densité de population",
        description: "Bleu = forte densité de population",
        colorScale: {
            min: "#e3f2fd",
            mid: "#42a5f5",
            max: "#0d47a1",
        },
        dataField: "population",
    },
    tourism: {
        scheme: "tourism",
        label: "Score touristique",
        description: "Vert = forte attractivité touristique",
        colorScale: {
            min: "#e8f5e9",
            mid: "#66bb6a",
            max: "#1b5e20",
        },
        dataField: "tourismScore",
    },
    employment: {
        scheme: "employment",
        label: "Taux d'emploi",
        description: "Orange = taux d'emploi élevé",
        colorScale: {
            min: "#fff3e0",
            mid: "#ffa726",
            max: "#e65100",
        },
        dataField: "employmentRate",
    },
    income: {
        scheme: "income",
        label: "Revenu moyen",
        description: "Violet = revenu moyen élevé",
        colorScale: {
            min: "#f3e5f5",
            mid: "#ab47bc",
            max: "#4a148c",
        },
        dataField: "averageIncome",
    },
    sectors: {
        scheme: "sectors",
        label: "Secteurs économiques",
        description: "Couleurs par secteur d'activité",
        colorScale: {
            min: "#e0e0e0",
            max: "#616161",
        },
        dataField: "sector",
    },
    custom: {
        scheme: "custom",
        label: "Personnalisé",
        description: "Couleurs personnalisées",
        colorScale: {
            min: "#ffffff",
            max: "#000000",
        },
        dataField: "custom",
    },
};

// Sector-specific colors
export const SECTOR_COLORS: Record<string, string> = {
    Technology: "#2196f3", // Blue
    Tourism: "#4caf50", // Green
    Retail: "#ff9800", // Orange
    Healthcare: "#e91e63", // Pink
    Finance: "#9c27b0", // Purple
    "Real Estate": "#795548", // Brown
    Manufacturing: "#607d8b", // Blue Grey
    Services: "#00bcd4", // Cyan
    Other: "#9e9e9e", // Grey
};

// Building type colors
export const BUILDING_TYPE_COLORS: Record<string, string> = {
    residential: "#90caf9", // Light blue
    commercial: "#ef5350", // Red
    industrial: "#ffa726", // Orange
    office: "#66bb6a", // Green
    mixed: "#ab47bc", // Purple
    other: "#bdbdbd", // Grey
};

/**
 * Get color for a specific sector
 */
export function getSectorColor(sector?: string): string {
    if (!sector) return SECTOR_COLORS.Other;
    return SECTOR_COLORS[sector] || SECTOR_COLORS.Other;
}

/**
 * Get color for a specific building type
 */
export function getBuildingTypeColor(type?: string): string {
    if (!type) return BUILDING_TYPE_COLORS.other;
    return BUILDING_TYPE_COLORS[type] || BUILDING_TYPE_COLORS.other;
}

// Re-export from map-utils for convenience
export { getColorForValue } from "./map-utils";
