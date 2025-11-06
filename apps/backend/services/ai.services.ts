import { prisma } from "../server.js";
import type {
    City as PrismaCity,
    PostalCode,
} from "../generated/prisma/client.js";
import {
    answerQuestionWithOllama,
    checkOllamaHealth as checkOllamaHealthService,
    type ChatMessage as OllamaMessage,
} from "./ollama.services.js";
import {
    answerQuestionWithGemini,
    type ChatMessage as GeminiMessage,
} from "./gemini.services.js";

export type ChatMessage = OllamaMessage;

const DEFAULT_AI_PROVIDER = (process.env.DEFAULT_AI_PROVIDER || "ollama") as
    | "ollama"
    | "gemini";

export interface ParsedQuestion {
    text: string;
    keywords: CityKeyword[];
    unmatchedTerms: string[]; // pour debug/analyse
}

export interface CityKeyword {
    raw: string; // "antibe"
    normalized: string; // "antibes"
    type: "name" | "postal" | "departement" | "insee" | "epci";
    matched?: {
        // après matching DB
        codeINSEE: string;
        name: string;
        codeDepartement: string;
        postalCodes: string[];
        confidence: "high" | "medium" | "low"; // pour fuzzy matching
    };
}

export async function clearQuestion(question: string): Promise<ParsedQuestion> {
    const words = question
        .toLowerCase()
        .replace(/[.,!?;:]/g, " ")
        .split(/\s+/)
        .filter(Boolean);

    const candidates: CityKeyword[] = [];
    const unmatchedTerms: string[] = [];

    for (const word of words) {
        const cityKW = extractCityKeyword(word);
        if (cityKW) {
            candidates.push(cityKW);
        } else if (word.length > 2) {
            // évite "je", "de", etc.
            unmatchedTerms.push(word);
        }
    }

    // Matcher avec la DB
    const keywords = await matchCityKeywords(candidates);

    return {
        text: question,
        keywords: keywords.filter((kw) => kw.matched), // garde seulement les matchés
        unmatchedTerms,
    };
}

async function matchCityKeywords(
    candidates: CityKeyword[],
): Promise<CityKeyword[]> {
    const results: CityKeyword[] = [];

    for (const candidate of candidates) {
        let matched = null;

        switch (candidate.type) {
            case "postal":
                matched = await prisma.city.findFirst({
                    where: {
                        postalCodes: {
                            some: { code: candidate.raw },
                        },
                    },
                    include: { postalCodes: true },
                });
                break;

            case "insee":
                matched = await prisma.city.findUnique({
                    where: { codeINSEE: candidate.raw },
                    include: { postalCodes: true },
                });
                break;

            case "departement":
                // Cas spécial : peut retourner plusieurs villes
                // Tu pourrais stocker ça différemment
                matched = await prisma.city.findFirst({
                    where: { codeDepartement: candidate.raw.padStart(2, "0") },
                    include: { postalCodes: true },
                });
                break;

            case "epci":
                matched = await prisma.city.findFirst({
                    where: { codeEpci: candidate.raw },
                    include: { postalCodes: true },
                });
                break;

            case "name":
                // Fuzzy matching pour les noms
                matched = await fuzzyMatchCityName(candidate.normalized);
                break;
        }

        if (matched) {
            results.push({
                ...candidate,
                matched: {
                    codeINSEE: matched.codeINSEE,
                    name: matched.name,
                    codeDepartement: matched.codeDepartement,
                    postalCodes: matched.postalCodes.map((pc: any) => pc.code),
                    confidence: calculateConfidence(candidate, matched),
                },
            });
        }
    }

    return results;
}

async function fuzzyMatchCityName(
    normalized: string,
): Promise<(PrismaCity & { postalCodes: PostalCode[] }) | null> {
    // Recherche avec startsWith pour limiter les résultats
    const candidates = await prisma.city.findMany({
        where: {
            name: {
                startsWith:
                    normalized.substring(0, 1).toUpperCase() +
                    normalized.substring(1),
            },
        },
        include: { postalCodes: true },
        take: 50, // limite pour la performance
    });

    // Match exact (insensible à la casse)
    const exact = candidates.find(
        (city) => normalizeString(city.name) === normalized,
    );
    if (exact) return exact;

    // Fuzzy match
    const fuzzy = candidates.find((city) =>
        normalizeString(city.name).startsWith(normalized),
    );

    return fuzzy || null;
}

function calculateConfidence(
    candidate: CityKeyword,
    matched: any,
): "high" | "medium" | "low" {
    if (candidate.type === "insee" || candidate.type === "postal") {
        return "high"; // codes = match exact
    }

    if (candidate.type === "name") {
        const normalizedMatch = normalizeString(matched.name);
        if (normalizedMatch === candidate.normalized) return "high";
        if (normalizedMatch.startsWith(candidate.normalized)) return "medium";
        return "low";
    }

    return "medium";
}

function extractCityKeyword(word: string): CityKeyword | null {
    const numeric = /^\d+$/;

    if (numeric.test(word)) {
        if (word.length === 5) {
            // Peut être INSEE ou postal
            return { raw: word, normalized: word, type: "postal" };
        }
        if (word.length === 2) {
            return {
                raw: word,
                normalized: word.padStart(2, "0"),
                type: "departement",
            };
        }
        if (word.length === 9) {
            return { raw: word, normalized: word, type: "epci" };
        }
    }

    // Noms de ville (au moins 3 lettres, lettres + tirets)
    if (/^[a-zàâçéèêëîïôûùüÿñæœ-]{3,}$/i.test(word)) {
        const normalized = normalizeString(word);
        return { raw: word, normalized, type: "name" };
    }

    return null;
}

function normalizeString(input: string): string {
    return input
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/-/g, "")
        .trim()
        .toLowerCase();
}

// -------------------------------- For AI communication ---------------------------- //

export function buildAIPrompt(parsed: ParsedQuestion): string {
    // Construct the AI prompt based on the parsed question
    return `Question: ${parsed.text}`;
}

export interface AIResponse {
    responseText: string;
    confidence: number; // 0 to 1
    graphs?: "bar" | "line";
    sql_query?: string[];
}

export async function getAIResponse(prompt: string) {
    try {
        // replace URL with actual AI service endpoint
        const response = await fetch("https://api.example.com/ai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            throw new Error(`AI API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data as AIResponse;
    } catch (error) {
        console.error("Error fetching AI response:", error);
        throw error;
    }
}

// Centralise la logique métier pour répondre à une question (utilisée par le handler Express)
export async function answerQuestion(
    question: string,
    history: ChatMessage[] = [],
    provider: "ollama" | "gemini" = DEFAULT_AI_PROVIDER,
) {
    if (!question) throw new Error("Question is required");

    console.log(`[AI Service] Using provider: ${provider}`);

    // Convertir l'historique pour Gemini si nécessaire (filtrer les messages system)
    const geminiHistory = history
        .filter((msg) => msg.role !== "system")
        .map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
        }));

    // Utiliser le provider sélectionné
    const response =
        provider === "gemini"
            ? await answerQuestionWithGemini(question, geminiHistory)
            : await answerQuestionWithOllama(question, history);

    if (!response.success) {
        throw new Error(
            response.error || "Erreur lors de la génération de la réponse",
        );
    }

    return {
        success: response.success,
        query: response.query,
        answer: response.answer,
        confidence: response.confidence || 0.85,
        model: response.model,
        source: response.source,
        legendType: response.legendType,
        chart: response.chart,
        prismaQuery: response.prismaQuery,
    };
}

// Health check pour Ollama
export async function checkOllamaHealth() {
    return await checkOllamaHealthService();
}
