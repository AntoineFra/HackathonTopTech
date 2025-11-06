/**
 * Service d'exécution sécurisée de requêtes Prisma
 * Permet à l'IA de générer et exécuter des requêtes en lecture seule
 */

import { prisma } from "../server.js";

// Modèles autorisés pour les requêtes en lecture seule
const ALLOWED_MODELS = [
    "city",
    "populationHistory",
    "legalUnit",
    "cityGeoData",
    "postalCode",
] as const;

type AllowedModel = (typeof ALLOWED_MODELS)[number];

// Opérations autorisées (LECTURE SEULE)
const ALLOWED_OPERATIONS = [
    "findMany",
    "findFirst",
    "findUnique",
    "count",
    "aggregate",
    "groupBy",
] as const;

type AllowedOperation = (typeof ALLOWED_OPERATIONS)[number];

export interface QueryRequest {
    model: string;
    operation: string;
    args?: any;
}

export interface QueryResult {
    success: boolean;
    data?: any;
    error?: string;
    executedQuery?: string;
}

/**
 * Valider qu'une requête est sécurisée (lecture seule)
 */
function validateQuery(query: QueryRequest): {
    valid: boolean;
    error?: string;
} {
    // Vérifier que le modèle est autorisé
    if (!ALLOWED_MODELS.includes(query.model as AllowedModel)) {
        return {
            valid: false,
            error: `Modèle non autorisé: ${query.model}. Modèles autorisés: ${ALLOWED_MODELS.join(", ")}`,
        };
    }

    // Vérifier que l'opération est autorisée (lecture seule)
    if (!ALLOWED_OPERATIONS.includes(query.operation as AllowedOperation)) {
        return {
            valid: false,
            error: `Opération non autorisée: ${query.operation}. Seules les opérations de lecture sont autorisées.`,
        };
    }

    // Interdire les opérations dangereuses dans les args
    if (query.args) {
        const argsString = JSON.stringify(query.args).toLowerCase();
        const dangerousPatterns = [
            "delete",
            "update",
            "create",
            "upsert",
            "drop",
            "truncate",
            "alter",
            "insert",
        ];

        for (const pattern of dangerousPatterns) {
            if (argsString.includes(pattern)) {
                return {
                    valid: false,
                    error: `Opération dangereuse détectée: ${pattern}`,
                };
            }
        }
    }

    return { valid: true };
}

/**
 * Exécuter une requête Prisma de manière sécurisée
 */
export async function executeQuery(query: QueryRequest): Promise<QueryResult> {
    try {
        // Valider la requête
        const validation = validateQuery(query);
        if (!validation.valid) {
            console.error(`❌ Requête rejetée: ${validation.error}`);
            return {
                success: false,
                error: validation.error,
            };
        }

        // Récupérer le modèle Prisma
        const model = (prisma as any)[query.model];
        if (!model) {
            return {
                success: false,
                error: `Modèle Prisma non trouvé: ${query.model}`,
            };
        }

        // Récupérer l'opération
        const operation = model[query.operation];
        if (!operation || typeof operation !== "function") {
            return {
                success: false,
                error: `Opération non trouvée: ${query.operation}`,
            };
        }

        // Exécuter la requête
        console.log(
            `🔍 Exécution: prisma.${query.model}.${query.operation}(${JSON.stringify(query.args || {})})`,
        );

        const startTime = Date.now();
        const result = await operation.call(model, query.args || {});
        const executionTime = Date.now() - startTime;

        console.log(`✅ Requête exécutée en ${executionTime}ms`);

        return {
            success: true,
            data: result,
            executedQuery: `prisma.${query.model}.${query.operation}(${JSON.stringify(query.args || {})})`,
        };
    } catch (error: any) {
        console.error("❌ Erreur lors de l'exécution de la requête:", error);
        return {
            success: false,
            error: error.message || "Erreur inconnue",
        };
    }
}

/**
 * Exécuter plusieurs requêtes en parallèle
 */
export async function executeQueries(
    queries: QueryRequest[],
): Promise<QueryResult[]> {
    // Limiter le nombre de requêtes simultanées
    if (queries.length > 10) {
        return [
            {
                success: false,
                error: "Trop de requêtes (maximum 10 par batch)",
            },
        ];
    }

    return Promise.all(queries.map((q) => executeQuery(q)));
}

/**
 * Parser une requête Prisma générée par l'IA depuis du texte
 */
export function parseAIGeneratedQuery(text: string): QueryRequest | null {
    try {
        // Chercher un pattern de requête Prisma: prisma.model.operation(...)
        const prismaRegex = /prisma\.(\w+)\.(\w+)\(([\s\S]*?)\)(?:\s*;|\s*$)/;
        const match = text.match(prismaRegex);

        if (!match) {
            return null;
        }

        const [, model, operation, argsStr] = match;

        // Parser les arguments (JSON ou objet JavaScript)
        let args = {};
        if (argsStr && argsStr.trim()) {
            try {
                // Essayer de parser comme JSON
                args = JSON.parse(argsStr);
            } catch (jsonError) {
                // Si ça échoue, convertir le JS en JSON valide
                try {
                    // Remplacer les clés non quotées par des clés quotées
                    let fixedJson = argsStr
                        // Ajouter des quotes autour des clés
                        .replace(/(\w+):/g, '"$1":')
                        // Remplacer les single quotes par des double quotes
                        .replace(/'/g, '"')
                        // Nettoyer les espaces
                        .trim();

                    args = JSON.parse(fixedJson);
                    console.log("✅ JSON réparé et parsé avec succès");
                } catch (fixError) {
                    console.warn(
                        "Arguments non parsables même après réparation:",
                        argsStr,
                    );
                    console.error("Erreur de parsing:", fixError);
                    return null;
                }
            }
        }

        if (!model || !operation) {
            return null;
        }

        return {
            model,
            operation,
            args,
        };
    } catch (error) {
        console.error("Erreur lors du parsing de la requête:", error);
        return null;
    }
}
