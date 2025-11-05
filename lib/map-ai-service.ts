import { MapQueryResponse, MapAction } from "@/types/map";
import { COMMUNES_06 } from "./geo-data/department-06";

/**
 * Parse a natural language query and generate map actions
 */
export async function queryMapAI(question: string): Promise<MapQueryResponse> {
    console.log("Map AI Query:", question);

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const lowerQuestion = question.toLowerCase();
    const mapActions: MapAction[] = [];
    let textResponse = "";

    // Enterprise queries
    if (
        lowerQuestion.includes("entreprise") ||
        lowerQuestion.includes("business") ||
        lowerQuestion.includes("commercial")
    ) {
        mapActions.push({
            type: "color",
            colorScheme: "enterprises",
            animate: true,
            duration: 1000,
        });

        textResponse =
            "La carte affiche maintenant la densité d'entreprises dans le département 06. " +
            "Les zones en rouge foncé indiquent une forte concentration d'entreprises, " +
            "tandis que les zones plus claires ont moins d'activité commerciale. " +
            "Nice et Cannes présentent les plus fortes concentrations.";
    }
    // Population queries
    else if (
        lowerQuestion.includes("population") ||
        lowerQuestion.includes("habitants") ||
        lowerQuestion.includes("démographie")
    ) {
        mapActions.push({
            type: "color",
            colorScheme: "population",
            animate: true,
            duration: 1000,
        });

        textResponse =
            "Voici la répartition de la population dans les Alpes-Maritimes. " +
            "Les zones en bleu foncé représentent les communes les plus peuplées. " +
            "Nice est la commune la plus peuplée avec environ 340 000 habitants, " +
            "suivie de Cannes et Antibes.";
    }
    // Tourism queries
    else if (
        lowerQuestion.includes("tourisme") ||
        lowerQuestion.includes("tourist") ||
        lowerQuestion.includes("visiteur")
    ) {
        mapActions.push({
            type: "color",
            colorScheme: "tourism",
            animate: true,
            duration: 1000,
        });

        textResponse =
            "La carte montre l'attractivité touristique des différentes zones. " +
            "Les zones en vert foncé ont les meilleurs scores touristiques. " +
            "Cannes (score: 98) et Nice (score: 95) sont les destinations les plus attractives, " +
            "grâce à leur littoral, leur patrimoine culturel et leurs événements internationaux.";
    }
    // Employment queries
    else if (
        lowerQuestion.includes("emploi") ||
        lowerQuestion.includes("chômage") ||
        lowerQuestion.includes("employment")
    ) {
        mapActions.push({
            type: "color",
            colorScheme: "employment",
            animate: true,
            duration: 1000,
        });

        textResponse =
            "Visualisation des taux d'emploi par commune. " +
            "Les zones orange foncé indiquent les taux d'emploi les plus élevés. " +
            "Le taux d'emploi moyen dans le département est de 85,8%. " +
            "Saint-Laurent-du-Var affiche le meilleur taux à 88,9%.";
    }
    // Income queries
    else if (
        lowerQuestion.includes("revenu") ||
        lowerQuestion.includes("salaire") ||
        lowerQuestion.includes("income")
    ) {
        mapActions.push({
            type: "color",
            colorScheme: "income",
            animate: true,
            duration: 1000,
        });

        textResponse =
            "Carte des revenus moyens par commune dans le département 06. " +
            "Les zones violettes foncées représentent les revenus moyens les plus élevés. " +
            "Cannes a le revenu moyen le plus élevé (28 300€), " +
            "suivie d'Antibes (25 800€) et Nice (24 500€).";
    }
    // Sector queries
    else if (
        lowerQuestion.includes("secteur") ||
        lowerQuestion.includes("activité") ||
        lowerQuestion.includes("sector")
    ) {
        mapActions.push({
            type: "color",
            colorScheme: "sectors",
            animate: true,
            duration: 1000,
        });

        textResponse =
            "La carte affiche les bâtiments colorés par secteur d'activité. " +
            "Les principaux secteurs dans le département 06 sont : Technologie (bleu), " +
            "Tourisme (vert), Commerce (orange), Santé (rose), et Finance (violet). " +
            "Cliquez sur un bâtiment pour voir son secteur spécifique.";
    }
    // City-specific queries
    else if (lowerQuestion.includes("nice")) {
        const nice = COMMUNES_06.find((c) => c.name === "Nice");
        if (nice) {
            mapActions.push({
                type: "focus",
                focusOn: {
                    commune: nice.id,
                    coordinates: nice.coordinates,
                },
                animate: true,
                duration: 1500,
            });

            textResponse =
                `Focus sur Nice, la préfecture des Alpes-Maritimes. ` +
                `Population : ${nice.population?.toLocaleString()} habitants. ` +
                `Nombre d'entreprises : ${nice.enterpriseCount?.toLocaleString()}. ` +
                `Score touristique : ${nice.tourismScore}/100. ` +
                `Taux d'emploi : ${nice.employmentRate}%. ` +
                `Nice est le centre économique et culturel du département.`;
        }
    } else if (lowerQuestion.includes("cannes")) {
        const cannes = COMMUNES_06.find((c) => c.name === "Cannes");
        if (cannes) {
            mapActions.push({
                type: "focus",
                focusOn: {
                    commune: cannes.id,
                    coordinates: cannes.coordinates,
                },
                animate: true,
                duration: 1500,
            });

            textResponse =
                `Focus sur Cannes, mondialement connue pour son festival du film. ` +
                `Population : ${cannes.population?.toLocaleString()} habitants. ` +
                `Nombre d'entreprises : ${cannes.enterpriseCount?.toLocaleString()}. ` +
                `Score touristique : ${cannes.tourismScore}/100 (le plus élevé du département). ` +
                `Revenu moyen : ${cannes.averageIncome?.toLocaleString()}€.`;
        }
    } else if (lowerQuestion.includes("antibes")) {
        const antibes = COMMUNES_06.find((c) => c.name === "Antibes");
        if (antibes) {
            mapActions.push({
                type: "focus",
                focusOn: {
                    commune: antibes.id,
                    coordinates: antibes.coordinates,
                },
                animate: true,
                duration: 1500,
            });

            textResponse =
                `Focus sur Antibes, ville d'art et d'histoire. ` +
                `Population : ${antibes.population?.toLocaleString()} habitants. ` +
                `Nombre d'entreprises : ${antibes.enterpriseCount?.toLocaleString()}. ` +
                `Score touristique : ${antibes.tourismScore}/100. ` +
                `Antibes abrite notamment le musée Picasso et une importante zone technologique.`;
        }
    }
    // Reset/default view
    else if (
        lowerQuestion.includes("reset") ||
        lowerQuestion.includes("réinitialiser") ||
        lowerQuestion.includes("vue globale")
    ) {
        mapActions.push({
            type: "color",
            colorScheme: "default",
            animate: true,
        });

        textResponse =
            "La vue de la carte a été réinitialisée. " +
            "Vous pouvez maintenant explorer le département 06 librement. " +
            "Posez-moi des questions sur la population, les entreprises, le tourisme, ou une ville spécifique !";
    }
    // Help/suggestions
    else if (
        lowerQuestion.includes("aide") ||
        lowerQuestion.includes("help") ||
        lowerQuestion.includes("que peux-tu")
    ) {
        textResponse =
            "Je peux vous aider à visualiser les données du département 06 ! Voici quelques exemples de questions :\n\n" +
            "📊 Données économiques :\n" +
            "• Montre-moi les entreprises\n" +
            "• Affiche les secteurs d'activité\n" +
            "• Quel est le taux d'emploi ?\n\n" +
            "👥 Démographie :\n" +
            "• Quelle est la population ?\n" +
            "• Affiche les zones les plus peuplées\n\n" +
            "🏖️ Tourisme :\n" +
            "• Montre les zones touristiques\n" +
            "• Quel est le score touristique ?\n\n" +
            "🏙️ Villes spécifiques :\n" +
            "• Focus sur Nice/Cannes/Antibes\n" +
            "• Zoom sur [nom de ville]";
    }
    // Default response
    else {
        textResponse =
            "Je n'ai pas compris votre demande. Essayez de me poser des questions sur :\n" +
            "• La densité d'entreprises\n" +
            "• La population des communes\n" +
            "• L'attractivité touristique\n" +
            "• Les taux d'emploi\n" +
            "• Les revenus moyens\n" +
            "• Une ville spécifique (Nice, Cannes, Antibes...)\n\n" +
            "Dites 'aide' pour voir plus d'exemples de questions.";
    }

    return {
        mapActions,
        textResponse,
        success: mapActions.length > 0,
    };
}

/**
 * Get map-specific suggestions for the query interface
 */
export function getMapSuggestions(): string[] {
    return [
        "Montre-moi les entreprises du département 06",
        "Quelle est la population de Nice ?",
        "Affiche les zones touristiques",
        "Quel est le taux d'emploi dans le département ?",
        "Focus sur Cannes",
        "Montre les secteurs d'activité économique",
        "Quelles sont les villes les plus peuplées ?",
        "Compare les revenus moyens par commune",
    ];
}
