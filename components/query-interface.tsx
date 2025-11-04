'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { queryAI, getSuggestions } from '@/lib/ai-service';
import { AIResponse } from '@/types';
import { AIResponseDisplay } from './ai-response-display';

export function QueryInterface() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [suggestions] = useState([
    "Quelle est la population de Nice ?",
    "Afficher les statistiques d'emploi pour 2025",
    "Quels sont les principaux secteurs économiques du territoire 06 ?",
    "Indicateurs touristiques pour la Côte d'Azur",
    "Démographie des Alpes-Maritimes",
    "Afficher les données de création d'entreprises"
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setResponse(null);

    try {
      const result = await queryAI(query);
      setResponse(result);
    } catch (error) {
      setResponse({
        success: false,
        query,
        answer: 'Une erreur s\'est produite lors du traitement de votre question. Veuillez réessayer.',
        confidence: 0,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  return (
    <div className="space-y-6">
      {/* Saisie de la question */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Interrogez les données du territoire 06
          </CardTitle>
          <CardDescription>
            Posez vos questions en langage naturel sur les indicateurs socio-démographiques, 
            les données économiques et les statistiques du territoire Nice Côte d&apos;Azur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Ex : Quel est le taux de chômage à Nice ?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !query.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Rechercher
                  </>
                )}
              </Button>
            </div>

            {/* Suggestions rapides */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Suggestions :</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Affichage de la réponse */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">
                Analyse de votre question...
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {response && <AIResponseDisplay response={response} />}
    </div>
  );
}
