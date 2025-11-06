import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3, MapPin } from "lucide-react";
import { QueryInterface } from "@/components/query-interface";

export default function Home() {
    return (
        <main className="container mx-auto mt-16 max-w-7xl px-4 py-8">
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

                <p className="text-muted-foreground mr-2 self-center">
                    Ou explorez directement les données géospatiales sur une
                    carte via l&apos;IA :
                </p>

                <div className="flex justify-center gap-3 pt-4">
                    <Link href="/map2d">
                        <Button size="lg" className="gap-2" variant="outline">
                            <MapPin className="h-5 w-5" />
                            Carte 2D seule
                        </Button>
                    </Link>
                    <Link href="/map-threejs">
                        <Button size="lg" className="gap-2">
                            <MapPin className="h-5 w-5" />
                            Carte 3D seule
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
