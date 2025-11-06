import type { Request, Response } from "express";
import { answerQuestion, checkOllamaHealth } from "../services/ai.services.js";

// Express handler pour POST /ai/answer
export async function answer(req: Request, res: Response) {
    const { question, history, provider } = req.body;
    if (!question)
        return res.status(400).json({ error: "Question is required" });

    // Valider le provider
    const aiProvider =
        provider === "gemini" || provider === "ollama" ? provider : undefined;

    try {
        const result = await answerQuestion(
            question,
            history || [],
            aiProvider,
        );
        return res.json(result);
    } catch (error: unknown) {
        const err = error as Error;
        console.error("Error in answer question", err);
        return res
            .status(500)
            .json({ error: "Internal server error", message: err.message });
    }
}

// Express handler pour GET /ai/health
export async function health(req: Request, res: Response) {
    try {
        const healthStatus = await checkOllamaHealth();

        if (healthStatus.status === "healthy") {
            return res.json(healthStatus);
        }

        return res.status(503).json(healthStatus);
    } catch (error: unknown) {
        const err = error as Error;
        console.error("Error checking AI health status:", err);
        return res.status(500).json({
            status: "error",
            error: "Internal server error",
            message: err.message,
        });
    }
}
