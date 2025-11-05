"use client";

import { useState } from "react";
import { Map3DViewer } from "@/components/map3d/map-3d-viewer";
import { MapProvider, useMap } from "@/components/map3d/map-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Loader2, Sparkles, MapPin } from "lucide-react";
import { queryMapAI, getMapSuggestions } from "@/lib/map-ai-service";
import Link from "next/link";

function ChatMapInterface() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<string>("");
    const { applyMapAction } = useMap();

    const suggestions = getMapSuggestions();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || loading) return;

        setLoading(true);
        setResponse("");

        try {
            const result = await queryMapAI(query);

            // Apply map actions
            for (const action of result.mapActions) {
                applyMapAction(action);
            }

            // Set text response
            setResponse(result.textResponse);
        } catch {
            setResponse(
                "Une erreur s'est produite lors du traitement de votre question. Veuillez réessayer.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
    };

    return (
        <div className="flex h-screen flex-col bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-3">
                <div className="flex items-center gap-3">
                    <MapPin className="h-6 w-6 text-sky-400" />
                    <div>
                        <h1 className="text-lg font-bold text-white">
                            Carte Interactive 3D - Département 06
                        </h1>
                        <p className="text-xs text-slate-400">
                            Interrogez les données avec l&apos;IA
                        </p>
                    </div>
                </div>
                <Link href="/">
                    <Button variant="outline" size="sm">
                        Retour
                    </Button>
                </Link>
            </div>

            {/* Main content - Map */}
            <div className="relative flex-1">
                <Map3DViewer />
            </div>

            {/* Chat interface at bottom */}
            <div className="border-t border-slate-700 bg-slate-800/95 p-4 backdrop-blur-sm">
                <div className="mx-auto max-w-4xl space-y-3">
                    {/* Response display */}
                    {response && (
                        <Card className="border-slate-600 bg-slate-700/50">
                            <CardContent className="pt-4">
                                <div className="flex gap-2">
                                    <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" />
                                    <p className="text-sm whitespace-pre-line text-slate-100">
                                        {response}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Query input */}
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="Posez une question sur le département 06... (ex: Montre-moi les entreprises)"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            disabled={loading}
                            className="flex-1 border-slate-600 bg-slate-700 text-white placeholder:text-slate-400"
                        />
                        <Button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Analyse...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Envoyer
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Suggestions */}
                    {!loading && (
                        <div className="flex flex-wrap gap-2">
                            {suggestions
                                .slice(0, 4)
                                .map((suggestion, index) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className="cursor-pointer border-slate-600 text-slate-300 hover:bg-slate-700"
                                        onClick={() =>
                                            handleSuggestionClick(suggestion)
                                        }
                                    >
                                        {suggestion}
                                    </Badge>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function InteractiveMapPage() {
    return (
        <MapProvider>
            <ChatMapInterface />
        </MapProvider>
    );
}
