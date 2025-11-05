import { BarChart3 } from "lucide-react";
import { QueryInterface } from "@/components/query-interface";

export default function Home() {
    return (
        <div className="from-background to-secondary/20 min-h-screen bg-gradient-to-b flex items-center">
            <main className="container mx-auto max-w-7xl px-4 py-8">
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
                    <QueryInterface />
                </div>
            </main>
        </div>
    );
}
