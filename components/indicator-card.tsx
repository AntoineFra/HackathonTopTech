'use client';

import { Indicator } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface IndicatorCardProps {
  indicator: Indicator;
}

export function IndicatorCard({ indicator }: IndicatorCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{indicator.name}</CardTitle>
            <CardDescription className="mt-1">
              {indicator.description || indicator.category}
            </CardDescription>
          </div>
          <Badge variant="secondary">{indicator.year}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold">
            {indicator.value} {indicator.unit}
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Catégorie : {indicator.category}</span>
            <span>Source : {indicator.source}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface IndicatorListProps {
  indicators: Indicator[];
}

export function IndicatorList({ indicators }: IndicatorListProps) {
  if (indicators.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun indicateur à afficher
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {indicators.map((indicator) => (
        <IndicatorCard key={indicator.id} indicator={indicator} />
      ))}
    </div>
  );
}
