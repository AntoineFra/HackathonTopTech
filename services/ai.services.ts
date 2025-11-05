import { apiFetch } from "./api";
import type { ChatMessage } from "@/lib/ai-prompts";

/**
 * ai.services.ts
 * Client wrapper for AI backend endpoints.
 * Exposes:
 * - aiHealth(): GET /ai/health
 * - aiAnswer(prompt: string): POST /ai/answer (external backend)
 * - aiAnswerLocal(prompt: string, history?: ChatMessage[]): POST /api/ai-local (local Ollama)
 * - aiLocalHealth(): GET /api/ai-local (health check)
 */

export async function aiHealth() {
    return apiFetch("/ai/health", { method: "GET" });
}

export async function aiAnswer(prompt: string) {
    return apiFetch("/ai/answer", {
        method: "POST",
        body: JSON.stringify({ question: prompt }),
    });
}

/**
 * Call local Ollama AI
 * @param prompt - User question
 * @param history - Optional conversation history (last 10 messages recommended)
 * @returns AI response with answer, confidence, model info
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
}> {
    try {
        const response = await fetch("/api/ai-local", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                question: prompt,
                history: history || [],
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "AI locale error");
        }

        return data;
    } catch (error) {
        console.error("[AI Service] Local AI error:", error);
        throw error;
    }
}

/**
 * Check if local Ollama AI is healthy and available
 */
export async function aiLocalHealth(): Promise<{
    status: string;
    ollama_url: string;
    model: string;
    available_models: string[];
    message: string;
}> {
    try {
        const response = await fetch("/api/ai-local", {
            method: "GET",
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("[AI Service] Health check failed:", error);
        throw error;
    }
}
