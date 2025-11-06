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
    lowerQuestion.includes('peupl') ||
    (lowerQuestion.includes('population') && (lowerQuestion.includes('top') || lowerQuestion.includes('plus') || lowerQuestion.includes('quelle')))
  ) {
    // Extraire le nombre de villes demandées - plus flexible
    let count = 3; // Par défaut
    
    // Patterns pour détecter le singulier
    if (lowerQuestion.match(/\b(la|quelle|1)\s+(ville|commune)\b/i)) {
      count = 1;
    }
    // Patterns pour détecter les nombres
    else if (lowerQuestion.match(/(\d+)\s*(villes?|communes?)/i)) {
      const match = lowerQuestion.match(/(\d+)\s*(villes?|communes?)/i);
      count = match ? parseInt(match[1]) : 3;
    }
    // "top 5", "top 10"
    else if (lowerQuestion.match(/top\s*(\d+)/i)) {
      const match = lowerQuestion.match(/top\s*(\d+)/i);
      count = match ? parseInt(match[1]) : 3;
    }

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
        count === 1 
          ? `${name} avec ${data.population.toLocaleString()} habitants`
          : `${index + 1}. ${name} (${data.population.toLocaleString()} habitants)`
      )
      .join('\n');

    textResponse = count === 1
      ? `La ville la plus peuplée des Alpes-Maritimes est :\n\n${citiesList}\n\nElle est maintenant mise en surbrillance sur la carte.`
      : `Voici les ${count} communes les plus peuplées des Alpes-Maritimes :\n\n${citiesList}\n\nCes villes sont maintenant mises en surbrillance sur la carte.`;
  }
  // Requêtes sur les entreprises
  else if (
    lowerQuestion.includes('entreprise') ||
    lowerQuestion.includes('business') ||
    lowerQuestion.includes('économi')
  ) {
    // Extraire le nombre - plus flexible
    let count = 5; // Par défaut
    
    if (lowerQuestion.match(/\b(la|quelle|1)\s+(ville|commune)\b/i)) {
      count = 1;
    } else if (lowerQuestion.match(/(\d+)\s*(villes?|communes?)/i)) {
      const match = lowerQuestion.match(/(\d+)\s*(villes?|communes?)/i);
      count = match ? parseInt(match[1]) : 5;
    } else if (lowerQuestion.match(/top\s*(\d+)/i)) {
      const match = lowerQuestion.match(/top\s*(\d+)/i);
      count = match ? parseInt(match[1]) : 5;
    }

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
        count === 1
          ? `${name} avec ${data.entreprises.toLocaleString()} entreprises`
          : `${index + 1}. ${name} (${data.entreprises.toLocaleString()} entreprises)`
      )
      .join('\n');

    textResponse = count === 1
      ? `La ville avec le plus d'entreprises est :\n\n${citiesList}\n\nSurvolée en cyan sur la carte.`
      : `Top ${count} des communes avec le plus d'entreprises :\n\n${citiesList}\n\nSurvolées en cyan sur la carte.`;
  }
  // Requêtes sur le tourisme
  else if (
    lowerQuestion.includes('tourisme') ||
    lowerQuestion.includes('tourist') ||
    lowerQuestion.includes('touristique')
  ) {
    let count = 5; // Par défaut
    
    if (lowerQuestion.match(/\b(la|quelle|1)\s+(ville|commune|destination)\b/i)) {
      count = 1;
    } else if (lowerQuestion.match(/(\d+)\s*(villes?|communes?|destinations?)/i)) {
      const match = lowerQuestion.match(/(\d+)\s*(villes?|communes?|destinations?)/i);
      count = match ? parseInt(match[1]) : 5;
    } else if (lowerQuestion.match(/top\s*(\d+)/i)) {
      const match = lowerQuestion.match(/top\s*(\d+)/i);
      count = match ? parseInt(match[1]) : 5;
    }

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
        count === 1
          ? `${name} avec un score de ${data.tourisme}/100`
          : `${index + 1}. ${name} (score: ${data.tourisme}/100)`
      )
      .join('\n');

    textResponse = count === 1
      ? `La destination touristique la plus attractive est :\n\n${citiesList}\n\nCette commune est maintenant mise en évidence.`
      : `Top ${count} des destinations touristiques :\n\n${citiesList}\n\nCes communes sont maintenant mises en évidence.`;
  }
  // Focus sur une ville spécifique - détection intelligente
  else if (
    lowerQuestion.includes('focus') ||
    lowerQuestion.includes('zoom') ||
    lowerQuestion.includes('montre') && (lowerQuestion.includes('ville') || lowerQuestion.includes('commune'))
  ) {
    // Chercher un nom de ville dans la question
    let foundCity: string | null = null;
    
    // Chercher parmi toutes les villes disponibles
    for (const cityName of Object.keys(cityData)) {
      const cityLower = cityName.toLowerCase();
      if (lowerQuestion.includes(cityLower)) {
        foundCity = cityName;
        break;
      }
    }

    if (foundCity) {
      mapActions.push({
        type: 'focus',
        focusCity: foundCity,
        animate: true,
        duration: 1500,
      });

      const data = cityData[foundCity];
      textResponse =
        `Focus sur ${foundCity}.\n\n` +
        `👥 Population : ${data.population.toLocaleString()} habitants\n` +
        `🏢 Entreprises : ${data.entreprises.toLocaleString()}\n` +
        `🏖️ Score touristique : ${data.tourisme}/100\n` +
        `💼 Emploi : ${data.emploi}%\n` +
        `💰 Revenu moyen : ${data.revenu.toLocaleString()}€`;
    } else {
      textResponse = 
        "Je n'ai pas trouvé de ville dans votre demande. Essayez par exemple :\n" +
        "• Focus sur Nice\n" +
        "• Montre-moi Cannes\n" +
        "• Zoom sur Antibes";
    }
  }
  // Villes spécifiques nommées (fallback pour compatibilité)
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
      '• Quelle est la ville la plus peuplée ?\n' +
      '• Montre-moi les 5 villes les plus peuplées\n' +
      '• Top 3 villes avec le plus d\'entreprises\n' +
      '• Quelle destination touristique est la plus attractive ?\n\n' +
      '🏙️ Villes spécifiques :\n' +
      '• Focus sur [nom de ville]\n' +
      '• Montre-moi Nice/Cannes/Antibes/Menton...\n' +
      '• Zoom sur Grasse';
  }
  // Réponse par défaut
  else {
    textResponse =
      'Je n\'ai pas compris votre demande. Essayez :\n' +
      '• "Quelle est la ville la plus peuplée ?"\n' +
      '• "Top 5 destinations touristiques"\n' +
      '• "Focus sur Nice"\n' +
      '• "Ville avec le plus d\'entreprises"\n\n' +
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
    'Quelle est la ville la plus peuplée ?',
    'Top 5 destinations touristiques',
    'Ville avec le plus d\'entreprises',
    'Focus sur Cannes',
  ];
}
