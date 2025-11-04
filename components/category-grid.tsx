'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, TrendingUp, Users, Building2 } from 'lucide-react';

const categories = [
  {
    id: 'demographics',
    name: 'Démographie',
    description: 'Population, répartition par âge, migrations',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    id: 'economy',
    name: 'Économie',
    description: 'Emploi, PIB, secteurs d\'activité',
    icon: TrendingUp,
    color: 'text-green-600'
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    description: 'Logement, transport, équipements',
    icon: Building2,
    color: 'text-purple-600'
  },
  {
    id: 'data',
    name: 'Toutes les données',
    description: 'Parcourir tous les indicateurs disponibles',
    icon: Database,
    color: 'text-orange-600'
  }
];

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <Card 
            key={category.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <Icon className={`h-8 w-8 mb-2 ${category.color}`} />
              <CardTitle className="text-lg">{category.name}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
