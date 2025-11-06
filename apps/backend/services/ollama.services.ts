// ==================================
// Ollama AI Service pour le backend
// ==================================

import {
    executeQuery,
    parseAIGeneratedQuery,
} from "./query-executor.services.js";

import settingsService from "./settings.service.js";
import { prisma } from "../server.js";
import fs from "fs";
import path from "path";

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
    selected_codes?: string[];
    chart?: {
        type: "bar" | "line" | "pie" | "area" | "radar" | "radial" | "none";
        data: any[];
        title?: string;
        description?: string;
    };
    prismaQuery?: string; // La requête Prisma générée
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
 * Convertir les BigInt en nombres pour JSON.stringify
 */
function convertBigIntToNumber(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj === "bigint") {
        return Number(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => convertBigIntToNumber(item));
    }

    if (typeof obj === "object") {
        const newObj: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                newObj[key] = convertBigIntToNumber(obj[key]);
            }
        }
        return newObj;
    }

    return obj;
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
 * Répondre à une question avec Ollama
 */
export async function answerQuestionWithOllamaBetaNico(
    question: string,
    history: ChatMessage[] = [],
): Promise<AIServiceResponse> {
    try {
        // Lire le contenu du schema.prisma
        const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
        let schemaContent = "";
        try {
            schemaContent = fs.readFileSync(schemaPath, "utf-8");
        } catch (error) {
            console.warn(
                "[Ollama Service] Could not read schema.prisma:",
                error,
            );
            schemaContent = "Schema non disponible";
        }

        const messages = buildConversationPrompt(question, history);
        const prompt = `Donne moi SEULEMENT la requête SQL (et RIEN d'autres) pour obtenir la réponse de la dernière demande que user t'a fait. Base toi sur le schema.prisma ci-dessous.

SCHEMA PRISMA:
${schemaContent}

Example de réponse: "SELECT ...". Je ne veux pas de "SQL: \`\`\`sql" ou de texte additionnel, UNIQUEMENT la requête SQL brute!

Historique des prompts:
${formatPromptForOllama(messages)}`;
        console.log(
            `[Ollama Service] Prompt send with schema (${schemaContent.length} chars)`,
        );

        let ollamaResponse = await generateWithOllama(prompt);

        const MAX_RETRIES = 5; // Nombre maximum de tentatives
        let result: any = null;
        let lastError: Error | null = null;
        let attempt = 0;
        let currentSql = "";

        // Boucle de retry tant qu'il y a des erreurs (max 5 tentatives)
        while (attempt < MAX_RETRIES) {
            attempt++;

            try {
                currentSql = ollamaResponse.response.trim(); // la requête SQL générée

                // Nettoyage de la réponse au cas où l'IA ajoute des backticks ou du texte
                currentSql = currentSql
                    .replace(/^```sql\s*/i, "")
                    .replace(/^```\s*/i, "")
                    .replace(/\s*```$/i, "")
                    .replace(/^SQL:\s*/i, "")
                    .trim();

                console.log(
                    `[Ollama Service] Attempt ${attempt}/${MAX_RETRIES} - SQL:`,
                    currentSql,
                );

                // Exécution de la requête SQL - c'est ici que l'erreur peut être lancée
                result = await prisma.$queryRawUnsafe(currentSql);

                console.log(
                    `[Ollama Service] ✅ Success on attempt ${attempt}!`,
                );
                console.log(`[Ollama Service] Result:`, result);

                // Si on arrive ici, la requête a réussi, on sort de la boucle
                break;
            } catch (error) {
                lastError = error as Error;
                console.error(
                    `[Ollama Service] ❌ Attempt ${attempt}/${MAX_RETRIES} failed:`,
                    lastError.message,
                );

                // Si c'est la dernière tentative, on lance l'erreur
                if (attempt >= MAX_RETRIES) {
                    console.error(
                        `[Ollama Service] 🚫 Échec après ${MAX_RETRIES} tentatives.`,
                    );
                    throw new Error(
                        `Échec après ${MAX_RETRIES} tentatives. Dernière erreur SQL: ${lastError.message}\nDernière requête: ${currentSql}`,
                    );
                }

                // Sinon, on demande à l'IA de corriger la requête avec plus de contexte
                const errorPrompt = `ERREUR lors de l'exécution SQL (tentative ${attempt}/${MAX_RETRIES}):

Requête SQL qui a échoué:
${currentSql}

Message d'erreur:
${lastError.message}

SCHEMA PRISMA (pour référence):
${schemaContent}

INSTRUCTIONS:
- Il n'y a pas de colonnes population dans le schéma, la colone de population la plus récente est pop2022
- Analyse l'erreur et corrige la requête SQL
- Vérifie que les noms de tables et colonnes correspondent EXACTEMENT au schéma Prisma
- Rappel: réponds UNIQUEMENT avec la requête SQL corrigée, sans \`\`\`sql, sans texte explicatif
- Format attendu: SELECT ... FROM ... WHERE ...

Question originale de l'utilisateur: ${question}`;

                console.log(
                    `[Ollama Service] 🔄 Demande de correction à l'IA (tentative ${attempt + 1})...`,
                );

                // Génération d'une nouvelle requête SQL corrigée
                ollamaResponse = await generateWithOllama(errorPrompt);
            }
        }

        // Si on arrive ici sans result, c'est qu'il y a eu un problème
        if (!result) {
            throw new Error(
                "Aucun résultat obtenu après toutes les tentatives",
            );
        }

        // Convertir les BigInt en nombres avant de stringify (SQLite retourne des BigInt)
        const resultConverted = convertBigIntToNumber(result);
        console.log(`[Ollama Service] 🔄 Converted result:`, resultConverted);

        // Maintenant qu'on a un résultat valide, on génère la réponse finale en français
        const finalPrompt = `Voici le résultat de la requête SQL exécutée sur la base de données:

RÉSULTAT SQL:
${JSON.stringify(resultConverted, null, 2)}

QUESTION ORIGINALE DE L'UTILISATEUR:
"${question}"

INSTRUCTIONS:
- Fournis une réponse complète et détaillée en français à la question de l'utilisateur
- Base-toi uniquement sur les données du résultat SQL ci-dessus
- Utilise des données chiffrées quand c'est possible
- Structure ta réponse de manière claire (utilise des listes, des paragraphes, etc.)
- Si une information n'est pas disponible dans les résultats, indique-le clairement
- Sois précis et factuel`;

        console.log(
            `[Ollama Service] 📝 Génération de la réponse finale en français...`,
        );
        ollamaResponse = await generateWithOllama(finalPrompt);

        return {
            success: true,
            query: question,
            answer: ollamaResponse.response.trim(),
            confidence: 0.85,
            model: OLLAMA_MODEL,
            source: "ollama-local",
        };
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
            .replace(/\[LEGEND:(population|economy|tourism)\]/g, "")
            .replace(/\[CHART:(bar|line|pie|area|radar|radial|none)\]/g, "")
            .replace(/\[PRISMA_QUERY\][\s\S]*?\[\/PRISMA_QUERY\]/g, "")
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
