// ==================================
// Ollama AI Service pour le backend
// ==================================

import {
    executeQuery,
    parseAIGeneratedQuery,
} from "./query-executor.services.js";

import settingsService from "./settings.service.js";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "mistral";
// Keep a fallback env-based default; actual timeout will be read from settings at call time
const FALLBACK_OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT || "30000");

export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

export interface OllamaGenerateRequest {
    model: string;
    prompt: string;
    stream: boolean;
    options?: {
        temperature?: number;
        top_p?: number;
        top_k?: number;
    };
}

export interface OllamaGenerateResponse {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
}

export interface AIServiceResponse {
    success: boolean;
    query: string;
    answer: string;
    confidence?: number;
    model?: string;
    source?: string;
    error?: string;
    legendType?: "population" | "economy" | "tourism"; // Type de légende à activer
    chart?: {
        type: "bar" | "line" | "pie";
        data: any[];
        title?: string;
        description?: string;
    };
    prismaQuery?: string; // La requête Prisma générée
}

// System prompt spécialisé PACA
const SYSTEM_PROMPT = `Tu es un assistant spécialisé dans les données territoriales de la région Provence-Alpes-Côte d'Azur (PACA), particulièrement du département des Alpes-Maritimes (06).

Ton rôle est de fournir des informations précises sur :
- Les statistiques démographiques (population, densité, évolution)
- Les données économiques (emploi, entreprises, secteurs d'activité)
- Les indicateurs touristiques (fréquentation, hébergements)
- Les infrastructures et services publics
- Les caractéristiques géographiques et urbaines

Principales villes du département 06 : Nice, Cannes, Antibes, Grasse, Cagnes-sur-Mer, Le Cannet, Saint-Laurent-du-Var, Menton, Vallauris.

Secteurs économiques clés :
- Tourisme (patrimoine, plages, événements)
- Technologies et innovation (Sophia Antipolis)
- Aéronautique et spatial
- Parfumerie (Grasse)
- Agriculture (fleurs, oliviers)

IMPORTANT : Tu as accès à une base de données Prisma avec les modèles suivants :
2. **PopulationHistory** (Historique population 1876-2022) :
model PopulationHistory {
  id              Int    @id @default(autoincrement())
  codeGeo         String // Code géographique (CODGEO)
  region          String // Région (REG)
  departement     String // Département (DEP)
  libelle         String // Libellé géographique (LIBGEO)

  // Population data from 2006 to 2022 (recent data)
  pop2022         Int?
  pop2021         Int?
  pop2020         Int?
  pop2019         Int?
  pop2018         Int?
  pop2017         Int?
  pop2016         Int?
  pop2015         Int?
  pop2014         Int?
  pop2013         Int?
  pop2012         Int?
  pop2011         Int?
  pop2010         Int?
  pop2009         Int?
  pop2008         Int?
  pop2007         Int?
  pop2006         Int?

  // Population data from 1954 to 1999 (intermediate historical data)
  pop1999         Int?
  pop1990         Int?
  pop1982         Int?
  pop1975         Int?
  pop1968         Int?
  pop1962         Int?
  pop1954         Int?

  // Population data from 1876 to 1936 (older historical data)
  pop1936         Int?
  pop1931         Int?
  pop1926         Int?
  pop1921         Int?
  pop1911         Int?
  pop1906         Int?
  pop1901         Int?
  pop1896         Int?
  pop1891         Int?
  pop1886         Int?
  pop1881         Int?
  pop1876         Int?

  @@unique([codeGeo])
}

// 3. **City** (Communes principales) :
model City {
  codeINSEE       String       @id
  name            String
  codeDepartement String
  siren           String
  codeEpci        String
  codeRegion      String
  population      Int
  surface         Float?       // Surface en hectares
  zone            String?      // "metro" ou autre
  postalCodes     PostalCode[]
  geoData         CityGeoData?
}

// Données géographiques des communes
model CityGeoData {
  id            Int     @id @default(autoincrement())
  cityCodeINSEE String  @unique
  city          City    @relation(fields: [cityCodeINSEE], references: [codeINSEE])

  // Centre (Point GeoJSON)
  centreLat     Float?
  centreLon     Float?

  // Mairie (Point GeoJSON)
  mairieLat     Float?
  mairieLon     Float?

  // Contour (Polygon GeoJSON) - stocké en JSON
  contour       String? // JSON stringifié

  // BBox (Polygon GeoJSON) - stocké en JSON
  bbox          String? // JSON stringifié
}

// Codes postaux associés aux communes
model PostalCode {
  id            Int    @id @default(autoincrement())
  code          String // ex: "06910"
  cityCodeINSEE String // référence vers City.codeINSEE
  city          City   @relation(fields: [cityCodeINSEE], references: [codeINSEE])
}

// 4. **LegalUnit** (Unités légales des entreprises) :
model LegalUnit {
  siren               String    @id
  diffusionStatus     String?
  purgedUnit          String?
  creationDate        DateTime?
  acronym             String?
  gender              String?
  firstName1          String?
  firstName2          String?
  firstName3          String?
  firstName4          String?
  usualFirstName      String?
  pseudonym           String?
  associationId       String?
  employeeRange       String?
  employeeYear        Int?
  lastProcessedDate   DateTime?
  numberOfPeriods     Int?
  companyCategory     String?
  companyCategoryYear Int?
  startDate           DateTime?
  administrativeState String?
  legalName           String?
  usageName           String?
  denomination        String?
  usualDenomination1  String?
  usualDenomination2  String?
  usualDenomination3  String?
  legalForm           String?
  mainActivity        String?
  mainActivityCode    String?
  headquarterNic      String?
  socialEconomy       String?
  missionCompany      String?
  employerStatus      String?
}

QUAND on te demande des données spécifiques, tu DOIS :
1. Générer une requête Prisma en lecture seule
2. Entourer la requête avec [PRISMA_QUERY] ... [/PRISMA_QUERY]
3. Décrire les données que tu vas récupérer

Opérations autorisées: findMany, findFirst, findUnique, count, aggregate, groupBy

Exemple de requête Prisma :
[PRISMA_QUERY]
prisma.populationHistory.findMany({
  "where": {"departement": "06"},
  "orderBy": {"pop2022": "desc"},
  "take": 5,
  "select": {"libelle": true, "pop2022": true, "pop1999": true}
})
[/PRISMA_QUERY]

Si les données doivent être affichées en graphique, ajoute aussi :
[CHART:bar] pour un graphique en barres
[CHART:line] pour un graphique en ligne
[CHART:pie] pour un diagramme circulaire

Si la question concerne la démographie/population, termine par [LEGEND:population]
Si la question concerne l'économie/entreprises, termine par [LEGEND:economy]
Si la question concerne le tourisme, termine par [LEGEND:tourism]

Réponds toujours en français, de manière structurée. Si tu génères une requête Prisma, explique ce qu'elle fait.`;

/**
 * Construire le prompt de conversation avec historique
 */
export function buildConversationPrompt(
    question: string,
    history: ChatMessage[] = [],
): ChatMessage[] {
    const messages: ChatMessage[] = [
        {
            role: "system",
            content: SYSTEM_PROMPT,
        },
    ];

    // Ajouter l'historique (limité aux 10 derniers messages)
    const recentHistory = history.slice(-10);
    messages.push(...recentHistory);

    // Ajouter la question actuelle
    messages.push({
        role: "user",
        content: question,
    });

    return messages;
}

/**
 * Formater les messages pour l'API Ollama
 */
export function formatPromptForOllama(messages: ChatMessage[]): string {
    return messages
        .map((msg) => {
            if (msg.role === "system") {
                return `System: ${msg.content}`;
            } else if (msg.role === "user") {
                return `User: ${msg.content}`;
            } else {
                return `Assistant: ${msg.content}`;
            }
        })
        .join("\n\n");
}

/**
 * Appeler Ollama pour générer une réponse
 */
export async function generateWithOllama(
    prompt: string,
): Promise<OllamaGenerateResponse> {
    const request: OllamaGenerateRequest = {
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: {
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40,
        },
    };

    console.log(`[Ollama Service] Calling Ollama with model: ${OLLAMA_MODEL}`);
    console.log(`[Ollama Service] URL: ${OLLAMA_BASE_URL}/api/generate`);
    console.log(`[Ollama Service] Prompt length: ${prompt.length} chars`);

    const controller = new AbortController();
    // Read dynamic timeout from settings; fallback to env-based default
    let timeoutMs = FALLBACK_OLLAMA_TIMEOUT;
    try {
        const s = await settingsService.getAITimeout();
        if (typeof s === "number" && Number.isFinite(s) && s > 0) {
            timeoutMs = s;
        }
    } catch (e) {
        // ignore and use fallback
    }

    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorDetails = "";
            try {
                const errorBody = await response.text();
                errorDetails = errorBody ? `: ${errorBody}` : "";
            } catch {
                // Ignore if can't read body
            }
            throw new Error(
                `Ollama API error: ${response.status} ${response.statusText}${errorDetails}`,
            );
        }

        const data: OllamaGenerateResponse = await response.json();
        console.log(
            `[Ollama Service] Response received (${data.response.length} chars)`,
        );

        return data;
    } catch (error: unknown) {
        clearTimeout(timeoutId);

        const err = error as Error & { name?: string };

        if (err.name === "AbortError") {
            throw new Error(
                "Timeout: La requête a pris trop de temps. Essayez un modèle plus rapide.",
            );
        }

        if (err.message?.includes("ECONNREFUSED")) {
            throw new Error(
                "Ollama n'est pas démarré. Lancez 'ollama serve' ou démarrez le conteneur Docker.",
            );
        }

        throw error;
    }
}

/**
 * Extraire le type de légende depuis la réponse de l'IA
 */
function extractLegendType(response: string): "population" | "economy" | "tourism" | undefined {
    const match = response.match(/\[LEGEND:(population|economy|tourism)\]/);
    return match ? (match[1] as "population" | "economy" | "tourism") : undefined;
}

/**
 * Extraire le type de graphique depuis la réponse de l'IA
 */
function extractChartType(response: string): "bar" | "line" | "pie" | undefined {
    const match = response.match(/\[CHART:(bar|line|pie)\]/);
    return match ? (match[1] as "bar" | "line" | "pie") : undefined;
}

/**
 * Extraire une requête Prisma depuis la réponse de l'IA
 */
function extractPrismaQuery(response: string): string | undefined {
    const match = response.match(/\[PRISMA_QUERY\]([\s\S]*?)\[\/PRISMA_QUERY\]/);
    return match?.[1]?.trim();
}

/**
 * Répondre à une question avec Ollama
 */
export async function answerQuestionWithOllama(
    question: string,
    history: ChatMessage[] = [],
): Promise<AIServiceResponse> {
    try {
        const messages = buildConversationPrompt(question, history);
        const prompt = formatPromptForOllama(messages);

        const ollamaResponse = await generateWithOllama(prompt);

        // Extraire les métadonnées de la réponse
        const legendType = extractLegendType(ollamaResponse.response);
        const chartType = extractChartType(ollamaResponse.response);
        const prismaQueryText = extractPrismaQuery(ollamaResponse.response);

        // Nettoyer la réponse
        let cleanAnswer = ollamaResponse.response
            .replace(/\[LEGEND:(population|economy|tourism)\]/g, '')
            .replace(/\[CHART:(bar|line|pie)\]/g, '')
            .replace(/\[PRISMA_QUERY\][\s\S]*?\[\/PRISMA_QUERY\]/g, '')
            .trim();

        const response: AIServiceResponse = {
            success: true,
            query: question,
            answer: cleanAnswer,
            confidence: 0.85,
            model: OLLAMA_MODEL,
            source: "ollama-local",
        };

        if (legendType) {
            response.legendType = legendType;
        }

        // Si une requête Prisma a été générée, l'exécuter
        if (prismaQueryText) {
            console.log("🔍 Requête Prisma détectée:", prismaQueryText);

            const parsedQuery = parseAIGeneratedQuery(prismaQueryText);

            if (parsedQuery) {
                const queryResult = await executeQuery(parsedQuery);

                if (queryResult.success && queryResult.data) {
                    console.log(`✅ Données récupérées: ${Array.isArray(queryResult.data) ? queryResult.data.length : 1} résultat(s)`);

                    // Si un graphique est demandé, formater les données
                    if (chartType && Array.isArray(queryResult.data)) {
                        response.chart = {
                            type: chartType,
                            data: queryResult.data,
                            title: `Données ${legendType || 'générales'}`,
                            description: cleanAnswer,
                        };
                    }

                    if (queryResult.executedQuery) {
                        response.prismaQuery = queryResult.executedQuery;
                    }

                    // Enrichir la réponse avec les données
                    if (Array.isArray(queryResult.data) && queryResult.data.length > 0) {
                        const dataPreview = queryResult.data.slice(0, 5);
                        cleanAnswer += `\n\n📊 Données récupérées (${queryResult.data.length} résultat(s)) :\n`;
                        cleanAnswer += JSON.stringify(dataPreview, null, 2);
                        if (queryResult.data.length > 5) {
                            cleanAnswer += `\n... et ${queryResult.data.length - 5} autres résultats.`;
                        }
                    }

                    response.answer = cleanAnswer;
                } else {
                    console.error("❌ Erreur d'exécution:", queryResult.error);
                    cleanAnswer += `\n\n⚠️ Erreur lors de l'exécution de la requête: ${queryResult.error}`;
                    response.answer = cleanAnswer;
                }
            } else {
                console.warn("⚠️ Impossible de parser la requête Prisma");
            }
        }

        return response;
    } catch (error: unknown) {
        const err = error as Error;
        console.error("[Ollama Service] Error:", err);

        return {
            success: false,
            query: question,
            answer: "",
            error: err.message || "Une erreur s'est produite",
        };
    }
}

/**
 * Vérifier la santé d'Ollama
 */
export async function checkOllamaHealth(): Promise<{
    status: string;
    ollama_url?: string;
    model?: string;
    available_models?: string[];
    message?: string;
    error?: string;
}> {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
            signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
            throw new Error("Ollama not responding");
        }

        const data = await response.json();
        const models = data.models || [];

        return {
            status: "healthy",
            ollama_url: OLLAMA_BASE_URL,
            model: OLLAMA_MODEL,
            available_models: models.map((m: { name: string }) => m.name),
            message: "AI locale opérationnelle",
        };
    } catch (error: unknown) {
        const err = error as Error;
        return {
            status: "error",
            error: err.message,
            message:
                "Ollama n'est pas accessible. Assurez-vous qu'il est démarré.",
        };
    }
}
