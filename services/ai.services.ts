import { apiFetch } from "./api";

/**
 * ai.services.ts
 * Client wrapper for AI backend endpoints.
 * Exposes:
 * - aiHealth(): GET /ai/health
 * - aiAnswer(prompt: string): POST /ai/anwser
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
