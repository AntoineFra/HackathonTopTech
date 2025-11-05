"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Sparkles } from "lucide-react";

export function QueryInterface() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [suggestions] = useState([
        "Quelle est la population de Nice ?",
        "Afficher les statistiques d'emploi pour 2025",
        "Quels sont les principaux secteurs économiques du territoire 06 ?",
        "Indicateurs touristiques pour la Côte d'Azur",
        "Démographie des Alpes-Maritimes",
        "Afficher les données de création d'entreprises",
    ]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        // Redirect to chat page with the query
        router.push(`/chat?q=${encodeURIComponent(query.trim())}`);
    };

    const handleSuggestionClick = (suggestion: string) => {
        router.push(`/chat?q=${encodeURIComponent(suggestion)}`);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Interrogez les données du territoire 06
                    </CardTitle>
                    <CardDescription>
                        Posez vos questions en langage naturel sur les
                        indicateurs socio-démographiques, les données
                        économiques et les statistiques du territoire Nice Côte
                        d&apos;Azur.
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
                                className="flex-1"
                            />
                            <Button type="submit" disabled={!query.trim()}>
                                <Search className="mr-2 h-4 w-4" />
                                Rechercher
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <p className="text-muted-foreground text-sm">
                                Suggestions :
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((suggestion, index) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className="hover:bg-accent cursor-pointer"
                                        onClick={() =>
                                            handleSuggestionClick(suggestion)
                                        }
                                    >
                                        {suggestion}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
