/**
 * Service AI pour la carte 2D - Alpes-Maritimes (06)
 * Permet d'interroger la carte en langage naturel via Ollama/Gemini
 */

import { aiAnswer } from "@/services/ai.services";
import { cityData } from "./data/cityPolygons";

export interface Map2DAction {
    type: "highlight" | "reset" | "focus";
    cities?: string[];
    focusCity?: string;
    animate?: boolean;
    duration?: number;
}

export interface Map2DQueryResponse {
    mapActions: Map2DAction[];
    textResponse: string;
    success: boolean;
}

function extractCityNames(text: string): string[] {
    const cities: string[] = [];
    const textLower = text.toLowerCase();
    
    // Normaliser le texte pour enlever les accents et caractères spéciaux
    const normalizeText = (str: string) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    };
    
    const normalizedText = normalizeText(text);
    
    Object.keys(cityData).forEach((cityName) => {
        const cityLower = cityName.toLowerCase();
        const normalizedCityName = normalizeText(cityName);
        
        // Essayer plusieurs patterns pour trouver la ville
        const patterns = [
            // Pattern exact avec boundaries
            new RegExp(`\\b${cityLower}\\b`, 'i'),
            // Pattern normalisé
            new RegExp(`\\b${normalizedCityName}\\b`, 'i'),
            // Pattern avec tirets optionnels (ex: "Cagnes sur Mer" ou "Cagnes-sur-Mer")
            new RegExp(cityLower.replace(/-/g, '[-\\s]?'), 'i'),
        ];
        
        const found = patterns.some(pattern => {
            return pattern.test(textLower) || pattern.test(normalizedText);
        });
        
        if (found && !cities.includes(cityName)) {
            cities.push(cityName);
        }
    });
    
    return cities;
}

function detectFocusRequest(question: string): string | null {
    const lowerQuestion = question.toLowerCase();
    
    const focusKeywords = [
        'focus', 'zoom', 'montre-moi', 'montre moi', 'concentre', 
        'info sur', 'infos sur', 'détails sur', 'détail sur'
    ];
    
    const hasFocusKeyword = focusKeywords.some(keyword => 
        lowerQuestion.includes(keyword)
    );
    
    if (!hasFocusKeyword) {
        return null;
    }
    
    for (const cityName of Object.keys(cityData)) {
        const cityLower = cityName.toLowerCase();
        if (lowerQuestion.includes(cityLower)) {
            return cityName;
        }
    }
    
    return null;
}

/**
 * Détecte si la question porte sur des données locales (entreprises, tourisme, etc.)
 * et y répond directement sans passer par l'IA
 */
function handleLocalDataQuery(question: string): Map2DQueryResponse | null {
    const lowerQuestion = question.toLowerCase();
    
    // Détecter si la question porte sur une ville spécifique avec "combien"
    if (lowerQuestion.includes('combien')) {
        for (const cityName of Object.keys(cityData)) {
            const cityLower = cityName.toLowerCase();
            if (lowerQuestion.includes(cityLower)) {
                const data = cityData[cityName];
                
                // Déterminer quel critère est demandé
                let response = `📊 Données de ${cityName} :\n\n`;
                let criterionFound = false;
                
                if (lowerQuestion.includes('habitant') || lowerQuestion.includes('population') || lowerQuestion.includes('peupl')) {
                    response = `${cityName} compte **${data.population.toLocaleString()} habitants**.`;
                    criterionFound = true;
                } else if (lowerQuestion.includes('entreprise')) {
                    response = `${cityName} compte **${data.entreprises.toLocaleString()} entreprises**.`;
                    criterionFound = true;
                } else if (lowerQuestion.includes('surface')) {
                    response = `${cityName} a une surface de **${data.surface?.toFixed(2) || 'N/A'} hectares**.`;
                    criterionFound = true;
                } else {
                    // Si pas de critère spécifique, donner toutes les infos
                    response =
                        `📊 Données de ${cityName} :\n\n` +
                        `👥 Population : ${data.population.toLocaleString()} habitants\n` +
                        `🏢 Entreprises : ${data.entreprises.toLocaleString()}\n` +
                        `🏖️ Score touristique : ${data.tourisme}/100\n` +
                        `💼 Taux d'emploi : ${data.emploi}%\n` +
                        `💰 Revenu moyen : ${data.revenu.toLocaleString()}€/an\n` +
                        `🏭 Secteur dominant : ${data.secteur}\n` +
                        `📏 Surface : ${data.surface ? data.surface.toFixed(2) + " hectares" : "N/A"}`;
                    criterionFound = true;
                }
                
                if (criterionFound) {
                    return {
                        mapActions: [{
                            type: "highlight",
                            cities: [cityName],
                            animate: true,
                            duration: 1000,
                        }],
                        textResponse: response,
                        success: true,
                    };
                }
            }
        }
    }
    
    // Détecter le type de critère recherché
    let criterion: 'population' | 'entreprises' | 'tourisme' | 'emploi' | 'revenu' | 'surface' | null = null;
    let ascending = false; // false = descendant (plus grand en premier)
    
    if (lowerQuestion.includes('entreprise')) {
        criterion = 'entreprises';
    } else if (lowerQuestion.includes('tourisme') || lowerQuestion.includes('touristique') || lowerQuestion.includes('destination')) {
        criterion = 'tourisme';
    } else if (lowerQuestion.includes('emploi') || lowerQuestion.includes('chômage')) {
        criterion = 'emploi';
    } else if (lowerQuestion.includes('revenu') || lowerQuestion.includes('salaire') || lowerQuestion.includes('riche') || lowerQuestion.includes('pauvre')) {
        criterion = 'revenu';
    } else if (lowerQuestion.includes('surface') || lowerQuestion.includes('grande') || lowerQuestion.includes('petite')) {
        criterion = 'surface';
    } else if (lowerQuestion.includes('population') || lowerQuestion.includes('peupl') || lowerQuestion.includes('habitant')) {
        criterion = 'population';
    }
    
    if (!criterion) return null;
    
    // Détecter si on cherche les plus petits/faibles
    if (lowerQuestion.includes('moins') || lowerQuestion.includes('faible') || 
        lowerQuestion.includes('petite') || lowerQuestion.includes('pauvre')) {
        ascending = true;
    }
    
    // Extraire le nombre demandé
    let count = 5; // par défaut
    const numberMatch = lowerQuestion.match(/(\d+)/);
    if (numberMatch) {
        count = parseInt(numberMatch[1]);
    } else if (lowerQuestion.includes('quelle ville') || lowerQuestion.includes('la ville')) {
        count = 1;
    }
    
    // Trier les villes selon le critère
    const sortedCities = Object.entries(cityData)
        .sort(([, a], [, b]) => {
            const aValue = a[criterion!] || 0;
            const bValue = b[criterion!] || 0;
            return ascending ? aValue - bValue : bValue - aValue;
        })
        .slice(0, count);
    
    const cityNames = sortedCities.map(([name]) => name);
    
    // Formater la réponse
    const labels: Record<typeof criterion, { singular: string; plural: string; unit: string }> = {
        population: { singular: 'la ville la plus peuplée', plural: 'les villes les plus peuplées', unit: 'habitants' },
        entreprises: { singular: 'la ville avec le plus d\'entreprises', plural: 'les villes avec le plus d\'entreprises', unit: 'entreprises' },
        tourisme: { singular: 'la destination touristique la plus attractive', plural: 'les destinations touristiques les plus attractives', unit: '/100' },
        emploi: { singular: 'la ville avec le meilleur taux d\'emploi', plural: 'les villes avec les meilleurs taux d\'emploi', unit: '%' },
        revenu: { singular: 'la ville avec le revenu moyen le plus élevé', plural: 'les villes avec les revenus moyens les plus élevés', unit: '€/an' },
        surface: { singular: 'la plus grande commune', plural: 'les plus grandes communes', unit: 'hectares' },
    };
    
    if (ascending) {
        if (criterion === 'population') {
            labels.population = { singular: 'la ville la moins peuplée', plural: 'les villes les moins peuplées', unit: 'habitants' };
        } else if (criterion === 'revenu') {
            labels.revenu = { singular: 'la ville avec le revenu moyen le plus faible', plural: 'les villes avec les revenus moyens les plus faibles', unit: '€/an' };
        } else if (criterion === 'surface') {
            labels.surface = { singular: 'la plus petite commune', plural: 'les plus petites communes', unit: 'hectares' };
        }
    }
    
    const label = count === 1 ? labels[criterion].singular : labels[criterion].plural;
    const unit = labels[criterion].unit;
    
    const citiesList = sortedCities.map(([name, data], index) => {
        const value = data[criterion!];
        const formattedValue = criterion === 'surface' && value 
            ? (value as number).toFixed(2)
            : (value as number).toLocaleString();
        
        return count === 1
            ? `${name} (${formattedValue} ${unit})`
            : `${index + 1}. ${name} (${formattedValue} ${unit})`;
    }).join('\n');
    
    const textResponse = count === 1
        ? `${label.charAt(0).toUpperCase() + label.slice(1)} est :\n\n${citiesList}`
        : `Voici ${label} (top ${count}) :\n\n${citiesList}`;
    
    return {
        mapActions: [{
            type: "highlight",
            cities: cityNames,
            animate: true,
            duration: 1000,
        }],
        textResponse: textResponse + '\n\n✨ Ces villes sont maintenant mises en surbrillance sur la carte.',
        success: true,
    };
}

export async function queryMap2DAI(
    question: string,
    provider: "ollama" | "gemini" = "gemini",
): Promise<Map2DQueryResponse> {
    console.log("Map 2D AI Query:", question);

    const mapActions: Map2DAction[] = [];
    let textResponse = "";

    try {
        // 1. Vérifier si c'est une demande de focus spécifique
        const focusCity = detectFocusRequest(question);
        
        if (focusCity) {
            const data = cityData[focusCity];
            if (data) {
                mapActions.push({
                    type: "focus",
                    focusCity: focusCity,
                    animate: true,
                    duration: 1500,
                });

                textResponse =
                    `📍 Focus sur ${focusCity}\n\n` +
                    `👥 Population : ${data.population.toLocaleString()} habitants\n` +
                    `🏢 Entreprises : ${data.entreprises.toLocaleString()}\n` +
                    `🏖️ Score touristique : ${data.tourisme}/100\n` +
                    `💼 Taux d'emploi : ${data.emploi}%\n` +
                    `💰 Revenu moyen : ${data.revenu.toLocaleString()}€/an\n` +
                    `🏭 Secteur dominant : ${data.secteur}\n` +
                    `📏 Surface : ${data.surface ? data.surface.toFixed(2) + " hectares" : "N/A"}`;
                
                return {
                    mapActions,
                    textResponse,
                    success: true,
                };
            }
        }
        
        // 2. Vérifier si c'est une question sur les données locales
        const localResponse = handleLocalDataQuery(question);
        if (localResponse) {
            console.log("🎯 Réponse locale (sans IA)");
            return localResponse;
        }

        // 3. Sinon, utiliser l'IA backend
        const enrichedPrompt = `Tu es un assistant pour une carte interactive des Alpes-Maritimes (06).
L'utilisateur pose une question sur les villes du département.

CONTEXTE : Nous disposons de données sur les villes suivantes : ${Object.keys(cityData).slice(0, 20).join(', ')} et d'autres communes du 06.

RÈGLE ABSOLUE : 
- Tu DOIS OBLIGATOIREMENT mentionner les noms EXACTS des villes dans ta réponse
- Format attendu : "1. Nice (XXX habitants)" ou "Nice, Cannes, Antibes..."
- Ne JAMAIS dire "les 5 villes sont..." sans les nommer
- Ne JAMAIS utiliser des formulations vagues comme "ces communes" ou "plusieurs villes"

IMPORTANT : 
1. Liste TOUJOURS les noms des villes explicitement (ex: "Nice", "Cannes", "Antibes")
2. Si on te demande un top N, liste exactement N villes avec leur nom complet
3. Commence par le nom de la ville, puis les données chiffrées
4. Sois concis mais TOUJOURS précis avec les noms

Question de l'utilisateur : ${question}`;

        const aiResponse = await aiAnswer(enrichedPrompt, [], provider);

        if (!aiResponse.success) {
            throw new Error(aiResponse.error || "Erreur IA");
        }

        textResponse = aiResponse.answer;
        console.log("📝 Réponse brute de l'IA:", textResponse);
        
        const mentionedCities = extractCityNames(aiResponse.answer);
        
        console.log("🏙️ Villes détectées dans la réponse:", mentionedCities);

        if (mentionedCities.length > 0) {
            mapActions.push({
                type: "highlight",
                cities: mentionedCities,
                animate: true,
                duration: 1000,
            });
            
            if (!textResponse.toLowerCase().includes('surbrillance') && 
                !textResponse.toLowerCase().includes('highlight') &&
                !textResponse.toLowerCase().includes('carte')) {
                textResponse += `\n\n✨ Les villes mentionnées sont maintenant mises en surbrillance sur la carte.`;
            }
        }

        return {
            mapActions,
            textResponse,
            success: true,
        };

    } catch (error) {
        console.error("Erreur lors de la requête IA:", error);
        
        return {
            mapActions: [],
            textResponse: `❌ Erreur lors du traitement de votre question : ${error instanceof Error ? error.message : 'Erreur inconnue'}. Veuillez réessayer.`,
            success: false,
        };
    }
}

export function getMap2DSuggestions(): string[] {
    return [
        "Quelles sont les villes les plus peuplées ?",
        "Montre-moi les meilleures destinations touristiques",
        "Quelle ville a le plus d'entreprises ?",
        "Focus sur Nice",
        "Compare les revenus moyens des villes",
        "Statistiques du département",
    ];
}
