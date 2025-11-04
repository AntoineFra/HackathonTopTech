// Service IA - Fonctions de remplacement pour l'intégration IA
// Ces fonctions seront implémentées avec votre backend IA

import { AIResponse, Query, Indicator, SearchFilters } from '@/types';

/**
 * Fonction principale pour interroger l'IA avec du langage naturel
 * Sera connectée à votre backend IA (OpenAI, Claude, etc.)
 */
export async function queryAI(question: string): Promise<AIResponse> {
  // TODO: Implémenter l'intégration IA réelle
  // Cela devrait appeler votre service IA avec la question
  // et retourner des données structurées avec indicateurs et visualisations
  
  console.log('Requête IA :', question);
  
  // Simulated delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Correspondance simple par mots-clés pour la démo
  const lowerQuestion = question.toLowerCase();
  const { sampleIndicators, searchIndicators } = await import('./sample-data');
  
  let relevantIndicators: Indicator[] = [];
  let answer = '';
  
  // Correspondance de motifs simple (à remplacer par une vraie IA)
  if (lowerQuestion.includes('population') || lowerQuestion.includes('habitants')) {
    relevantIndicators = sampleIndicators.filter(ind => ind.name.includes('Population'));
    answer = `Selon les dernières données, voici les informations sur la population du territoire :\n\n`;
    relevantIndicators.forEach(ind => {
      answer += `- ${ind.name} : ${ind.value.toLocaleString('fr-FR')} ${ind.unit} (${ind.year})\n`;
    });
  } else if (lowerQuestion.includes('unemployment') || lowerQuestion.includes('chômage') || lowerQuestion.includes('emploi')) {
    relevantIndicators = sampleIndicators.filter(ind => 
      ind.name.includes('chômage') || ind.category === 'Économie'
    );
    answer = `Voici les statistiques d'emploi et économiques :\n\n`;
    relevantIndicators.forEach(ind => {
      answer += `- ${ind.name} : ${ind.value.toLocaleString('fr-FR')} ${ind.unit} (${ind.year})\n`;
    });
  } else if (lowerQuestion.includes('tourism') || lowerQuestion.includes('tourisme')) {
    relevantIndicators = sampleIndicators.filter(ind => ind.category === 'Tourisme');
    answer = `Données touristiques pour la région Côte d'Azur :\n\n`;
    relevantIndicators.forEach(ind => {
      answer += `- ${ind.name} : ${ind.value.toLocaleString('fr-FR')} ${ind.unit} (${ind.year})\n`;
    });
  } else if (lowerQuestion.includes('economic') || lowerQuestion.includes('économie') || lowerQuestion.includes('pib')) {
    relevantIndicators = sampleIndicators.filter(ind => ind.category === 'Économie');
    answer = `Indicateurs économiques pour les Alpes-Maritimes :\n\n`;
    relevantIndicators.forEach(ind => {
      answer += `- ${ind.name} : ${ind.value.toLocaleString('fr-FR')} ${ind.unit} (${ind.year})\n`;
    });
  } else {
    // Recherche générale
    relevantIndicators = searchIndicators(lowerQuestion).slice(0, 3);
    if (relevantIndicators.length > 0) {
      answer = `J'ai trouvé les indicateurs pertinents suivants :\n\n`;
      relevantIndicators.forEach(ind => {
        answer += `- ${ind.name} : ${ind.value.toLocaleString('fr-FR')} ${ind.unit} (${ind.year})\n`;
      });
    } else {
      answer = "Je n'ai pas trouvé de données spécifiques correspondant à votre question. Essayez de poser des questions sur :\n- Les statistiques de population\n- L'emploi et l'économie\n- Les données touristiques\n- Les indicateurs d'infrastructure";
    }
  }
  
  answer += `\n\nNote : Ceci est une démonstration utilisant des données d'exemple. Connectez votre service IA dans lib/ai-service.ts pour obtenir de vraies réponses.`;
  
  // Placeholder response with sample data
  return {
    success: true,
    query: question,
    answer,
    confidence: 0.75,
    indicators: relevantIndicators,
    visualizations: [],
    sources: relevantIndicators.map(ind => ind.source),
    limitations: "Utilise actuellement des données d'exemple pour la démonstration. Le service IA doit être connecté pour une utilisation en production."
  };
}

/**
 * Traiter la requête utilisateur et extraire les indicateurs pertinents
 */
export async function extractIndicators(query: string): Promise<Indicator[]> {
  // TODO: Implémenter l'extraction d'indicateurs depuis la requête
  // Cela devrait analyser la requête et récupérer les indicateurs pertinents depuis votre base de données
  
  console.log('Extraction des indicateurs pour :', query);
  
  return [];
}

/**
 * Obtenir des suggestions d'indicateurs basées sur une requête partielle
 */
export async function getSuggestions(partial: string): Promise<string[]> {
  // TODO: Implémenter l'autocomplétion/suggestions
  // Cela pourrait suggérer des requêtes courantes ou des noms d'indicateurs
  
  console.log('Obtention de suggestions pour :', partial);
  
  return [
    "Quelle est la population de Nice ?",
    "Afficher les statistiques de chômage",
    "Indicateurs économiques pour 2025",
    "Données touristiques pour la Côte d'Azur"
  ];
}

/**
 * Récupérer les indicateurs basés sur des filtres
 */
export async function fetchIndicators(filters: SearchFilters): Promise<Indicator[]> {
  // TODO: Connecter à votre source de données
  // Cela devrait récupérer les indicateurs depuis votre base de données selon les filtres
  
  console.log('Récupération des indicateurs avec filtres :', filters);
  
  return [];
}

/**
 * Générer des données de visualisation depuis les indicateurs
 */
export function generateVisualization(indicators: Indicator[], type: string) {
  // TODO: Implémenter la préparation des données de visualisation
  // Transformer les données d'indicateurs dans un format adapté aux graphiques
  
  console.log('Génération de visualisation :', type);
  
  return {
    type,
    title: "Visualisation des données",
    data: indicators,
    description: "La visualisation sera générée ici"
  };
}

/**
 * Valider et nettoyer l'entrée utilisateur
 */
export function sanitizeQuery(query: string): string {
  // Nettoyage basique
  return query.trim().slice(0, 500);
}

/**
 * Vérifier si le service IA est disponible
 */
export async function checkAIStatus(): Promise<boolean> {
  // TODO: Implémenter le contrôle de santé pour le service IA
  
  console.log('Vérification du statut du service IA');
  
  return false; // Pas encore connecté
}
