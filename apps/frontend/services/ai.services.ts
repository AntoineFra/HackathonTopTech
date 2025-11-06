import { apiFetch } from "./api";

/**
 * ai.services.ts
 * Client wrapper for AI backend endpoints (Express).
 * Exposes:
 * - aiHealth(): GET /ai/health
 * - aiAnswer(prompt: string, history?: ChatMessage[]): POST /ai/answer (backend with Ollama)
 */

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export async function aiHealth() {
    return apiFetch("/ai/health", { method: "GET" });
}

/**
 * Call backend AI (Ollama or Gemini)
 * @param prompt - User question
 * @param history - Optional conversation history (last 10 messages recommended)
 * @param provider - AI provider to use ("ollama" | "gemini")
 * @returns AI response with answer, confidence, model info, optional legendType, and chart data
 */
/**
 * Call local AI (placeholder for future implementation)
 * @param prompt - User question
 * @param history - Optional conversation history
 * @returns AI response
 */
export async function aiAnswerLocal(
    prompt: string,
    history?: ChatMessage[],
): Promise<{
    success: boolean;
    query: string;
    answer: string;
    confidence?: number;
    model?: string;
    source?: string;
    error?: string;
    legendType?: "population" | "economy" | "tourism";
    chart?: {
        type: "bar" | "line" | "pie" | "area" | "radar" | "radial";
        data: any[];
        title?: string;
        description?: string;
    };
    prismaQuery?: string;
}> {
    // PLACEHOLDER - À implémenter
    // TODO: Définir la route backend pour l'IA locale
    // TODO: Définir le preprompt pour l'IA locale

    const PREPROMPT_LOCAL = ``; // À remplir

    // Pour le moment, retourner une erreur
    return {
        success: false,
        query: prompt,
        answer: "L'IA locale n'est pas encore configurée. Cette fonctionnalité sera disponible prochainement.",
        error: "Not implemented yet",
    };
}

export async function aiAnswer(
    prompt: string,
    history?: ChatMessage[],
    provider?: "ollama" | "gemini" | "local",
): Promise<{
    success: boolean;
    query: string;
    answer: string;
    confidence?: number;
    model?: string;
    source?: string;
    error?: string;
    legendType?: "population" | "economy" | "tourism";
    chart?: {
        type: "bar" | "line" | "pie" | "area" | "radar" | "radial";
        data: any[];
        title?: string;
        description?: string;
    };
    prismaQuery?: string;
}> {
    // Si provider est "local", utiliser la fonction dédiée
    if (provider === "local") {
        return aiAnswerLocal(prompt, history);
    }

    return apiFetch("/ai/answer", {
        method: "POST",
        body: JSON.stringify({
            question: prompt,
            history: history || [],
            provider: provider || "gemini",
        }),
    });
}
