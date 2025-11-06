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
export async function aiAnswer(
    prompt: string,
    history?: ChatMessage[],
    provider?: "ollama" | "gemini",
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
    return apiFetch("/ai/answer", {
        method: "POST",
        body: JSON.stringify({
            question: prompt,
            history: history || [],
            provider: provider || "gemini",
        }),
    });
}
