import { NextRequest, NextResponse } from "next/server";
import { queryAI } from "@/lib/ai-service";

/**
 * POST /api/query
 *
 * Point de terminaison pour traiter les requêtes IA
 *
 * Corps : { query: string }
 * Réponse : AIResponse
 */
export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json();

        if (!query || typeof query !== "string") {
            return NextResponse.json(
                { error: "Paramètre de requête invalide" },
                { status: 400 },
            );
        }

        // Traiter la requête via le service IA
        const response = await queryAI(query);

        return NextResponse.json(response);
    } catch (error) {
        console.error("Erreur de traitement de requête :", error);

        return NextResponse.json(
            {
                success: false,
                error: "Échec du traitement de la requête",
                message:
                    error instanceof Error ? error.message : "Erreur inconnue",
            },
            { status: 500 },
        );
    }
}

/**
 * GET /api/query
 *
 * Point de terminaison de vérification de santé
 */
export async function GET() {
    return NextResponse.json({
        status: "ok",
        message: "L'API de requête fonctionne",
        timestamp: new Date().toISOString(),
    });
}
