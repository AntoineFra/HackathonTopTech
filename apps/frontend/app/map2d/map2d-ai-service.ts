/**
 * Service AI pour la carte 2D - Alpes-Maritimes (06)
 * Permet d'interroger la carte en langage naturel
 */

import { cityData } from './data/cityPolygons';

export interface Map2DAction {
  type: 'highlight' | 'reset' | 'focus';
  cities?: string[]; // Villes à mettre en surbrillance
  focusCity?: string; // Ville sur laquelle zoomer
  animate?: boolean;
  duration?: number;
}

export interface Map2DQueryResponse {
  mapActions: Map2DAction[];
  textResponse: string;
  success: boolean;
}

/**
 * Parse une question en langage naturel et génère des actions map 2D
 */
export async function queryMap2DAI(question: string): Promise<Map2DQueryResponse> {
  console.log('Map 2D AI Query:', question);

  // Simuler un délai de traitement IA
  await new Promise((resolve) => setTimeout(resolve, 500));

  const lowerQuestion = question.toLowerCase();
  const mapActions: Map2DAction[] = [];
  let textResponse = '';

  // Requêtes sur les villes les plus peuplées
  if (
    lowerQuestion.includes('plus peupl') ||
    lowerQuestion.includes('population') && (lowerQuestion.includes('top') || lowerQuestion.includes('plus'))
  ) {
    // Extraire le nombre de villes demandées
    const numberMatch = lowerQuestion.match(/(\d+)\s*villes?/i);
    const count = numberMatch ? parseInt(numberMatch[1]) : 3;

    // Trier les villes par population
    const sortedCities = Object.entries(cityData)
      .sort(([, a], [, b]) => b.population - a.population)
      .slice(0, count);

    const cityNames = sortedCities.map(([name]) => name);

    mapActions.push({
      type: 'highlight',
      cities: cityNames,
      animate: true,
      duration: 1000,
    });

    const citiesList = sortedCities
      .map(([name, data], index) => 
        `${index + 1}. ${name} (${data.population.toLocaleString()} habitants)`
      )
      .join('\n');

    textResponse =
      `Voici les ${count} communes les plus peuplées des Alpes-Maritimes :\n\n${citiesList}\n\n` +
      `Ces villes sont maintenant mises en surbrillance sur la carte.`;
  }
  // Requêtes sur les entreprises
  else if (
    lowerQuestion.includes('entreprise') ||
    lowerQuestion.includes('business') ||
    lowerQuestion.includes('économi')
  ) {
    // Extraire le nombre
    const numberMatch = lowerQuestion.match(/(\d+)\s*villes?/i);
    const count = numberMatch ? parseInt(numberMatch[1]) : 5;

    const sortedCities = Object.entries(cityData)
      .sort(([, a], [, b]) => b.entreprises - a.entreprises)
      .slice(0, count);

    const cityNames = sortedCities.map(([name]) => name);

    mapActions.push({
      type: 'highlight',
      cities: cityNames,
      animate: true,
      duration: 1000,
    });

    const citiesList = sortedCities
      .map(([name, data], index) => 
        `${index + 1}. ${name} (${data.entreprises.toLocaleString()} entreprises)`
      )
      .join('\n');

    textResponse =
      `Top ${count} des communes avec le plus d'entreprises :\n\n${citiesList}\n\n` +
      `Survolées en cyan sur la carte.`;
  }
  // Requêtes sur le tourisme
  else if (
    lowerQuestion.includes('tourisme') ||
    lowerQuestion.includes('tourist') ||
    lowerQuestion.includes('touristique')
  ) {
    const numberMatch = lowerQuestion.match(/(\d+)\s*villes?/i);
    const count = numberMatch ? parseInt(numberMatch[1]) : 5;

    const sortedCities = Object.entries(cityData)
      .sort(([, a], [, b]) => b.tourisme - a.tourisme)
      .slice(0, count);

    const cityNames = sortedCities.map(([name]) => name);

    mapActions.push({
      type: 'highlight',
      cities: cityNames,
      animate: true,
      duration: 1000,
    });

    const citiesList = sortedCities
      .map(([name, data], index) => 
        `${index + 1}. ${name} (score: ${data.tourisme}/100)`
      )
      .join('\n');

    textResponse =
      `Top ${count} des destinations touristiques :\n\n${citiesList}\n\n` +
      `Ces communes sont maintenant mises en évidence.`;
  }
  // Focus sur une ville spécifique
  else if (lowerQuestion.includes('nice')) {
    mapActions.push({
      type: 'focus',
      focusCity: 'Nice',
      animate: true,
      duration: 1500,
    });

    const niceData = cityData['Nice'];
    if (niceData) {
      textResponse =
        `Focus sur Nice, la préfecture des Alpes-Maritimes.\n\n` +
        `👥 Population : ${niceData.population.toLocaleString()} habitants\n` +
        `🏢 Entreprises : ${niceData.entreprises.toLocaleString()}\n` +
        `🏖️ Score touristique : ${niceData.tourisme}/100\n` +
        `💼 Emploi : ${niceData.emploi}%\n` +
        `💰 Revenu moyen : ${niceData.revenu.toLocaleString()}€`;
    }
  }
  else if (lowerQuestion.includes('cannes')) {
    mapActions.push({
      type: 'focus',
      focusCity: 'Cannes',
      animate: true,
      duration: 1500,
    });

    const cannesData = cityData['Cannes'];
    if (cannesData) {
      textResponse =
        `Focus sur Cannes, ville du festival international du film.\n\n` +
        `👥 Population : ${cannesData.population.toLocaleString()} habitants\n` +
        `🏢 Entreprises : ${cannesData.entreprises.toLocaleString()}\n` +
        `🏖️ Score touristique : ${cannesData.tourisme}/100\n` +
        `💼 Emploi : ${cannesData.emploi}%\n` +
        `💰 Revenu moyen : ${cannesData.revenu.toLocaleString()}€`;
    }
  }
  else if (lowerQuestion.includes('antibes')) {
    mapActions.push({
      type: 'focus',
      focusCity: 'Antibes',
      animate: true,
      duration: 1500,
    });

    const antibesData = cityData['Antibes'];
    if (antibesData) {
      textResponse =
        `Focus sur Antibes, ville d'art et d'histoire.\n\n` +
        `👥 Population : ${antibesData.population.toLocaleString()} habitants\n` +
        `🏢 Entreprises : ${antibesData.entreprises.toLocaleString()}\n` +
        `🏖️ Score touristique : ${antibesData.tourisme}/100\n` +
        `💼 Emploi : ${antibesData.emploi}%\n` +
        `💰 Revenu moyen : ${antibesData.revenu.toLocaleString()}€`;
    }
  }
  // Aide
  else if (
    lowerQuestion.includes('aide') ||
    lowerQuestion.includes('help') ||
    lowerQuestion.includes('que peux-tu')
  ) {
    textResponse =
      'Je peux vous aider à explorer les communes des Alpes-Maritimes ! Exemples de questions :\n\n' +
      '📊 Top villes :\n' +
      '• Montre-moi les 3 villes les plus peuplées\n' +
      '• Quelles sont les 5 villes avec le plus d\'entreprises ?\n' +
      '• Top 5 destinations touristiques\n\n' +
      '🏙️ Villes spécifiques :\n' +
      '• Focus sur Nice/Cannes/Antibes';
  }
  // Réponse par défaut
  else {
    textResponse =
      'Je n\'ai pas compris votre demande. Essayez :\n' +
      '• "Montre-moi les 3 villes les plus peuplées"\n' +
      '• "Quelles sont les top 5 villes avec le plus d\'entreprises ?"\n' +
      '• "Focus sur Nice"\n' +
      '• "Top 5 destinations touristiques"\n\n' +
      'Dites "aide" pour plus d\'exemples.';
  }

  return {
    mapActions,
    textResponse,
    success: mapActions.length > 0,
  };
}

/**
 * Suggestions pour l'interface de requête
 */
export function getMap2DSuggestions(): string[] {
  return [
    'Montre-moi les 3 villes les plus peuplées',
    'Quelles sont les 5 villes avec le plus d\'entreprises ?',
    'Top 5 destinations touristiques',
    'Focus sur Nice',
  ];
}
