// ==================================
// Gemini AI Service pour le backend
// ==================================

import {
    executeQuery,
    parseAIGeneratedQuery,
} from "./query-executor.services.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

export interface ChatMessage {
    role: "user" | "model";
    parts: { text: string }[];
}

export interface GeminiRequest {
    contents: ChatMessage[];
    generationConfig?: {
        temperature?: number;
        topK?: number;
        topP?: number;
        maxOutputTokens?: number;
    };
}

export interface GeminiResponse {
    candidates: Array<{
        content: {
            parts: Array<{ text: string }>;
            role: string;
        };
        finishReason: string;
    }>;
}

export interface AIServiceResponse {
    success: boolean;
    query: string;
    answer: string;
    confidence?: number;
    model?: string;
    source?: string;
    error?: string;
    legendType?: "population" | "economy" | "tourism";
    chart?: {
        type: "bar" | "line" | "pie" | "area" | "radar" | "radial" | "none";
        data: any[];
        title?: string;
        description?: string;
    };
    prismaQuery?: string;
    selected_codes?: string[];
}

// System prompt spécialisé PACA
const SYSTEM_PROMPT = `Tu es un assistant spécialisé dans les données territoriales de la région Provence-Alpes-Côte d'Azur (PACA), particulièrement du département des Alpes-Maritimes (06).

RÈGLE ABSOLUE : Pour TOUTE question sur des données chiffrées (population, évolution, comparaison), tu DOIS :
1. Générer une requête Prisma entre [PRISMA_QUERY] et [/PRISMA_QUERY]
2. Ajouter le type de graphique avec [CHART:type] où type peut être :
   - **bar** : pour comparer des valeurs entre plusieurs villes
   - **line** : pour montrer l'évolution temporelle d'une ville
   - **area** : pour montrer l'évolution avec surface remplie (tendances longues)
   - **pie** : pour montrer la répartition/proportion entre villes
   - **radar** : pour comparer plusieurs indicateurs pour une ou plusieurs villes
   - **radial** : pour montrer la progression circulaire d'un indicateur
3. Ajouter la légende avec [LEGEND:population], [LEGEND:economy] ou [LEGEND:tourism]

Base de données Prisma disponible :

**PopulationHistory** (utilise CE modèle pour toutes les évolutions de population) :
- libelle (String) : nom de la ville
- departement (String) : code département
- **Années disponibles UNIQUEMENT** :
  * 2006-2022 : pop2022, pop2021, pop2020, pop2019, pop2018, pop2017, pop2016, pop2015, pop2014, pop2013, pop2012, pop2011, pop2010, pop2009, pop2008, pop2007, pop2006
  * 1954-1999 : pop1999, pop1990, pop1982, pop1975, pop1968, pop1962, pop1954
  * 1876-1936 : pop1936, pop1931, pop1926, pop1921, pop1911, pop1906, pop1901, pop1896, pop1891, pop1886, pop1881, pop1876
- ⚠️ **INTERDICTION** d'utiliser pop2001, pop2005, pop1995, pop1985 ou toute autre année NON LISTÉE !

model City {
  codeINSEE       String       @id
  name            String
  codeDepartement String       // ⚠️ Utilise "codeDepartement" PAS "departement"
  siren           String
  codeEpci        String
  codeRegion      String
  population      Int          // Population actuelle (dernière année)
  surface         Float?       // Surface en hectares
  zone            String?      // "metro" ou autre
  postalCodes     PostalCode[]
  geoData         CityGeoData?
}

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

model PostalCode {
  id            Int    @id @default(autoincrement())
  code          String // ex: "06910"
  cityCodeINSEE String // référence vers City.codeINSEE
  city          City   @relation(fields: [cityCodeINSEE], references: [codeINSEE])
}


EXEMPLES OBLIGATOIRES À SUIVRE :

Question : "Quelle est la population de Nice ?"
Réponse :
[PRISMA_QUERY]
prisma.city.findFirst({
  "where": {"name": "Nice", "codeDepartement": "06"},
  "select": {"name": true, "population": true}
})
[/PRISMA_QUERY]
[CHART:none]
[LEGEND:population]

La population de [name] est de [population] habitants.

---

Question : "Évolution de la population de Grasse depuis 2000"
Réponse :
[PRISMA_QUERY]
prisma.populationHistory.findFirst({
  "where": {"libelle": "Grasse"},
  "select": {
    "libelle": true,
    "pop2022": true,
    "pop2020": true,
    "pop2015": true,
    "pop2010": true,
    "pop2006": true
  }
})
[/PRISMA_QUERY]
[CHART:line]
[LEGEND:population]

Voici l'évolution de la population de Grasse depuis 2006 (année la plus proche de 2000).

---

Question : "Compare les 5 plus grandes villes du 06"
Réponse :
[PRISMA_QUERY]
prisma.populationHistory.findMany({
  "where": {"departement": "06"},
  "orderBy": {"pop2022": "desc"},
  "take": 5,
  "select": {
    "libelle": true,
    "pop2022": true
  }
})
[/PRISMA_QUERY]
[CHART:bar]
[LEGEND:population]

Voici les 5 plus grandes villes des Alpes-Maritimes.

---

IMPORTANT :
- TOUJOURS utiliser du JSON strict (pas de JavaScript)
- TOUJOURS mettre les balises [PRISMA_QUERY], [CHART:xxx], [LEGEND:xxx]
- Pour une population actuelle/récente : utilise City.population
- Pour une évolution temporelle : utilise PopulationHistory avec les champs pop2022, pop2020, etc.
- Pour les évolutions temporelles : utilise [CHART:line] ou [CHART:area]
- Pour les comparaisons entre villes : utilise [CHART:bar]
- Pour les répartitions/proportions : utilise [CHART:pie]
- Pour comparer plusieurs indicateurs : utilise [CHART:radar]
- Pour une valeur unique sans graphique : utilise [CHART:none]
- ⚠️ Avec [CHART:none], utilise des placeholders [population], [name], etc. qui seront remplacés automatiquement
- ⚠️ Dans City, utilise "codeDepartement" (PAS "departement")
- ⚠️ Dans PopulationHistory, utilise "departement" (PAS "codeDepartement")
- N'utilise QUE les années listées ci-dessus (pas de pop2001, pop2005, etc.)

Réponds en français de manière concise.`;

/**
 * Extraire le type de légende depuis la réponse de l'IA
 */
function extractLegendType(
    response: string,
): "population" | "economy" | "tourism" | undefined {
    const match = response.match(/\[LEGEND:(population|economy|tourism)\]/);
    return match
        ? (match[1] as "population" | "economy" | "tourism")
        : undefined;
}

/**
 * Extraire le type de graphique depuis la réponse de l'IA
 */
function extractChartType(
    response: string,
): "bar" | "line" | "pie" | "area" | "radar" | "radial" | "none" | undefined {
    const match = response.match(/\[CHART:(bar|line|pie|area|radar|radial|none)\]/);
    return match
        ? (match[1] as "bar" | "line" | "pie" | "area" | "radar" | "radial" | "none")
        : undefined;
}

/**
 * Extraire une requête Prisma depuis la réponse de l'IA
 */
function extractPrismaQuery(response: string): string | undefined {
    const match = response.match(
        /\[PRISMA_QUERY\]([\s\S]*?)\[\/PRISMA_QUERY\]/,
    );
    return match?.[1]?.trim();
}

/**
 * Convertir l'historique au format Gemini
 */
function convertHistoryToGemini(
    history: Array<{ role: "user" | "assistant"; content: string }>,
): ChatMessage[] {
    return history.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
    }));
}

/**
 * Appeler Gemini pour générer une réponse
 */
async function generateWithGemini(
    question: string,
    history: Array<{ role: "user" | "assistant"; content: string }> = [],
): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY n'est pas configurée");
    }

    const contents: ChatMessage[] = [
        // System prompt en tant que premier message user
        {
            role: "user",
            parts: [{ text: SYSTEM_PROMPT }],
        },
        {
            role: "model",
            parts: [
                {
                    text: "Je comprends. Je suis prêt à répondre aux questions sur les données PACA en générant des requêtes Prisma au format JSON strict.",
                },
            ],
        },
        // Historique converti
        ...convertHistoryToGemini(history),
        // Question actuelle
        {
            role: "user",
            parts: [{ text: question }],
        },
    ];

    const request: GeminiRequest = {
        contents,
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
        },
    };

    console.log(`[Gemini Service] Calling Gemini API...`);

    try {
        const response = await fetch(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(request),
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Gemini API error: ${response.status} - ${errorText}`,
            );
        }

        const data: GeminiResponse = await response.json();

        if (
            !data.candidates ||
            data.candidates.length === 0 ||
            !data.candidates[0]?.content?.parts?.[0]?.text
        ) {
            throw new Error("Aucune réponse de Gemini");
        }

        const answer = data.candidates[0].content.parts[0].text;
        console.log(
            `[Gemini Service] Response received (${answer.length} chars)`,
        );
        console.log("========== GEMINI RAW RESPONSE ==========");
        console.log(answer);
        console.log("=========================================");

        return answer;
    } catch (error: unknown) {
        const err = error as Error;
        console.error("[Gemini Service] Error:", err);
        throw err;
    }
}

/**
 * Répondre à une question avec Gemini
 */
export async function answerQuestionWithGemini(
    question: string,
    history: Array<{ role: "user" | "assistant"; content: string }> = [],
): Promise<AIServiceResponse> {
    try {
        const geminiResponse = await generateWithGemini(question, history);

        // Extraire les métadonnées de la réponse
        const legendType = extractLegendType(geminiResponse);
        const chartType = extractChartType(geminiResponse);
        const prismaQueryText = extractPrismaQuery(geminiResponse);

        // Nettoyer la réponse
        let cleanAnswer = geminiResponse
            .replace(/\[LEGEND:(population|economy|tourism)\]/g, "")
            .replace(/\[CHART:(bar|line|pie|area|radar|radial|none)\]/g, "")
            .replace(/\[PRISMA_QUERY\][\s\S]*?\[\/PRISMA_QUERY\]/g, "")
            .trim();

        const response: AIServiceResponse = {
            success: true,
            query: question,
            answer: cleanAnswer,
            confidence: 0.9,
            model: "gemini-2.0-flash-exp",
            source: "gemini-api",
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
                    console.log(`✅ Query executed successfully`);

                    // Normaliser les données en array pour le chart
                    let chartDataArray: any[] = [];
                    if (Array.isArray(queryResult.data)) {
                        chartDataArray = queryResult.data;
                    } else if (queryResult.data) {
                        // Si c'est un objet unique (findFirst) avec des champs popXXXX
                        // Le transformer en array [{année: XXXX, population: value}, ...]
                        const dataObj = queryResult.data as any;
                        const popFields = Object.keys(dataObj).filter((key) =>
                            key.startsWith("pop"),
                        );

                        if (popFields.length > 0) {
                            // Transformation pour évolution temporelle
                            chartDataArray = popFields
                                .map((field) => ({
                                    année: field.replace("pop", ""),
                                    population: dataObj[field],
                                    ville: dataObj.libelle || dataObj.name,
                                }))
                                .filter((item) => item.population != null)
                                .sort((a, b) => a.année.localeCompare(b.année));
                        } else {
                            // Sinon, juste mettre l'objet en array
                            chartDataArray = [dataObj];
                        }
                    }

                    // Si un graphique est demandé et qu'on a des données
                    if (chartType && chartType !== "none" && chartDataArray.length > 0) {
                        console.log(
                            `📊 Création du chart avec ${chartDataArray.length} résultat(s)`,
                        );
                        response.chart = {
                            type: chartType,
                            data: chartDataArray,
                            title: `Données ${legendType || "générales"}`,
                            description: cleanAnswer,
                        };
                    }

                    if (queryResult.executedQuery) {
                        response.prismaQuery = queryResult.executedQuery;
                    }

                    // Si chartType est "none", enrichir la réponse avec les données
                    if (chartType === "none" && chartDataArray.length > 0) {
                        const firstResult = chartDataArray[0];
                        // Remplacer les placeholders dans la réponse
                        if (firstResult.population) {
                            cleanAnswer = cleanAnswer.replace(/\[population\]/gi, firstResult.population.toLocaleString("fr-FR"));
                        }
                        if (firstResult.name) {
                            cleanAnswer = cleanAnswer.replace(/\[name\]/gi, firstResult.name);
                        }
                    }

                    /*    // Ne pas afficher les données brutes, juste confirmer qu'un graphique est disponible
                    if (chartDataArray.length > 0 && chartType) {
                        cleanAnswer += `\n\n📊 Graphique généré avec ${chartDataArray.length} point${chartDataArray.length > 1 ? 's' : ''} de données.`;
                    } */
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
        console.error("[Gemini Service] Error:", err);

        return {
            success: false,
            query: question,
            answer: "",
            error: err.message || "Une erreur s'est produite",
        };
    }
}
