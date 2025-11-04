// Données d'exemple pour tester l'application
// Remplacez ceci par de vraies données de votre base de données

import { Indicator, IndicatorCategory } from '@/types';

export const sampleCategories: IndicatorCategory[] = [
  {
    id: 'demographics',
    name: 'Démographie',
    description: 'Données de population, répartition par âge, statistiques migratoires'
  },
  {
    id: 'economy',
    name: 'Économie',
    description: 'Taux d\'emploi, PIB, secteurs d\'activité, niveaux de revenus'
  },
  {
    id: 'tourism',
    name: 'Tourisme',
    description: 'Arrivées touristiques, taux d\'occupation hôtelière, revenus touristiques'
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    description: 'Logement, transports, équipements publics'
  },
  {
    id: 'education',
    name: 'Éducation',
    description: 'Écoles, universités, niveaux d\'éducation'
  }
];

export const sampleIndicators: Indicator[] = [
  {
    id: 'pop-nice-2024',
    name: 'Population de Nice',
    category: 'Démographie',
    value: 342669,
    unit: 'habitants',
    year: 2024,
    source: 'INSEE',
    description: 'Population totale de la commune de Nice'
  },
  {
    id: 'pop-06-2024',
    name: 'Population des Alpes-Maritimes',
    category: 'Démographie',
    value: 1083310,
    unit: 'habitants',
    year: 2024,
    source: 'INSEE',
    description: 'Population totale du département des Alpes-Maritimes'
  },
  {
    id: 'unemployment-06-2024',
    name: 'Taux de chômage',
    category: 'Économie',
    value: 7.8,
    unit: '%',
    year: 2024,
    source: 'Pôle Emploi',
    description: 'Taux de chômage dans les Alpes-Maritimes'
  },
  {
    id: 'median-income-06-2023',
    name: 'Revenu médian',
    category: 'Économie',
    value: 23450,
    unit: '€/an',
    year: 2023,
    source: 'INSEE',
    description: 'Revenu annuel médian par ménage'
  },
  {
    id: 'tourism-arrivals-2024',
    name: 'Arrivées touristiques',
    category: 'Tourisme',
    value: 12500000,
    unit: 'visiteurs',
    year: 2024,
    source: 'CCI Nice Côte d\'Azur',
    description: 'Arrivées touristiques annuelles dans la région Côte d\'Azur'
  },
  {
    id: 'businesses-created-2024',
    name: 'Nouvelles entreprises créées',
    category: 'Économie',
    value: 15234,
    unit: 'entreprises',
    year: 2024,
    source: 'INSEE',
    description: 'Nombre de nouvelles entreprises créées en 2024'
  },
  {
    id: 'housing-units-2024',
    name: 'Total de logements',
    category: 'Infrastructure',
    value: 628950,
    unit: 'logements',
    year: 2024,
    source: 'INSEE',
    description: 'Nombre total de logements dans les Alpes-Maritimes'
  },
  {
    id: 'gdp-06-2023',
    name: 'PIB Alpes-Maritimes',
    category: 'Économie',
    value: 38.5,
    unit: 'milliards €',
    year: 2023,
    source: 'INSEE',
    description: 'Produit Intérieur Brut des Alpes-Maritimes'
  }
];

// Helper function to filter indicators
export function getIndicatorsByCategory(category: string): Indicator[] {
  return sampleIndicators.filter(ind => ind.category === category);
}

// Helper function to search indicators by keyword
export function searchIndicators(keyword: string): Indicator[] {
  const lowerKeyword = keyword.toLowerCase();
  return sampleIndicators.filter(ind => 
    ind.name.toLowerCase().includes(lowerKeyword) ||
    ind.description?.toLowerCase().includes(lowerKeyword) ||
    ind.category.toLowerCase().includes(lowerKeyword)
  );
}
