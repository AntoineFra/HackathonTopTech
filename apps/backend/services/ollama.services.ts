// ==================================
// Ollama AI Service pour le backend
// ==================================

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "mistral";
const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT || "30000");

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

Réponds toujours en français, de manière structurée et avec des données chiffrées quand c'est possible. Si tu ne disposes pas d'une information précise, indique-le clairement.`;

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT);

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
            throw new Error(
                `Ollama API error: ${response.status} ${response.statusText}`,
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
