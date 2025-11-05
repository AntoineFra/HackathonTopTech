import { Map3DViewer } from "@/components/map3d/map-3d-viewer";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MapPage() {
    return (
        <div className="min-h-screen bg-slate-900">
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MapPin className="h-8 w-8 text-sky-400" />
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Carte 3D Interactive - Département 06
                            </h1>
                            <p className="text-sm text-slate-400">
                                Alpes-Maritimes / Nice Côte d&apos;Azur
                            </p>
                        </div>
                    </div>
                    <Link href="/">
                        <Button variant="outline">
                            Retour à l&apos;accueil
                        </Button>
                    </Link>
                </div>

                {/* 3D Map */}
                <Map3DViewer />

                {/* Instructions */}
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-white/10 p-4 text-white backdrop-blur-sm">
                        <h3 className="mb-2 text-sm font-semibold">
                            Navigation
                        </h3>
                        <ul className="space-y-1 text-xs text-slate-300">
                            <li>• Clic gauche + glisser : Rotation</li>
                            <li>• Molette : Zoom in/out</li>
                            <li>• Clic droit + glisser : Déplacement</li>
                        </ul>
                    </div>
                    <div className="rounded-lg bg-white/10 p-4 text-white backdrop-blur-sm">
                        <h3 className="mb-2 text-sm font-semibold">
                            Interaction
                        </h3>
                        <ul className="space-y-1 text-xs text-slate-300">
                            <li>
                                • Cliquez sur un bâtiment pour voir les détails
                            </li>
                            <li>• Changez le mode de visualisation</li>
                            <li>• Sélectionnez une commune pour zoomer</li>
                        </ul>
                    </div>
                    <div className="rounded-lg bg-white/10 p-4 text-white backdrop-blur-sm">
                        <h3 className="mb-2 text-sm font-semibold">
                            Visualisations
                        </h3>
                        <ul className="space-y-1 text-xs text-slate-300">
                            <li>• Rouge : Densité d&apos;entreprises</li>
                            <li>• Bleu : Population</li>
                            <li>• Vert : Score touristique</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
