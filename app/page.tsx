import { QueryInterface } from '@/components/query-interface';
import { CategoryGrid } from '@/components/category-grid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* En-tête */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Portail des Données du Territoire 06
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Outil intelligent pour interroger les indicateurs socio-démographiques 
            du territoire Nice Côte d&apos;Azur (Alpes-Maritimes)
          </p>
          <p className="text-sm text-muted-foreground">
            CCI Nice Côte d&apos;Azur - Explorateur de Données Interactif
          </p>
        </div>

        {/* Alerte statut IA */}
        <Alert className="mb-8 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900 dark:text-amber-200">
            <strong>Mode Développement :</strong> Les fonctions IA sont prêtes à être connectées. 
            Consultez <code className="text-xs bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">
              lib/ai-service.ts
            </code> pour intégrer votre backend IA.
          </AlertDescription>
        </Alert>

        {/* Interface de requête principale */}
        <div className="mb-12">
          <QueryInterface />
        </div>

        {/* Vue d'ensemble des catégories */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Explorer par catégorie</CardTitle>
              <CardDescription>
                Parcourez les catégories de données disponibles pour le territoire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryGrid />
            </CardContent>
          </Card>
        </div>

        {/* Section des fonctionnalités */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Questions en langage naturel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Posez vos questions en français simple - aucune connaissance technique requise
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Visualisations instantanées</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Obtenez des graphiques et tableaux clairs avec vos résultats
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Limitations transparentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Informations claires lorsque les données sont indisponibles ou incertaines
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pied de page */}
        <footer className="text-center text-sm text-muted-foreground py-8 border-t">
          <p>© 2025 CCI Nice Côte d&apos;Azur - Tous droits réservés</p>
          <p className="mt-2">
            Portail de données socio-démographiques des Alpes-Maritimes (06)
          </p>
        </footer>
      </main>
    </div>
  );
}
