/**
 * INSEE Sirene API Service
 * Documentation: https://portail-api.insee.fr/
 * Old URL (deprecated): https://api.insee.fr/catalogue/
 *
 * Provides enterprise data by commune, sector mapping, and statistics
 */

import { fetchWithCache } from "./cache-service";

const INSEE_API_BASE = "https://api.insee.fr/entreprises/sirene/V3";
const INSEE_CONSUMER_KEY = process.env.INSEE_CONSUMER_KEY;
const INSEE_CONSUMER_SECRET = process.env.INSEE_CONSUMER_SECRET;

interface INSEEAccessToken {
    access_token: string;
    expires_at: number;
}

let accessToken: INSEEAccessToken | null = null;

/**
 * Get OAuth2 access token for INSEE API
 */
async function getINSEEAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (accessToken && Date.now() < accessToken.expires_at) {
        return accessToken.access_token;
    }

    if (!INSEE_CONSUMER_KEY || !INSEE_CONSUMER_SECRET) {
        throw new Error("INSEE API credentials not configured");
    }

    const auth = Buffer.from(
        `${INSEE_CONSUMER_KEY}:${INSEE_CONSUMER_SECRET}`,
    ).toString("base64");

    const response = await fetch("https://api.insee.fr/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    if (!response.ok) {
        throw new Error(`INSEE OAuth error: ${response.status}`);
    }

    const data = await response.json();

    accessToken = {
        access_token: data.access_token,
        expires_at: Date.now() + (data.expires_in - 60) * 1000, // Subtract 60s for safety
    };

    return accessToken.access_token;
}

/**
 * INSEE Establishment (enterprise location) data
 */
export interface INSEEEtablissement {
    siret: string;
    siren: string;
    denominationUniteLegale?: string;
    activitePrincipaleEtablissement: string; // APE code
    activitePrincipaleUniteLegale?: string;
    trancheEffectifsEtablissement?: string;
    dateCreationEtablissement?: string;
    etatAdministratifEtablissement?: string;
    adresseEtablissement: {
        numeroVoieEtablissement?: string;
        typeVoieEtablissement?: string;
        libelleVoieEtablissement?: string;
        codePostalEtablissement?: string;
        libelleCommuneEtablissement?: string;
        codeCommuneEtablissement?: string;
    };
    geo_adresse?: string;
    geo_l4?: string;
    longitude?: string;
    latitude?: string;
}

interface INSEEResponse {
    header: {
        statut: number;
        message: string;
        total: number;
        debut: number;
        nombre: number;
    };
    etablissements: INSEEEtablissement[];
}

/**
 * Fetch enterprises (establishments) in a specific commune
 * @param communeCode INSEE commune code (e.g., "06088" for Nice)
 * @param active Only fetch active establishments
 */
export async function fetchEnterprisesInCommune(
    communeCode: string,
    active: boolean = true,
): Promise<INSEEEtablissement[]> {
    const cacheKey = `insee-enterprises-${communeCode}-${active}`;

    return fetchWithCache(
        cacheKey,
        async () => {
            const token = await getINSEEAccessToken();

            // Build query filter
            const filters = [`codeCommuneEtablissement:${communeCode}`];
            if (active) {
                filters.push("etatAdministratifEtablissement:A");
            }

            const params = new URLSearchParams({
                q: filters.join(" AND "),
                nombre: "1000", // Max results per page
            });

            const url = `${INSEE_API_BASE}/siret?${params}`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`INSEE API error: ${response.status}`);
            }

            const data: INSEEResponse = await response.json();
            return data.etablissements || [];
        },
        24 * 60 * 60 * 1000, // Cache for 24 hours
    );
}

/**
 * APE (Activity Code) to sector mapping
 * Full list: https://www.insee.fr/fr/information/2406147
 */
const APE_SECTOR_MAP: Record<string, string> = {
    // Agriculture, forestry and fishing
    "01": "agriculture",
    "02": "agriculture",
    "03": "agriculture",

    // Manufacturing
    "10": "industry",
    "11": "industry",
    "12": "industry",
    "13": "industry",
    "14": "industry",
    "15": "industry",
    "16": "industry",
    "17": "industry",
    "18": "industry",
    "19": "industry",
    "20": "industry",
    "21": "industry",
    "22": "industry",
    "23": "industry",
    "24": "industry",
    "25": "industry",
    "26": "technology",
    "27": "technology",
    "28": "industry",
    "29": "industry",
    "30": "industry",
    "31": "industry",
    "32": "industry",
    "33": "services",

    // Construction
    "41": "construction",
    "42": "construction",
    "43": "construction",

    // Wholesale and retail trade
    "45": "commerce",
    "46": "commerce",
    "47": "commerce",

    // Transportation and storage
    "49": "services",
    "50": "services",
    "51": "services",
    "52": "services",
    "53": "services",

    // Accommodation and food service
    "55": "tourism",
    "56": "tourism",

    // Information and communication
    "58": "technology",
    "59": "technology",
    "60": "technology",
    "61": "technology",
    "62": "technology",
    "63": "technology",

    // Financial and insurance
    "64": "finance",
    "65": "finance",
    "66": "finance",

    // Real estate
    "68": "services",

    // Professional, scientific and technical
    "69": "services",
    "70": "services",
    "71": "services",
    "72": "technology",
    "73": "services",
    "74": "services",
    "75": "services",

    // Administrative and support service
    "77": "services",
    "78": "services",
    "79": "tourism",
    "80": "services",
    "81": "services",
    "82": "services",

    // Public administration
    "84": "public",

    // Education
    "85": "education",

    // Human health and social work
    "86": "health",
    "87": "health",
    "88": "health",

    // Arts, entertainment and recreation
    "90": "culture",
    "91": "culture",
    "92": "culture",
    "93": "culture",

    // Other service activities
    "94": "services",
    "95": "services",
    "96": "services",

    // Household activities
    "97": "services",
    "98": "services",
};

/**
 * Map APE code to sector
 * @param apeCode APE code (e.g., "62.01Z", "47.11F")
 */
export function mapAPEtoSector(apeCode: string): string {
    if (!apeCode) return "other";

    // Extract the 2-digit section code (first 2 digits before the dot)
    const sectionCode = apeCode.replace(".", "").substring(0, 2);

    return APE_SECTOR_MAP[sectionCode] || "other";
}

/**
 * Calculate sector statistics for establishments
 */
export function calculateSectorStats(
    establishments: INSEEEtablissement[],
): Record<string, number> {
    const sectorCounts: Record<string, number> = {};

    for (const establishment of establishments) {
        const apeCode =
            establishment.activitePrincipaleEtablissement ||
            establishment.activitePrincipaleUniteLegale ||
            "";

        const sector = mapAPEtoSector(apeCode);
        sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
    }

    return sectorCounts;
}

/**
 * Get employee count range midpoint
 */
export function getEmployeeCountMidpoint(tranche?: string): number {
    if (!tranche) return 0;

    const ranges: Record<string, number> = {
        NN: 0, // No employees
        "00": 0, // 0 employees
        "01": 1, // 1 or 2 employees
        "02": 2, // 3 to 5 employees
        "03": 4, // 6 to 9 employees
        "11": 13, // 10 to 19 employees
        "12": 35, // 20 to 49 employees
        "21": 75, // 50 to 99 employees
        "22": 150, // 100 to 199 employees
        "31": 300, // 200 to 249 employees
        "32": 375, // 250 to 499 employees
        "41": 750, // 500 to 999 employees
        "42": 1500, // 1000 to 1999 employees
        "51": 3500, // 2000 to 4999 employees
        "52": 7500, // 5000 to 9999 employees
        "53": 10000, // 10000+ employees
    };

    return ranges[tranche] || 0;
}

/**
 * Calculate total estimated employment in commune
 */
export function calculateTotalEmployment(
    establishments: INSEEEtablissement[],
): number {
    return establishments.reduce((total, establishment) => {
        const midpoint = getEmployeeCountMidpoint(
            establishment.trancheEffectifsEtablissement,
        );
        return total + midpoint;
    }, 0);
}
