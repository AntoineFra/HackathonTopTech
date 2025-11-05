import { NextRequest, NextResponse } from "next/server";
import {
    buildConversationPrompt,
    formatPromptForOllama,
    type ChatMessage,
} from "@/lib/ai-prompts";

const OLLAMA_BASE_URL =
    process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "mistral";
const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT || "30000");

interface OllamaGenerateRequest {
    model: string;
    prompt: string;
    stream: boolean;
    options?: {
        temperature?: number;
        top_p?: number;
        top_k?: number;
    };
}

interface OllamaGenerateResponse {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { question, history = [] } = body;

        if (!question || typeof question !== "string") {
            return NextResponse.json(
                { error: "Question is required" },
                { status: 400 },
            );
        }

        // Build conversation context
        const conversationHistory: ChatMessage[] = history.map(
            (msg: { role: string; content: string }) => ({
                role: msg.role,
                content: msg.content,
            }),
        );

        const messages = buildConversationPrompt(
            question,
            conversationHistory,
        );
        const prompt = formatPromptForOllama(messages);

        // Call Ollama API
        const ollamaRequest: OllamaGenerateRequest = {
            model: OLLAMA_MODEL,
            prompt: prompt,
            stream: false,
            options: {
                temperature: 0.7,
                top_p: 0.9,
                top_k: 40,
            },
        };

        console.log(`[AI Local] Calling Ollama with model: ${OLLAMA_MODEL}`);
        console.log(`[AI Local] Question: ${question}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT);

        const response = await fetch(
            `${OLLAMA_BASE_URL}/api/generate`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(ollamaRequest),
                signal: controller.signal,
            },
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(
                `Ollama API error: ${response.status} ${response.statusText}`,
            );
        }

        const data: OllamaGenerateResponse = await response.json();

        console.log(`[AI Local] Response received (${data.response.length} chars)`);

        return NextResponse.json({
            success: true,
            query: question,
            answer: data.response.trim(),
            confidence: 0.85,
            model: OLLAMA_MODEL,
            source: "local-ai",
        });
    } catch (error: unknown) {
        console.error("[AI Local] Error:", error);
        const err = error as Error & { name?: string };

        // Handle specific errors
        if (err.name === "AbortError") {
            return NextResponse.json(
                {
                    success: false,
                    error: "Timeout: La requête a pris trop de temps. Essayez un modèle plus rapide.",
                },
                { status: 504 },
            );
        }

        if (err.message?.includes("ECONNREFUSED")) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Ollama n'est pas démarré. Lancez 'ollama serve' dans un terminal.",
                    instructions:
                        "Installation: curl -fsSL https://ollama.com/install.sh | sh",
                },
                { status: 503 },
            );
        }

        return NextResponse.json(
            {
                success: false,
                error:
                    err.message ||
                    "Une erreur s'est produite lors de la génération de la réponse.",
            },
            { status: 500 },
        );
    }
}

// Health check endpoint
export async function GET() {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
            signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
            throw new Error("Ollama not responding");
        }

        const data = await response.json();
        const models = data.models || [];

        return NextResponse.json({
            status: "healthy",
            ollama_url: OLLAMA_BASE_URL,
            model: OLLAMA_MODEL,
            available_models: models.map((m: { name: string }) => m.name),
            message: "AI locale opérationnelle",
        });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json(
            {
                status: "error",
                error: err.message,
                message:
                    "Ollama n'est pas accessible. Assurez-vous qu'il est démarré (ollama serve).",
            },
            { status: 503 },
        );
    }
}
