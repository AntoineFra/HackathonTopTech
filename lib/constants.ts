// Constantes et configuration de l'application

export const APP_CONFIG = {
    name: "Portail des Données du Territoire 06",
    organization: "CCI Nice Côte d'Azur",
    territory: {
        name: "Alpes-Maritimes",
        code: "06",
        region: "Provence-Alpes-Côte d'Azur",
    },
    description:
        "Outil intelligent pour interroger les indicateurs socio-démographiques",
    version: "1.0.0",
} as const;

export const CATEGORIES = {
    DEMOGRAPHICS: "Démographie",
    ECONOMY: "Économie",
    TOURISM: "Tourisme",
    INFRASTRUCTURE: "Infrastructure",
    EDUCATION: "Éducation",
    HEALTH: "Santé",
    ENVIRONMENT: "Environnement",
} as const;

export const DATA_SOURCES = {
    INSEE: "Institut National de la Statistique et des Études Économiques",
    POLE_EMPLOI: "Pôle Emploi",
    CCI: "CCI Nice Côte d'Azur",
    REGION: "Région Provence-Alpes-Côte d'Azur",
} as const;

export const QUERY_EXAMPLES = [
    "Quelle est la population de Nice ?",
    "Afficher les statistiques d'emploi pour 2025",
    "Quels sont les principaux secteurs économiques du territoire 06 ?",
    "Indicateurs touristiques pour la Côte d'Azur",
    "Démographie des Alpes-Maritimes",
    "Afficher les données de création d'entreprises",
    "Quel est le taux de chômage ?",
    "Statistiques du logement pour la région",
] as const;

export const API_ENDPOINTS = {
    QUERY: "/api/query",
    INDICATORS: "/api/indicators",
    CATEGORIES: "/api/categories",
} as const;

// Configuration IA (à définir dans les variables d'environnement)
export const AI_CONFIG = {
    model: process.env.AI_MODEL || "gpt-4",
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: `Vous êtes un assistant IA pour la CCI Nice Côte d'Azur qui aide les utilisateurs à interroger les indicateurs socio-démographiques du territoire des Alpes-Maritimes (06).

Votre rôle est de :
- Répondre aux questions sur la population, l'économie, le tourisme, les infrastructures et autres indicateurs
- Fournir des informations claires et précises basées sur les données disponibles
- Expliquer lorsque les données sont indisponibles ou incertaines
- Formater les réponses de manière claire et professionnelle
- Toujours citer vos sources

Le territoire couvre : Nice, Cannes, Antibes, Grasse et toute la région Côte d'Azur.`,
} as const;
