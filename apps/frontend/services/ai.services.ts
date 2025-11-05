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
 * Call backend AI (Ollama)
 * @param prompt - User question
 * @param history - Optional conversation history (last 10 messages recommended)
 * @returns AI response with answer, confidence, model info
 */
export async function aiAnswer(
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
}> {
    return apiFetch("/ai/answer", {
        method: "POST",
        body: JSON.stringify({
            question: prompt,
            history: history || [],
        }),
    });
}
