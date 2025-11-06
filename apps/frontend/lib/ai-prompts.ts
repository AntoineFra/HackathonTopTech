/**
 * Prompt Engineering pour l'assistant IA PACA Analytics
 */

export const SYSTEM_PROMPT = `Tu es un assistant IA spécialisé dans l'analyse des données socio-démographiques et économiques du territoire 06 (Alpes-Maritimes) dans la région Provence-Alpes-Côte d'Azur (PACA).

## Ton rôle :
- Répondre aux questions sur les indicateurs démographiques, économiques et touristiques
- Fournir des analyses pertinentes basées sur des données du territoire
- Être précis, concis et professionnel
- Répondre en français

## Contexte territorial :
- Département : Alpes-Maritimes (06)
- Préfecture : Nice
- Principales villes : Nice, Cannes, Grasse, Antibes, Cagnes-sur-Mer
- Secteurs clés : Tourisme, Technologies, Santé, Commerce
- Zone : Côte d'Azur

## Directives de réponse :
1. Reste factuel et base-toi sur les données disponibles
2. Si tu n'as pas l'information exacte, indique-le clairement
3. Utilise des chiffres et statistiques quand c'est pertinent
4. Sois concis : 2-3 paragraphes maximum
5. Utilise un langage professionnel mais accessible
6. Propose des suggestions de questions complémentaires si pertinent

## Format de réponse :
- Introduction courte
- Données/Informations principales (avec chiffres si possible)
- Conclusion ou contexte additionnel
`;

export const EXAMPLE_PROMPTS = [
    "Quelle est la population de Nice ?",
    "Statistiques d'emploi pour 2025",
    "Principaux secteurs économiques du 06",
    "Indicateurs touristiques de la Côte d'Azur",
    "Démographie des Alpes-Maritimes",
    "Taux de chômage dans le département 06",
];

export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export function buildConversationPrompt(
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
): ChatMessage[] {
    const messages: ChatMessage[] = [
        {
            role: "system",
            content: SYSTEM_PROMPT,
        },
    ];

    // Add last 10 messages for context (limit for performance)
    const recentHistory = conversationHistory.slice(-10);
    messages.push(...recentHistory);

    // Add current user message
    messages.push({
        role: "user",
        content: userMessage,
    });

    return messages;
}

export function formatPromptForOllama(messages: ChatMessage[]): string {
    // Ollama expects a single prompt string for simple API
    // Format: System + History + Current
    let prompt = "";

    for (const msg of messages) {
        if (msg.role === "system") {
            prompt += `${msg.content}\n\n`;
        } else if (msg.role === "user") {
            prompt += `Utilisateur: ${msg.content}\n\n`;
        } else if (msg.role === "assistant") {
            prompt += `Assistant: ${msg.content}\n\n`;
        }
    }

    prompt += "Assistant: ";

    return prompt;
}
