import { QueryInterface } from "@/components/query-interface";
import { CategoryGrid } from "@/components/category-grid";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, BarChart3 } from "lucide-react";

export default function Home() {
    return (
        <div className="from-background to-secondary/20 min-h-screen bg-gradient-to-b">
            <main className="container mx-auto max-w-7xl px-4 py-8">
                {/* En-tête */}
                <div className="mb-12 space-y-4 text-center">
                    <div className="mb-4 flex items-center justify-center gap-3">
                        <BarChart3 className="text-primary h-12 w-12" />
                        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                            Portail des Données du Territoire 06
                        </h1>
                    </div>
                    <p className="text-muted-foreground mx-auto max-w-3xl text-xl">
                        Outil intelligent pour interroger les indicateurs
                        socio-démographiques du territoire Nice Côte d&apos;Azur
                        (Alpes-Maritimes)
                    </p>
                    <p className="text-muted-foreground text-sm">
                        CCI Nice Côte d&apos;Azur - Explorateur de Données
                        Interactif
                    </p>
                </div>

                {/* Alerte statut IA */}
                <Alert className="mb-8 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-900 dark:text-amber-200">
                        <strong>Mode Développement :</strong> Les fonctions IA
                        sont prêtes à être connectées. Consultez{" "}
                        <code className="rounded bg-amber-100 px-1 py-0.5 text-xs dark:bg-amber-900">
                            lib/ai-service.ts
                        </code>{" "}
                        pour intégrer votre backend IA.
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
                                Parcourez les catégories de données disponibles
                                pour le territoire
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CategoryGrid />
                        </CardContent>
                    </Card>
                </div>

                {/* Section des fonctionnalités */}
                <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Questions en langage naturel
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">
                                Posez vos questions en français simple - aucune
                                connaissance technique requise
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Visualisations instantanées
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">
                                Obtenez des graphiques et tableaux clairs avec
                                vos résultats
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Limitations transparentes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">
                                Informations claires lorsque les données sont
                                indisponibles ou incertaines
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Pied de page */}
                <footer className="text-muted-foreground border-t py-8 text-center text-sm">
                    <p>
                        © 2025 CCI Nice Côte d&apos;Azur - Tous droits réservés
                    </p>
                    <p className="mt-2">
                        Portail de données socio-démographiques des
                        Alpes-Maritimes (06)
                    </p>
                </footer>
            </main>
        </div>
    );
}
