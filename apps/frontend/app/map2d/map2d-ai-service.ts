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
 * Extrait le nombre de résultats demandés dans la question
 */
function extractCount(question: string): number {
  const lowerQ = question.toLowerCase();
  
  // Singulier : "la ville", "quelle ville", "une ville"
  if (lowerQ.match(/\b(la|quelle|une|1)\s+(ville|commune|destination)\b/i)) {
    return 1;
  }
  
  // Nombre explicite : "5 villes", "top 10"
  const numberMatch = lowerQ.match(/(\d+)\s*(villes?|communes?|destinations?)/i) || 
                      lowerQ.match(/top\s*(\d+)/i);
  if (numberMatch) {
    return parseInt(numberMatch[1]);
  }
  
  // Par défaut
  return 3;
}

/**
 * Formate la réponse selon le nombre de résultats
 */
function formatResponse(
  cities: [string, any][],
  count: number,
  singularLabel: string,
  pluralLabel: string,
  valueFormatter: (data: any) => string
): { cityNames: string[]; citiesList: string; intro: string } {
  const cityNames = cities.map(([name]) => name);
  
  const citiesList = cities
    .map(([name, data], index) => 
      count === 1 
        ? `${name} ${valueFormatter(data)}`
        : `${index + 1}. ${name} ${valueFormatter(data)}`
    )
    .join('\n');
  
  const intro = count === 1
    ? singularLabel
    : `${pluralLabel} ${count}`;
  
  return { cityNames, citiesList, intro };
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

  // ==================== POPULATION ====================
  if (
    lowerQuestion.includes('peupl') ||
    lowerQuestion.includes('habitant') ||
    (lowerQuestion.includes('population') && (lowerQuestion.includes('plus') || lowerQuestion.includes('quelle') || lowerQuestion.includes('top')))
  ) {
    const count = extractCount(lowerQuestion);
    const sortedCities = Object.entries(cityData)
      .sort(([, a], [, b]) => b.population - a.population)
      .slice(0, count);

    const { cityNames, citiesList, intro } = formatResponse(
      sortedCities,
      count,
      'La ville la plus peuplée est :',
      'Les villes les plus peuplées (top',
      (data) => `avec ${data.population.toLocaleString()} habitants`
    );

    mapActions.push({ type: 'highlight', cities: cityNames, animate: true, duration: 1000 });
    textResponse = `${intro}${count > 1 ? ')' : ''} :\n\n${citiesList}\n\n${count === 1 ? 'Elle est' : 'Elles sont'} maintenant mise${count === 1 ? '' : 's'} en surbrillance.`;
  }
  
  // ==================== ENTREPRISES ====================
  else if (
    lowerQuestion.includes('entreprise') ||
    lowerQuestion.includes('business') ||
    lowerQuestion.includes('économi') ||
    lowerQuestion.includes('commercial')
  ) {
    const count = extractCount(lowerQuestion);
    const sortedCities = Object.entries(cityData)
      .sort(([, a], [, b]) => b.entreprises - a.entreprises)
      .slice(0, count);

    const { cityNames, citiesList, intro } = formatResponse(
      sortedCities,
      count,
      'La ville avec le plus d\'entreprises est :',
      'Top',
      (data) => `(${data.entreprises.toLocaleString()} entreprises)`
    );

    mapActions.push({ type: 'highlight', cities: cityNames, animate: true, duration: 1000 });
    textResponse = `${intro} des villes les plus dynamiques économiquement :\n\n${citiesList}\n\nMises en surbrillance en cyan.`;
  }
  
  // ==================== TOURISME ====================
  else if (
    lowerQuestion.includes('tourisme') ||
    lowerQuestion.includes('tourist') ||
    lowerQuestion.includes('touristique') ||
    lowerQuestion.includes('attracti') ||
    lowerQuestion.includes('destination')
  ) {
    const count = extractCount(lowerQuestion);
    const sortedCities = Object.entries(cityData)
      .sort(([, a], [, b]) => b.tourisme - a.tourisme)
      .slice(0, count);

    const { cityNames, citiesList, intro } = formatResponse(
      sortedCities,
      count,
      'La destination touristique la plus attractive est :',
      'Top',
      (data) => `(score: ${data.tourisme}/100)`
    );

    mapActions.push({ type: 'highlight', cities: cityNames, animate: true, duration: 1000 });
    textResponse = `${intro} des destinations touristiques :\n\n${citiesList}\n\nCes communes brillent maintenant sur la carte.`;
  }
  
  // ==================== EMPLOI ====================
  else if (
    lowerQuestion.includes('emploi') ||
    lowerQuestion.includes('chômage') ||
    lowerQuestion.includes('travail') ||
    (lowerQuestion.includes('taux') && lowerQuestion.includes('emploi'))
  ) {
    const count = extractCount(lowerQuestion);
    const sortedCities = Object.entries(cityData)
      .sort(([, a], [, b]) => b.emploi - a.emploi)
      .slice(0, count);

    const { cityNames, citiesList, intro } = formatResponse(
      sortedCities,
      count,
      'La ville avec le meilleur taux d\'emploi est :',
      'Top',
      (data) => `(taux d'emploi: ${data.emploi}%)`
    );

    mapActions.push({ type: 'highlight', cities: cityNames, animate: true, duration: 1000 });
    textResponse = `${intro} des villes avec les meilleurs taux d'emploi :\n\n${citiesList}\n\nMises en évidence sur la carte.`;
  }
  
  // ==================== REVENU ====================
  else if (
    lowerQuestion.includes('revenu') ||
    lowerQuestion.includes('salaire') ||
    lowerQuestion.includes('riche') ||
    lowerQuestion.includes('aisé') ||
    lowerQuestion.includes('fortuné')
  ) {
    const count = extractCount(lowerQuestion);
    
    // Détecter si on cherche les plus riches ou les moins riches
    const searchLowest = lowerQuestion.includes('pauvre') || 
                        lowerQuestion.includes('faible') || 
                        lowerQuestion.includes('moins') ||
                        lowerQuestion.includes('plus bas');
    
    const sortedCities = Object.entries(cityData)
      .sort(([, a], [, b]) => searchLowest ? a.revenu - b.revenu : b.revenu - a.revenu)
      .slice(0, count);

    const { cityNames, citiesList, intro } = formatResponse(
      sortedCities,
      count,
      searchLowest ? 'La ville avec le revenu moyen le plus faible est :' : 'La ville avec le revenu moyen le plus élevé est :',
      searchLowest ? 'Villes avec les revenus moyens les plus faibles (top' : 'Villes avec les revenus moyens les plus élevés (top',
      (data) => `(${data.revenu.toLocaleString()}€/an)`
    );

    mapActions.push({ type: 'highlight', cities: cityNames, animate: true, duration: 1000 });
    textResponse = `${intro}${count > 1 ? ')' : ''} :\n\n${citiesList}\n\nHighlightées sur la carte.`;
  }
  
  // ==================== SURFACE ====================
  else if (
    lowerQuestion.includes('surface') ||
    lowerQuestion.includes('grande') && (lowerQuestion.includes('ville') || lowerQuestion.includes('commune')) ||
    lowerQuestion.includes('superficie') ||
    lowerQuestion.includes('étendu')
  ) {
    const count = extractCount(lowerQuestion);
    
    // Détecter si on cherche les plus grandes ou les plus petites
    const searchSmallest = lowerQuestion.includes('petite') || 
                          lowerQuestion.includes('moins grande') ||
                          lowerQuestion.includes('plus petite');
    
    const sortedCities = Object.entries(cityData)
      .filter(([, data]) => data.surface && data.surface > 0)
      .sort(([, a], [, b]) => searchSmallest ? (a.surface || 0) - (b.surface || 0) : (b.surface || 0) - (a.surface || 0))
      .slice(0, count);

    const { cityNames, citiesList, intro } = formatResponse(
      sortedCities,
      count,
      searchSmallest ? 'La plus petite commune est :' : 'La plus grande commune (en surface) est :',
      searchSmallest ? 'Plus petites communes (top' : 'Plus grandes communes (top',
      (data) => `(${(data.surface || 0).toFixed(2)} hectares)`
    );

    mapActions.push({ type: 'highlight', cities: cityNames, animate: true, duration: 1000 });
    textResponse = `${intro}${count > 1 ? ')' : ''} :\n\n${citiesList}\n\nMises en surbrillance.`;
  }
  
  // ==================== SECTEUR D'ACTIVITÉ ====================
  else if (
    lowerQuestion.includes('secteur') ||
    lowerQuestion.includes('activité') ||
    lowerQuestion.includes('technologie') ||
    lowerQuestion.includes('commerce') ||
    lowerQuestion.includes('agriculture')
  ) {
    // Chercher un secteur spécifique
    let targetSector: string | null = null;
    const sectors = ['Technologie', 'Tourisme', 'Agriculture', 'Commerce'];
    
    for (const sector of sectors) {
      if (lowerQuestion.includes(sector.toLowerCase())) {
        targetSector = sector;
        break;
      }
    }
    
    if (targetSector) {
      const citiesInSector = Object.entries(cityData)
        .filter(([, data]) => data.secteur === targetSector)
        .slice(0, 10); // Max 10
      
      const cityNames = citiesInSector.map(([name]) => name);
      
      mapActions.push({ type: 'highlight', cities: cityNames, animate: true, duration: 1000 });
      textResponse = `Villes avec le secteur dominant "${targetSector}" :\n\n${cityNames.join(', ')}\n\n${cityNames.length} commune${cityNames.length > 1 ? 's' : ''} identifiée${cityNames.length > 1 ? 's' : ''}.`;
    } else {
      // Stats générales sur les secteurs
      const sectorCounts: { [key: string]: number } = {};
      Object.values(cityData).forEach(data => {
        sectorCounts[data.secteur] = (sectorCounts[data.secteur] || 0) + 1;
      });
      
      const sectorsList = Object.entries(sectorCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([sector, count]) => `• ${sector}: ${count} communes`)
        .join('\n');
      
      textResponse = `Répartition des secteurs d'activité dominants dans le 06 :\n\n${sectorsList}\n\nDemandez un secteur spécifique pour voir les villes (ex: "Villes en technologie").`;
    }
  }
  
  // ==================== FOCUS SUR UNE VILLE ====================
  else if (
    lowerQuestion.includes('focus') ||
    lowerQuestion.includes('zoom') ||
    lowerQuestion.includes('montre') && (lowerQuestion.includes('ville') || lowerQuestion.includes('commune')) ||
    lowerQuestion.includes('info') && (lowerQuestion.includes('sur') || lowerQuestion.includes('de'))
  ) {
    // Chercher un nom de ville dans la question
    let foundCity: string | null = null;
    
    for (const cityName of Object.keys(cityData)) {
      const cityLower = cityName.toLowerCase();
      if (lowerQuestion.includes(cityLower)) {
        foundCity = cityName;
        break;
      }
    }

    if (foundCity) {
      mapActions.push({ type: 'focus', focusCity: foundCity, animate: true, duration: 1500 });

      const data = cityData[foundCity];
      textResponse =
        `📍 Focus sur ${foundCity}\n\n` +
        `👥 Population : ${data.population.toLocaleString()} habitants\n` +
        `🏢 Entreprises : ${data.entreprises.toLocaleString()}\n` +
        `🏖️ Score touristique : ${data.tourisme}/100\n` +
        `💼 Taux d'emploi : ${data.emploi}%\n` +
        `💰 Revenu moyen : ${data.revenu.toLocaleString()}€/an\n` +
        `🏭 Secteur dominant : ${data.secteur}\n` +
        `📏 Surface : ${data.surface ? data.surface.toFixed(2) + ' hectares' : 'N/A'}`;
    } else {
      textResponse = 
        "Je n'ai pas trouvé de ville dans votre demande. Essayez :\n" +
        "• Focus sur Nice\n" +
        "• Montre-moi Cannes\n" +
        "• Info sur Antibes";
    }
  }
  
  // ==================== COMPARAISON ====================
  else if (
    lowerQuestion.includes('compar') ||
    lowerQuestion.includes('différence') ||
    lowerQuestion.includes('versus') ||
    lowerQuestion.includes(' vs ')
  ) {
    // Chercher deux villes dans la question
    const foundCities: string[] = [];
    
    for (const cityName of Object.keys(cityData)) {
      const cityLower = cityName.toLowerCase();
      if (lowerQuestion.includes(cityLower)) {
        foundCities.push(cityName);
      }
    }
    
    if (foundCities.length >= 2) {
      const city1 = foundCities[0];
      const city2 = foundCities[1];
      const data1 = cityData[city1];
      const data2 = cityData[city2];
      
      mapActions.push({ type: 'highlight', cities: [city1, city2], animate: true, duration: 1000 });
      
      textResponse = 
        `📊 Comparaison : ${city1} vs ${city2}\n\n` +
        `👥 Population :\n  • ${city1}: ${data1.population.toLocaleString()}\n  • ${city2}: ${data2.population.toLocaleString()}\n\n` +
        `🏢 Entreprises :\n  • ${city1}: ${data1.entreprises.toLocaleString()}\n  • ${city2}: ${data2.entreprises.toLocaleString()}\n\n` +
        `💰 Revenu moyen :\n  • ${city1}: ${data1.revenu.toLocaleString()}€\n  • ${city2}: ${data2.revenu.toLocaleString()}€\n\n` +
        `💼 Emploi :\n  • ${city1}: ${data1.emploi}%\n  • ${city2}: ${data2.emploi}%\n\n` +
        `🏖️ Tourisme :\n  • ${city1}: ${data1.tourisme}/100\n  • ${city2}: ${data2.tourisme}/100`;
    } else {
      textResponse = "Pour comparer, mentionnez deux villes. Ex: 'Compare Nice et Cannes'";
    }
  }
  
  // ==================== STATISTIQUES GÉNÉRALES ====================
  else if (
    lowerQuestion.includes('statistique') ||
    lowerQuestion.includes('stats') ||
    lowerQuestion.includes('moyenne') ||
    lowerQuestion.includes('total')
  ) {
    const totalPopulation = Object.values(cityData).reduce((sum, city) => sum + city.population, 0);
    const totalEntreprises = Object.values(cityData).reduce((sum, city) => sum + city.entreprises, 0);
    const avgRevenu = Object.values(cityData).reduce((sum, city) => sum + city.revenu, 0) / Object.keys(cityData).length;
    const avgEmploi = Object.values(cityData).reduce((sum, city) => sum + city.emploi, 0) / Object.keys(cityData).length;
    
    textResponse = 
      `📈 Statistiques des Alpes-Maritimes (${Object.keys(cityData).length} communes) :\n\n` +
      `👥 Population totale : ${totalPopulation.toLocaleString()} habitants\n` +
      `🏢 Total entreprises : ${totalEntreprises.toLocaleString()}\n` +
      `💰 Revenu moyen : ${avgRevenu.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€/an\n` +
      `💼 Taux d'emploi moyen : ${avgEmploi.toFixed(1)}%\n\n` +
      `Posez des questions plus spécifiques pour explorer les données !`;
  }
  
  // ==================== AIDE ====================
  else if (
    lowerQuestion.includes('aide') ||
    lowerQuestion.includes('help') ||
    lowerQuestion.includes('que peux-tu') ||
    lowerQuestion.includes('quoi faire')
  ) {
    textResponse =
      "💡 Exemples de questions que vous pouvez poser :\n\n" +
      "📊 Population :\n  • Quelle est la ville la plus peuplée ?\n  • Top 5 villes les plus peuplées\n\n" +
      "🏢 Économie :\n  • Ville avec le plus d'entreprises\n  • Top 3 villes économiquement actives\n\n" +
      "💰 Revenus :\n  • Quelle ville a le revenu moyen le plus élevé ?\n  • Les 5 villes les plus riches\n  • Villes avec les revenus les plus faibles\n\n" +
      "💼 Emploi :\n  • Meilleur taux d'emploi\n  • Top 3 villes pour l'emploi\n\n" +
      "🏖️ Tourisme :\n  • Destination touristique la plus attractive\n  • Top 10 destinations touristiques\n\n" +
      "📏 Superficie :\n  • Quelle est la plus grande commune ?\n  • Les 5 plus petites villes\n\n" +
      "🏭 Secteurs :\n  • Villes en technologie\n  • Répartition des secteurs\n\n" +
      "🔍 Autres :\n  • Focus sur Nice\n  • Compare Nice et Cannes\n  • Statistiques générales";
  }
  
  // ==================== QUESTION NON RECONNUE ====================
  else {
    textResponse =
      "🤔 Je n'ai pas compris votre question. Voici ce que je peux faire :\n\n" +
      "• Analyser la population, l'emploi, les revenus\n" +
      "• Identifier les villes touristiques\n" +
      "• Comparer des communes\n" +
      "• Filtrer par secteur d'activité\n" +
      "• Focus sur une ville spécifique\n\n" +
      "Tapez 'aide' pour voir des exemples de questions.";
  }

  return {
    mapActions,
    textResponse,
    success: true,
  };
}

/**
 * Suggestions pour l'interface de requête
 */
export function getMap2DSuggestions(): string[] {
  return [
    'Quelle est la ville la plus peuplée ?',
    'Top 5 destinations touristiques',
    'Ville avec le meilleur revenu moyen',
    'Compare Nice et Cannes',
    'Villes en technologie',
    'Statistiques générales',
  ];
}
